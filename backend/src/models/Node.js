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
        pubsub: gossipsub({ allowPublishToZeroPeers: true, emitSelf: true }),
        peerDiscovery: [
            bootstrap({
                interval: 60e3,
                list: bootstrapAddresses,
            }),
            pubsubPeerDiscovery({
                interval: 1000,
                topics: [],
            }),
        ],
        dht: kadDHT(),
        connectionManager: {
            autoDial: true, // auto connect to discovered peers
        },
    };
};

class Node {
    /**
     * Array of objects containing information about subscribed topics: conditions and actions.
     * A condition is a function that will be compared with the received event's topic.
     * An action is the function to be called when the condition is met.
     */
    subscribedTopics = [];

    subscriptionHandler = () => async (evt) => {
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
            topic => this.info().hasFollowing(topic),
            async data => {
                this.info().addPost(data);
            }
        );

        // New follower
        this.subscribeTopic(
            `/${this.username}-follow`,
            async username => {
                this.info().addFollowers(username);
            }
        );

        // Unfollowed
        this.subscribeTopic(
            `/${this.username}-unfollow`,
            async username => {
                this.info().removeFollowers(username);
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

        this.node.addEventListener("peer:discovery", (e) => {
            console.log("Discovered ", e.detail.id.toString());
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
     * Registers an account.
     * @param {*} username
     * @param {*} password
     */
    async register(username, password) {
        await putContent(this.node, `/${username}`, password);
    }

    /**
     * Logs in to an account.
     * @param {*} username
     */
    async login(username) {
        this.username = username;
        this.profiles[this.username] = new Info();

        this.subscribeTopics();
        this.node.pubsub.subscribe(`/${this.username}-follow`);
        this.node.pubsub.subscribe(`/${this.username}-unfollow`);

        await provideInfo(this, this.username);
    }

    /**
     * Function to logout of account. 
     * Clears all the node's data and logouts.
     */
    async logout() {
        this.unsubscribeAll();
        this.resetInfo();
    }

    /**
     * Subscribe to a user and set the callback function to be called when a new message is received.
     * @param {*} followUsername Username of the user to follow
     */
    async follow(followUsername) {
        this.node.pubsub.subscribe(`/${followUsername}`);

        await publishMessage(this.node, `/${followUsername}-follow`, this.username);

        this.info().addFollowing(followUsername);

        const followUserInfo = await collectInfo(this, followUsername);
        this.setInfo(followUsername, followUserInfo);
        await provideInfo(this, followUsername);
    }

    /**
     * Unsubscribe from a user.
     * @param {*} unfollowUsername
     */
    async unfollow(unfollowUsername) {
        this.node.pubsub.unsubscribe(`/${unfollowUsername}`);
        this.info().removeFollowing(unfollowUsername);

        await publishMessage(this.node, `/${unfollowUsername}-unfollow`, this.username);
        unprovideInfo(this.node, unfollowUsername);
    }

    /**
     * Function to post a message.
     * @param {*} text Post content message
     * @returns New created post.
     */
    async post(text) {
        const post = {
            username: this.username,
            text: text,
            timestamp: Date.now(),
        };

        await publishMessage(this.node, `/${this.username}`, JSON.stringify(post));

        this.info().addPost(post);

        return post;
    }

    /**
     * Reset this node's information.
     */
    resetInfo() {
        this.username = "";
        this.profiles = {};
    }

    getNode() {
        return this.node;
    }

    isLoggedIn() {
        return this.username !== "";
    }

    /**
     * @param {string} username 
     * @returns json with the user's information.
     */
    getInfo(username) {
        if (this.profiles[username]) {
            return this.profiles[username].toJson();
        }
        return {};
    }

    /**
     * @param {string} username 
     * @param {object} info Json object with the user's information.
     */
    setInfo(username, info) {
        this.profiles[username] = new Info(info);
    }

    /**
     * Alias fot this.profiles[this.username]
     * @returns Logged in user's info.
     */
    info() {
        return this.profiles[this.username];
    }
}

const singletonNode = new Node();
export default singletonNode;