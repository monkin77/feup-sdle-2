import { createLibp2p } from "libp2p";
import { tcp } from "@libp2p/tcp";
import { noise } from "@chainsafe/libp2p-noise";
import { mplex } from "@libp2p/mplex";
import { bootstrap } from "@libp2p/bootstrap";
import { pubsubPeerDiscovery } from "@libp2p/pubsub-peer-discovery";
import { gossipsub } from "@chainsafe/libp2p-gossipsub";
import { kadDHT } from "@libp2p/kad-dht";
import { discoveryTopic, getContent, publishMessage, putContent } from "../lib/peer-content.js";
import { parseBootstrapAddresses } from "../lib/parser.js";

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

    subscriptionHandler = (currSubscribedTopics) => async(evt) => {
        currSubscribedTopics
            .filter(topic => topic.condition(evt.detail.topic))
            .forEach(topic => {
                const data = new TextDecoder().decode(evt.detail.data);
                console.log("Decoded message: ", data);
                topic.action(data, evt);
            });
    };

    subscribeTopics() {
        // New post from a followed user
        this.subscribeTopic(
            topic => this.info.following.has(topic),
            async data => {
                this.info.timeline.push(data);
                await putContent(this.node, `/${this.username}-info`, this.info);
            }
        );

        // New follower
        this.subscribeTopic(
            `/${this.username}-follow`,
            async username => {
                this.info.followers.add(username);
                await putContent(this.node, `/${this.username}-info`, this.info);
                console.log("New node's info", await getContent(this.node, `/${this.username}-info`));
            }
        );

        // Unfollowed
        this.subscribeTopic(
            `/${this.username}-unfollow`,
            async username => {
                this.info.followers.delete(username);
                await putContent(this.node, `/${this.username}-info`, this.info);
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

        this.node.pubsub.addEventListener("message", this.subscriptionHandler(this.subscribedTopics));
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
        await putContent(this.node, `/${username}-info`, this.info);
    }

    /**
     * Logs in to an account.
     * @param {*} username
     */
    async login(username) {
        this.username = username;

        this.subscribeTopics();
        this.node.pubsub.subscribe(`/${this.username}-follow`);
        this.node.pubsub.subscribe(`/${this.username}-unfollow`);
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

    /**
     * Subscribe to a user and set the callback function to be called when a new message is received.
     * @param {*} username Username of the user to follow
     */
    async follow(username) {
        this.node.pubsub.subscribe(`/${username}`);

        await publishMessage(this.node, `/${username}-follow`, this.username);

        this.info.following.add(username);
        await putContent(this.node, `/${this.username}-info`, this.info);
    }

    /**
     * Unsubscribe from a user.
     * @param {*} username
     */
    async unfollow(username) {
        this.node.pubsub.unsubscribe(`/${username}`);
        this.info.following.delete(username);

        await publishMessage(this.node, `/${username}-unfollow`, this.username);
        await putContent(this.node, `/${this.username}-info`, this.info);
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

        this.info.timeline.push(post);

        await putContent(this.node, `/${this.username}-info`, this.info);

        return post;
    }

    /**
     * Get the followers of a user.
     * @param {*} username
     * @returns List with the user's followers.
     */
    async getFollowers(username) {
        const data = await getContent(this.node, `/${username}-info`);
        return data.followers;
    }

    /**
     * Reset this node's information.
     */
    resetInfo() {
        this.username = "",
        this.info = {
            followers: new Set(),
            following: new Set(),
            timeline: [],
        };

        this.loggedIn = false;
    }

    getNode() {
        return this.node;
    }

    isLoggedIn() {
        return this.username !== "";
    }
}

const singletonNode = new Node();
export default singletonNode;