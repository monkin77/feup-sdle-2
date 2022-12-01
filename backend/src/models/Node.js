import { createLibp2p } from "libp2p";
import { tcp } from "@libp2p/tcp";
import { noise } from "@chainsafe/libp2p-noise";
import { mplex } from "@libp2p/mplex";
import { bootstrap } from "@libp2p/bootstrap";
import { pubsubPeerDiscovery } from "@libp2p/pubsub-peer-discovery";
import { gossipsub } from "@chainsafe/libp2p-gossipsub";
import { CID } from "multiformats/cid";
import bcrypt from "bcryptjs";

const getNodeOptions = () => {
    const relay1 = `/ip4/${process.env.RELAY_1_IP}/tcp/${process.env.RELAY_1_PORT}/p2p/${process.env.RELAY_1_ID}`;
    const relay2 = `/ip4/${process.env.RELAY_2_IP}/tcp/${process.env.RELAY_2_PORT}/p2p/${process.env.RELAY_2_ID}`;
    const relay3 = `/ip4/${process.env.RELAY_3_IP}/tcp/${process.env.RELAY_3_PORT}/p2p/${process.env.RELAY_3_ID}`;
    const relayAddresses = [relay1, relay2, relay3];
    //console.log(relayAddresses);
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
                list: relayAddresses,
            }),
            pubsubPeerDiscovery({
                interval: 1000
            })
        ],
        connectionManager: {
            autoDial: true, // auto connect to discovered peers
        }
})};

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


    async register(username, password) {
        // const cid = CID.parse(username);

        try {
            // get the username content routing of node
            const user = await this.node.contentRouting.get(new TextEncoder().encode('/' + username));
            return { success: true, message: "Username already exists" };
        } catch (err) {
            // encrypt password using bcrypt
            const hashPass = await bcrypt.hash(password, 10);

            // username does not exist so we can register it
            await this.node.contentRouting.put(new TextEncoder().encode('/' + username), hashPass);
            //const user = await this.node.contentRouting.get(new TextEncoder().encode('/' + username));
            //console.log("user: ", user);
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