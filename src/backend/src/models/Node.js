import { createLibp2p } from "libp2p";
import { tcp } from "@libp2p/tcp";
import { noise } from "@chainsafe/libp2p-noise";
import { mplex } from "@libp2p/mplex";
import { bootstrap } from "@libp2p/bootstrap";
import { pubsubPeerDiscovery } from "@libp2p/pubsub-peer-discovery";
import { gossipsub } from "@chainsafe/libp2p-gossipsub";
import { kadDHT } from "@libp2p/kad-dht";
import { discoveryTopic, collectInfo, provideInfo, unprovideInfo, publishMessage, putContent } from "../lib/peer-content.js";
import { parseBootstrapAddresses } from "../lib/parser.js";
import { Info } from "../models/Info.js";
import { addFollower, addFollowing, addPost, deleteUserData, garbageCollect, getUserData, removeFollower, removeFollowing, saveUserData } from "../lib/storage.js";
import { buildStatusRes, parseError } from "../lib/utils.js";
import { mdns } from "@libp2p/mdns";
import { sendSseResponse } from "../lib/sse.js";


const GARBAGE_COLLECT_INTERVAL = 1000 * 60 * 60; // 1 hour

const getNodeOptions = () => {
    const bootstrapAddresses = parseBootstrapAddresses();
    return {
        // Libp2p Modules Documentation: https://github.com/libp2p/js-libp2p/blob/master/doc/CONFIGURATION.md#modules
        addresses: {
            listen: ["/ip4/0.0.0.0/tcp/0"], // TODO: Check this and consider changing
        },
        transports: [tcp()],
        connectionEncryption: [noise()],
        streamMuxers: [mplex()],
        pubsub: gossipsub({ allowPublishToZeroPeers: true, emitSelf: false }),
        peerDiscovery: [
            bootstrap({
                interval: 60e3,
                list: bootstrapAddresses,
            }),
            pubsubPeerDiscovery({
                interval: 1000,
                topics: [],
            }),
            mdns({
                interval: 1000,
            })
        ],
        dht: kadDHT(),
        connectionManager: {
            autoDial: true, // auto connect to discovered peers
        },
    };
};

class Node {

    constructor() {
        /**
         * Array of objects containing information about subscribed topics: conditions and actions.
         * A condition is a function that will be compared with the received event's topic.
         * An action is the function to be called when the condition is met.
         */
        this.subscribedTopics = [];
        this.resetInfo();
    }


    subscriptionHandler = () => async(evt) => {
        singletonNode.subscribedTopics
            .filter(topic => topic.condition(evt.detail.topic))
            .forEach(topic => {
                const data = new TextDecoder().decode(evt.detail.data);
                topic.action(data, evt);
            });
    };

    subscribeTopics() {
        // New post from a followed user
        this.subscribeTopic(
            topic => this.profile.hasFollowing(topic.substring(1)),
            async(data, evt) => {
                const username = evt.detail.topic.substring(1);

                const newPostStatus = await addPost(username, JSON.parse(data));

                if (newPostStatus && (this.sseResponse != null)) {
                    // Notify the web app that a new post arrived
                    sendSseResponse(this.sseResponse, data);
                }
            }
        );

        // New follower
        this.subscribeFollowVariantTopic("wasFollowed");

        // New following
        this.subscribeFollowVariantTopic("followed");

        // New unfollower
        this.subscribeFollowVariantTopic("wasUnfollowed");

        // New unfollowing
        this.subscribeFollowVariantTopic("unfollowed");
    }

    /**
     * Subscribe to a topic that will be triggered when a user follows or unfollows another user or a user is followed or unfollowed by another user.
     * @param {string} variant One of {'wasFollowed', 'followed', 'wasUnfollowed', 'unfollowed'}
     */
    subscribeFollowVariantTopic(variant) {
        this.subscribeTopic(
            topic => {
                const username = topic.substring(1, topic.length - `-${variant}`.length);
                return username === this.username || this.profile.hasFollowing(username);
            },
            async(dataUsername, evt) => {
                const topic = evt.detail.topic;
                const username = topic.substring(1, topic.length - `-${variant}`.length);
                if (variant === "wasFollowed") {
                    if (username === this.username) this.profile.addFollowers(dataUsername);
                    await addFollower(username, dataUsername);
                } else if (variant === "followed") {
                    if (username === this.username) this.profile.addFollowing(dataUsername);
                    await addFollowing(username, dataUsername);
                } else if (variant === "wasUnfollowed") {
                    if (username === this.username) this.profile.removeFollowers(dataUsername);
                    await removeFollower(username, dataUsername);
                } else if (variant === "unfollowed") {
                    if (username === this.username) this.profile.removeFollowing(dataUsername);
                    await removeFollowing(username, dataUsername);
                } else
                    throw new Error("Topic not implemented");
            }
        );
    }

