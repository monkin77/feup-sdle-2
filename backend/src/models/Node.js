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
import {comparePassword, hashPassword} from "../lib/passwords.js";

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
        if (this.node.info.following.includes(evt.detail.topic)) {
            const data = JSON.parse(new TextDecoder().decode(evt.detail.data));
            this.node.info.timeline.push(data);

            await putContent(this.node, `/${this.node.info.username}-info`, this.node.info);
        } else if (evt.detail.topic === "/" + this.node.info.username + "/follow") {
            // If the event is from the Followers Topic, is a Follow Message
            const username = new TextDecoder().decode(evt.detail.data);
            this.node.info.followers.push(username);

            await putContent(this.node, `/${this.node.info.username}-info`, this.node.info);
        } else if (evt.detail.topic === `/${this.node.info.username}-unfollow`) {
            // If the event is from the Followers Topic, is a Unfollow Message
            const username = new TextDecoder().decode(evt.detail.data);
            this.node.info.followers.splice(
                this.node.info.followers.indexOf(username),
                1
            );

            await putContent(this.node, `/${this.node.info.username}-info`, this.node.info);
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

        this.node.isLoggedIn = false;
        this.resetInfo();

        this.node.pubsub.addEventListener("message", this.subscriptionHandler);
    }

    async stop() {
        await this.node.stop();
        console.log("Node has stopped");
    }

    /**
     * Function to register an account.
     * To do so, it checks if the account already exists on content routing, and if not, it creates it.
     * @param {*} username
     * @param {*} password
     * @returns true if the account was registered successfully, false otherwise.
     */
    async register(username, password) {
        try {
            await getContent(this.node, `/${username}`);
            return {success: false, message: "Username already exists"};
        } catch (err) {
            if (err.code !== "ERR_NOT_FOUND" && err.code !== "ERR_NO_PEERS_IN_ROUTING_TABLE") {
                return {success: false, message: "Error while registering"};
            }

            // If the account does not exist, create it
            const hashedPassword = await hashPassword(password);
            await putContent(this.node, `/${username}`, hashedPassword);
            await putContent(this.node, `/${username}-info`, this.node.info);

            return {success: true, message: "Registration successful"};
        }
    }

    /**
     * Function to login to an account.
     * @param {*} username
     * @param {*} password
     * @returns success: true if the login was successful, false with error otherwise.
     */
    async login(username, password) {

        if (this.node.isLoggedIn)
            return {success: false, message: "Already logged in"};

        try {
            const hashedPass = await getContent(this.node, `/${username}`);

            if (await comparePassword(password, hashedPass)) {
                this.node.info.username = username;
                this.node.isLoggedIn = true;

                this.node.pubsub.subscribe("/" + this.node.info.username + "/follow");
                this.node.pubsub.subscribe("/" + this.node.info.username + "/unfollow");

                return {success: true, message: "Login successful"};
            } else {
                return {success: false, message: "Wrong password"};
            }
        } catch (err) {
            console.log("err: ", err);
            return {success: false, message: "Username does not exist"};
        }
    }

    /**
     * Function to logout of account.
     * @returns success: true if the login was successful, false with error otherwise.
     */
    async logout() {
        if (!this.node.isLoggedIn)
            return {success: false, message: "Already logged out"};

        await this.stop();
        await this.start();
        return {success: true, message: "Logged out successfully"};
    }

    /**
     * Subscribe to a user and set the callback function to be called when a new message is received.
     * @param {*} username Username of the user to follow
     */
    async follow(username) {
        if (!this.node.isLoggedIn) {
            return {success: false, message: "You must login"};
        } else if (this.node.info.following.includes(username)) {
            return {success: false, message: "Already following"};
        } else if (this.node.info.username === username) {
            return {success: false, message: "You cannot follow yourself"};
        }

        try {
            await getContent(this.node, `/${username}`);

            // username exists so we can follow it
            this.node.pubsub.subscribe(username);

            this.node.pubsub.publish(
                `/${username}-follow`,
                new TextEncoder().encode(this.node.info.username)
            );

            this.node.info.following.push(username);
            await putContent(this.node, `/${username}-info`, this.node.info);

            return {success: true, message: `Follow successful user ${username}`};
        } catch (err) {
            return {success: false, message: "User does not exist"};
        }
    }

    /**
     * Unsubscribe from a user.
     * @param {*} username
     */
    async unfollow(username) {
        if (!this.node.isLoggedIn)
            return {success: false, message: "You must login"};
        else if (!this.node.info.following.includes(username))
            return {success: false, message: "You are not following this user"};

        try {
            await getContent(this.node, `/${username}`);

            // username exists so we can unfollow it
            this.node.pubsub.unsubscribe(username);
            this.node.info.following.splice(
                this.node.info.following.indexOf(username),
                1
            );

            this.node.pubsub.publish(
                `/${username}-unfollow`,
                new TextEncoder().encode(this.node.info.username)
            );

            await putContent(this.node, `/${username}-info`, this.node.info);

            return {success: true, message: `Unfollow successful user ${username}`};
        } catch (err) {
            return {success: false, message: "User does not exist"};

        }
    }

    /**
     * Function to post a message.
     * @param {*} text Post content message
     * @returns  success: true if the post was successful, false with error otherwise.
     */
    async post(text) {
        if (!this.node.isLoggedIn)
            return {success: false, message: "You must login"};

        try {
            const post = {
                username: this.node.info.username,
                text: text,
                timestamp: Date.now(),
            };

            await this.node.pubsub.publish(
                this.node.info.username,
                new TextEncoder().encode(JSON.stringify(post))
            );

            this.node.info.posts.push(post);
            this.node.info.timeline.push(post);

            await putContent(this.node, `/${this.node.info.username}-info`, this.node.info);

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
        this.node.info = {
            username: "",
            followers: [],
            following: [],
            timeline: [],
            posts: [],
        };
    }
}

const singletonNode = new Node();
export default singletonNode;
