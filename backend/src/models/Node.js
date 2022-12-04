import {createLibp2p} from "libp2p";
import {tcp} from "@libp2p/tcp";
import {noise} from "@chainsafe/libp2p-noise";
import {mplex} from "@libp2p/mplex";
import {bootstrap} from "@libp2p/bootstrap";
import {pubsubPeerDiscovery} from "@libp2p/pubsub-peer-discovery";
import {gossipsub} from "@chainsafe/libp2p-gossipsub";
import {kadDHT} from "@libp2p/kad-dht";
import {getContent, putContent} from "../lib/dht.js";
import {parseBootstrapAddresses} from "../lib/parser.js";

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
        pubsub: gossipsub({allowPublishToZeroPeers: true, emitSelf: true}),
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
    subscriptionHandler = async (evt) => {
        if (evt.detail.topic === "_peer-discovery._p2p._pubsub") {
            return;
        }

        // If the event is from a Topic of the Following Users, it's a post Message
        if (this.info.following.includes(evt.detail.topic)) {
            const data = JSON.parse(new TextDecoder().decode(evt.detail.data));
            this.info.timeline.push(data);

            await putContent(this.node, `/${this.info.username}-info`, this.info);

        } else if (evt.detail.topic === "/" + this.info.username + "/follow") {
            // If the event is from the Followers Topic, is a Follow Message
            const username = new TextDecoder().decode(evt.detail.data);
            this.info.followers.push(username);

            await putContent(this.node, `/${this.info.username}-info`, this.info);

        } else if (evt.detail.topic === "/" + this.info.username + "/unfollow") {
            // If the event is from the Followers Topic, is a Unfollow Message
            const username = new TextDecoder().decode(evt.detail.data);

            this.info.followers.splice(
                this.info["followers"].indexOf(username),
                1
            );

            await putContent(this.node, `/${this.info.username}-info`, this.info);
        }
    };

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

        this.loggedIn = false;
        this.resetInfo();

        this.node.pubsub.addEventListener("message", this.subscriptionHandler);
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
        this.info.username = username;
        this.loggedIn = true;

        this.node.pubsub.subscribe(`/${this.info.username}/follow`);
        this.node.pubsub.subscribe(`/${this.info.username}/unfollow`);
    }

    /**
     * Function to logout of account. Stops the node and restarts it for a later login.
     */
    async logout() {
        await this.stop();
        await this.start();
    }

    /**
     * Subscribe to a user and set the callback function to be called when a new message is received.
     * @param {*} username Username of the user to follow
     */
    async follow(username) {
        this.node.pubsub.subscribe(username);

        await this.node.pubsub.publish(
            `/${username}/follow`,
            new TextEncoder().encode(this.info.username)
        );

        this.info.following.push(username);
        await putContent(this.node, `/${username}-info`, this.info);
    }

    /**
     * Unsubscribe from a user.
     * @param {*} username
     */
    async unfollow(username) {
        this.node.pubsub.unsubscribe(username);
        this.info.following.splice(
            this.info["following"].indexOf(username),
            1
        );

        await this.node.pubsub.publish(
            `/${username}/unfollow`,
            new TextEncoder().encode(this.info.username)
        );

        await putContent(this.node, `/${username}-info`, this.info);
    }

    /**
     * Function to post a message.
     * @param {*} text Post content message
     * @returns  success: true if the post was successful, false with error otherwise.
     */
    async post(text) {
        if (!this.loggedIn)
            return {success: false, message: "You must login"};

        try {
            const post = {
                username: this.info.username,
                text: text,
                timestamp: Date.now(),
            };

            await this.node.pubsub.publish(
                this.info.username,
                new TextEncoder().encode(JSON.stringify(post))
            );

            this.info.posts.push(post);
            this.info.timeline.push(post);

            await putContent(this.node, `/${this.info.username}-info`, this.info);

            return {success: true, message: "Post successful"};
        } catch (err) {
            console.log("err: ", err);
            return {success: false, error: "Failed to post"};
        }
    }

    /**
     * Get the followers of a user.
     * @param {*} username
     * @returns success: true with followers if could get the followers, false with error message otherwise.
     */
    async getFollowers(username) {
        //
        try {
            const data = await getContent(this.node, `/${username}-info`);
            return {success: true, data: data};
        } catch (err) {
            return {success: false, error: "User does not exist"};
        }
    }

    /**
     * Reset this node's information.
     */
    resetInfo() {
        this.info = {
            username: "",
            followers: [],
            following: [],
            timeline: [],
            posts: [],
        };
    }

    getNode() {
        return this.node;
    }

    isLoggedIn() {
        return this.loggedIn;
    }
}

const singletonNode = new Node();
export default singletonNode;