    subscribeTopic(condition, action) {
        const parsedCondition = typeof condition === "function" ? condition : (topic) => topic === condition;
        this.subscribedTopics.push({
            condition: parsedCondition,
            action
        });
    }

    /**
     * Function to unsubscribe from all the topics except the node's discovery topic. 
     * The node keeps working without being authenticated.
     */
    unsubscribeAll() {
        const topics = this.node.pubsub.getTopics();
        topics.forEach(topic => {
            if (topic !== discoveryTopic) {
                this.node.pubsub.unsubscribe(topic);
            }
        });

        // we must also reset the handlers of the subscribed topics
        this.subscribedTopics = [];
    }

    async start() {
        const nodeOptions = getNodeOptions();
        this.node = await createLibp2p(nodeOptions);

        await this.node.start();
        console.log("Node has started");

        this.node.addEventListener("peer:discovery", () => {
            //console.log("Discovered ", e.detail.id.toString());
        });

        this.node.connectionManager.addEventListener("peer:connect", (e) => {
            console.log("Connected to ", e.detail.remotePeer.toString());
        });

        const listenAddresses = this.node.getMultiaddrs();
        console.log("Listening on addresses: ", listenAddresses);

        this.resetInfo();

        this.node.pubsub.addEventListener("message", this.subscriptionHandler());
    }

    async stop() {
        await this.node.stop();
        console.log("Node has stopped");
    }

    /**
     * Registers an account by placing its 'password' in the DHT with the key '/<username>'.
     * @param {*} username
     * @param {*} password
     */
    async register(username, password) {
        await putContent(this.node, `/${username}`, password);
    }

    /**
     * Logs in to an account.
     * @param {*} username username in which we want to log in
     * @param {*} hashedPassword encrypted password
     */
    async login(username, hashedPassword) {
        this.username = username;

        const { error: collectErr, data: collectedInfo } = await collectInfo(username);
        if (!collectErr) {
            this.profile = new Info(collectedInfo);
            console.log("Recovered account info: ", this.profile);
        } else {
            this.profile = new Info();
            console.log("Account's info not found. Inserting new info");
        }

        this.loggedIn = true;
        // This should be always null on this point but we do it just in case
        if (!this.garbageInterval)
            this.garbageInterval = setInterval(async() => await garbageCollect(), GARBAGE_COLLECT_INTERVAL);


        // Re-write the password so the new nodes have them in their DHT
        await putContent(this.node, `/${this.username}`, hashedPassword);

        // Subscribe to the user's topics
        this.subscribeTopics();
        this.node.pubsub.subscribe(`/${this.username}-wasFollowed`);
        this.node.pubsub.subscribe(`/${this.username}-wasUnfollowed`);

        await provideInfo(this.username);

        // Collect all following users info, provide it and subscribe to their topics
        const following = Array.from(this.profile.getFollowing());
        following.forEach(async(user) => {
            const { error: collectErr, data: followUserInfo } = await collectInfo(user);
            if (collectErr) return;

            await saveUserData(user, followUserInfo);
            await provideInfo(user);

            this.node.pubsub.subscribe(`/${user}`);
            this.node.pubsub.subscribe(`/${user}-wasFollowed`);
            this.node.pubsub.subscribe(`/${user}-wasUnfollowed`);
            this.node.pubsub.subscribe(`/${user}-followed`);
            this.node.pubsub.subscribe(`/${user}-unfollowed`);
        });

        await saveUserData(this.username, this.profile.toDict());
    }

