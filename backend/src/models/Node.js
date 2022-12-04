import { createLibp2p } from "libp2p";
import { tcp } from "@libp2p/tcp";
import { noise } from "@chainsafe/libp2p-noise";
import { mplex } from "@libp2p/mplex";
import { bootstrap } from "@libp2p/bootstrap";
import { pubsubPeerDiscovery } from "@libp2p/pubsub-peer-discovery";
import { gossipsub } from "@chainsafe/libp2p-gossipsub";
import { kadDHT } from "@libp2p/kad-dht";
import { hashPassword, comparePassword } from "../utils.js";

const getNodeOptions = () => {
    const bootstrap1 = `/ip4/${process.env.BOOTSTRAP_1_IP}/tcp/${process.env.BOOTSTRAP_1_PORT}/p2p/${process.env.BOOTSTRAP_1_ID}`;
    const bootstrap2 = `/ip4/${process.env.BOOTSTRAP_2_IP}/tcp/${process.env.BOOTSTRAP_2_PORT}/p2p/${process.env.BOOTSTRAP_2_ID}`;
    const bootstrap3 = `/ip4/${process.env.BOOTSTRAP_3_IP}/tcp/${process.env.BOOTSTRAP_3_PORT}/p2p/${process.env.BOOTSTRAP_3_ID}`;
    const bootstrapAddresses = [bootstrap1, bootstrap2, bootstrap3];
    //console.log(bootstrapAddresses);
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

        this.node.pubsub.addEventListener("message", (evt) => {
            if (evt.detail.topic === "_peer-discovery._p2p._pubsub") {
                return;
            }

            // If the event is from a Topic of the Following Users, is a post Message
            if (this.node.info.following.includes(evt.detail.topic)) {
                const data = JSON.parse(new TextDecoder().decode(evt.detail.data));
                this.node.info.timeline.push(data);

                console.log("Post: ", data.text);
            } else if ( evt.detail.topic === "/" + this.node.info.username + "/follow" ) {
                // If the event is from the Followers Topic, is a Follow Message
                const username = new TextDecoder().decode(evt.detail.data);
                this.node.info.followers.push(username);

                console.log("Followed by: ", username);
            } else if (evt.detail.topic === "/" + this.node.info.username + "/unfollow") {
                // If the event is from the Followers Topic, is a Unfollow Message
                const username = new TextDecoder().decode(evt.detail.data);

                this.node.info.followers.splice(
                    this.node.info["followers"].indexOf(username),
                    1
                );
                console.log("Unfollowed by: ", username);
                console.log("Followers: ", this.node.info.followers);
            }
        });
    }

    /**
   * Function to register an account.
   * To do so, it checks if the account already exists on content routing, and if not, it creates it.
   * @param {*} username
   * @param {*} password
   * @returns true if the account was registered successfully, false otherwise.
   */
    async register(username, password) {
    //const cid = CID.parse(username, "base64");

        try {
            // get the username content routing of node
            await this.node.contentRouting.get(
                new TextEncoder().encode("/" + username)
            );
            return { success: false, message: "Username already exists" };
        } catch (err) {
            //console.log('err: ', err);

            if (
                err.code !== "ERR_NOT_FOUND" &&
        err.code !== "ERR_NO_PEERS_IN_ROUTING_TABLE"
            ) {
                return { success: false, message: "Error following user" };
            }

            // username does not exist so we can register it
            const hashPass = await hashPassword(password);

            await this.node.contentRouting.put(
                new TextEncoder().encode("/" + username),
                new TextEncoder().encode(hashPass)
            );

            return { success: true, message: "Registration successful" };
        }
    }

    /**
   * Function to reset the info of the node
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

    /**
   * Function to login to an account.
   * @param {*} username
   * @param {*} password
   * @returns success: true if the login was successful, false with error otherwise.
   */
    async login(username, password) {
        if (this.node.isLoggedIn)
            return { success: false, message: "Already logged in" };

        try {
            // get the username content routing of node
            let hashedPass = await this.node.contentRouting.get(
                new TextEncoder().encode("/" + username)
            );

            hashedPass = new TextDecoder().decode(hashedPass);

            if (await comparePassword(password, hashedPass)) {
                this.node.info.username = username;
                this.node.isLoggedIn = true;

                this.node.pubsub.subscribe("/" + this.node.info.username + "/follow");
                this.node.pubsub.subscribe("/" + this.node.info.username + "/unfollow");

                return { success: true, message: "Login successful" };
            } else {
                return { success: false, message: "Wrong password" };
            }
        } catch (err) {
            console.log("err: ", err);
            return { success: false, message: "Username does not exist" };
        }
    }

    /**
   * Function to logout of account.
   * @returns success: true if the login was successful, false with error otherwise.
   */
    async logout() {
        if (!this.node.isLoggedIn)
            return { success: false, message: "Already logged out" };

        await this.stop();
        await this.start();
        return { success: true, message: "Logged out successfully" };
    }

    /**
   * Subscribe to a user and set the callback function to be called when a new message is received.
   * @param {*} username Username of the user to follow
   */
    async follow(username) {
        if (!this.node.isLoggedIn) {
            return { success: false, message: "You must login" };
        } else if (this.node.info.following.includes(username)) {
            return { success: false, message: "Already following" };
        } else if (this.node.info.username === username) {
            return { success: false, message: "You cannot follow yourself" };
        }

        try {
            await this.node.contentRouting.get(
                new TextEncoder().encode("/" + username)
            );
            // username exists so we can follow it
            this.node.pubsub.subscribe(username);

            this.node.pubsub.publish(
                "/" + username + "/follow",
                new TextEncoder().encode(this.node.info.username)
            );

            this.node.info.following.push(username);
            return { success: true, message: `Follow successful user ${username}` };
        } catch (err) {
            console.log("err: ", err);
            if (err.code === "ERR_NOT_FOUND") {
                return { success: false, message: "User does not exist" };
            } else {
                return { success: false, message: "Error following user" };
            }
        }
    }

    /**
   * Unsubscribe from a user.
   * @param {*} username
   */
    async unfollow(username) {
        if (!this.node.isLoggedIn)
            return { success: false, message: "You must login" };
        else if (!this.node.info.following.includes(username))
            return { success: false, message: "You are not following this user" };

        try {
            await this.node.contentRouting.get(
                new TextEncoder().encode("/" + username)
            );
            // username exists so we can unfollow it

            this.node.pubsub.unsubscribe(username);
            this.node.info.following.splice(
                this.node.info["following"].indexOf(username),
                1
            );

            this.node.pubsub.publish(
                "/" + username + "/unfollow",
                new TextEncoder().encode(this.node.info.username)
            );

            return { success: true, message: `Unfollow successful user ${username}` };
        } catch (err) {
            //console.log('err: ', err);
            if (err.code === "ERR_NOT_FOUND") {
                return { success: false, message: "User does not exist" };
            } else {
                return { success: false, message: "Error unfollowing user" };
            }
        }
    }

    /**
   * Function to post a message.
   * @param {*} text Post content message
   * @returns  success: true if the post was successful, false with error otherwise.
   */
    async post(text) {
        if (!this.node.isLoggedIn)
            return { success: false, message: "You must login" };

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
            return { success: true, message: "Post successful" };
        } catch (err) {
            console.log("err: ", err);
            return { success: false, error: "Failed to post" };
        }
    }

    async stop() {
        await this.node.stop();
        console.log("Node has stopped");
    }
}

const singletonNode = new Node();
export default singletonNode;
