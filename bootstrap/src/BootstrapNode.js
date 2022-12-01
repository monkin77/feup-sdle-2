import { createLibp2p } from "libp2p";
import { tcp } from "@libp2p/tcp";
import { noise } from "@chainsafe/libp2p-noise";
import { mplex } from "@libp2p/mplex";
import { pubsubPeerDiscovery } from "@libp2p/pubsub-peer-discovery";
import { gossipsub } from "@chainsafe/libp2p-gossipsub";
import peerIdLib from "peer-id";
import { createFromJSON } from "@libp2p/peer-id-factory";
import fs from "fs";

export const createPeerId = async() => {
    // We needed to use the 'peer-id' lib to export the bootstrap's ids since the new lib had issues exporting to json
    const peer = await peerIdLib.create({ keyType: "Ed25519", bits: 1024 });
    console.log(peer.toJSON());
};

class BootstrapNode {
    async start() {
        const nodeOptions = await this.buildOptions(process.env.BOOTSTRAP_IP, process.env.BOOTSTRAP_PORT, process.env.ID_FILENAME);
        this.node = await createLibp2p(nodeOptions);

        await this.node.start();
        console.log("Bootstrap has started");

        const bootstrapMultiaddrs = this.node.getMultiaddrs();
        console.log("Bootstrap listening on addresses: ", bootstrapMultiaddrs);

    }

    async stop() {
        await this.node.stop();
        console.log("Node has stopped");
    }

    buildOptions = async(ip, port, peerFile) => {
        const address = `/ip4/${ip}/tcp/${port}`;
        console.log(address);

        // Read the bootstrap peer id from the stored file to keep it consistent across restarts
        const idData = JSON.parse(fs.readFileSync(`./ids/${peerFile}`));
        const peerId = await createFromJSON(idData);

        const nodeOptions = {
            addresses: {
                listen: [address] // TODO: Check this and consider changing
            },
            transports: [tcp()],
            connectionEncryption: [noise()],
            streamMuxers: [mplex()],
            pubsub: gossipsub({ allowPublishToZeroPeers: true }),
            peerId: peerId,
            peerDiscovery: [
                pubsubPeerDiscovery({
                    interval: 1000
                })
            ],
            /*  relay: {
                 enabled: true, // Allows you to dial and accept relayed connections. Does not make you a bootstrap.
                 hop: {
                     enabled: true // Allows you to be a bootstrap for other peers
                 }
             }, */
        };

        return nodeOptions;
    };

    getMultiaddrs() {
        return this.node.getMultiaddrs();
    }
}

const nodeSingleton = new BootstrapNode();
export default nodeSingleton;