    /**
     * Function to logout of account. 
     * Clears all the node's data and logouts.
     */
    async logout() {
        this.unsubscribeAll();
        this.resetInfo();

        // clear garbage collect interval
        clearInterval(this.garbageInterval);
        this.garbageInterval = null;
    }

    /**
     * Follows a user, subscribe to a user topic and set the callback function to be called when a new message is received.
     * @param {*} followUsername Username of the user to follow
     * @returns {status, error} json object with the status (200, 404, 500) of the operation and the error if any
     */
    async follow(followUsername) {
        const { error: collectErr, data: followUserInfo } = await collectInfo(followUsername);
        if (collectErr) return parseError(collectErr);

        this.profile.addFollowing(followUsername);
        await saveUserData(this.username, this.profile.toDict());

        // store the followed user info
        followUserInfo.followers.push(this.username);
        await saveUserData(followUsername, followUserInfo);

        await provideInfo(followUsername);

        this.node.pubsub.subscribe(`/${followUsername}`);
        this.node.pubsub.subscribe(`/${followUsername}-wasFollowed`);
        this.node.pubsub.subscribe(`/${followUsername}-wasUnfollowed`);
        this.node.pubsub.subscribe(`/${followUsername}-followed`);
        this.node.pubsub.subscribe(`/${followUsername}-unfollowed`);

        await publishMessage(this.node, `/${followUsername}-wasFollowed`, this.username);
        await publishMessage(this.node, `/${this.username}-followed`, followUsername);

        return {status: 200, error: null};
    }

    /**infoReq
     * Unsubscribe from a user.
     * @param {*} unfollowUsername
     */
    async unfollow(unfollowUsername) {
        this.node.pubsub.unsubscribe(`/${unfollowUsername}`);
        this.node.pubsub.unsubscribe(`/${unfollowUsername}-wasFollowed`);
        this.node.pubsub.unsubscribe(`/${unfollowUsername}-wasUnfollowed`);
        this.node.pubsub.unsubscribe(`/${unfollowUsername}-followed`);
        this.node.pubsub.unsubscribe(`/${unfollowUsername}-unfollowed`);

        unprovideInfo(this.node, unfollowUsername);

        this.profile.removeFollowing(unfollowUsername);
        await saveUserData(this.username, this.profile.toDict());

        await publishMessage(this.node, `/${unfollowUsername}-wasUnfollowed`, this.username);
        await publishMessage(this.node, `/${this.username}-unfollowed`, unfollowUsername);

        // remove the user from the local storage
        deleteUserData(unfollowUsername);
    }

    /**
     * Function to add a new post
     * @param {*} text Post content message
     * @returns New created post.
     */
    async post(text) {
        const post = {
            username: this.username,
            text: text,
            timestamp: Date.now(),
        };

        this.profile.addPost(post);
        await saveUserData(this.username, this.profile.toDict());

        await publishMessage(this.node, `/${this.username}`, JSON.stringify(post));

        return post;
    }

    /**
     * Reset this node's information.
     */
    resetInfo() {
        // Store profile info of a node when it is logged in
        this.profile = null;
        this.loggedIn = false;
        this.username = "";
        this.sseResponse = null; // Response object to send SSE messages
    }

    /**
     * Sets the sseResponse property when a new SSE connection is established by the web client.
     * @param {*} response 
     */
    setSSEResponse(response) {
        this.sseResponse = response;
    }

    getNode() {
        return this.node;
    }

    isLoggedIn() {
        return this.loggedIn;
    }

    /**
     * Function that returns a user's info. If the user is the currently logged in user, gets the info from the profile.
     * Otherwise, fetches it from persistent memory
     * @param {string} targetUsername 
     * @returns {Dict} {error: error, data: data} data -> Dictionary with user's info
     */
    async getInfo(targetUsername) {
        // If the user is the currently logged in user
        if (targetUsername === this.username && this.isLoggedIn())
            return buildStatusRes(null, this.profile.toDict());

        const result = await getUserData(targetUsername);
        if (result.error) {
            console.log(`Error reading user data so we can't retrieve the information: ${result.error}`);
        }

        return result;
    }

    getUsername() {
        return this.username;
    }
}

const singletonNode = new Node();
export default singletonNode;