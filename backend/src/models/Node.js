import { createLibp2p } from "libp2p";
import { tcp } from "@libp2p/tcp";
import { noise } from "@chainsafe/libp2p-noise";
import { mplex } from "@libp2p/mplex";
import { bootstrap } from "@libp2p/bootstrap";
import { pubsubPeerDiscovery } from "@libp2p/pubsub-peer-discovery";
import { gossipsub } from "@chainsafe/libp2p-gossipsub";
import { kadDHT } from "@libp2p/kad-dht";
import { hashPassword } from "../utils.js";

const getNodeOptions = () => {
    const bootstrap1 = `/ip4/${process.env.BOOTSTRAP_1_IP}/tcp/${process.env.BOOTSTRAP_1_PORT}/p2p/${process.env.BOOTSTRAP_1_ID}`;
    const bootstrap2 = `/ip4/${process.env.BOOTSTRAP_2_IP}/tcp/${process.env.BOOTSTRAP_2_PORT}/p2p/${process.env.BOOTSTRAP_2_ID}`;
    const bootstrap3 = `/ip4/${process.env.BOOTSTRAP_3_IP}/tcp/${process.env.BOOTSTRAP_3_PORT}/p2p/${process.env.BOOTSTRAP_3_ID}`;
    const bootstrapAddresses = [bootstrap1, bootstrap2, bootstrap3];
    //console.log(bootstrapAddresses);
    return ({
        addresses: {
            listen: ["/ip4/0.0.0.0/tcp/0"] // TODO: Check this and consider changing
        },
        transports: [tcp()],
        connectionEncryption: [noise()],
        streamMuxers: [mplex()],
        pubsub: gossipsub({ allowPublishToZeroPeers: true }),
        peerDiscovery: [
            bootstrap({
                interval: 60e3,
                list: bootstrapAddresses,
            }),
            pubsubPeerDiscovery({
                interval: 1000
            })
        ],
        dht: kadDHT(),
        connectionManager: {
            autoDial: true, // auto connect to discovered peers
        }
    });
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
            await this.node.contentRouting.get(new TextEncoder().encode("/" + username));
            return { success: false, message: "Username already exists" };
        } catch (err) {
            console.log("err: ", err);
            // TO DO: Check if the error is the one we want (no key found)

            // username does not exist so we can register it

            // encrypt password using bcrypt
            const hashPass = await hashPassword(password);

            await this.node.contentRouting.put(new TextEncoder().encode("/" + username), new TextEncoder().encode(hashPass));

            return { success: true, message: "Registration successful" };
        }
    }

    async stop() {
        await this.node.stop();
        console.log("Node has stopped");
    }
}

const singletonNode = new Node();
export default singletonNode;