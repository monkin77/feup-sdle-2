import { createLibp2p } from "libp2p";
import { tcp } from "@libp2p/tcp";
import { noise } from "@chainsafe/libp2p-noise";
import { mplex } from "@libp2p/mplex";
import { bootstrap } from "@libp2p/bootstrap";
import { pubsubPeerDiscovery } from "@libp2p/pubsub-peer-discovery";
import { gossipsub } from "@chainsafe/libp2p-gossipsub";


const getNodeOptions = (relayAddresses) => ({
    addresses: {
        listen: ["/ip4/0.0.0.0/tcp/0"] // TODO: Check this and consider changing
    },
    transports: [tcp()],
    connectionEncryption: [noise()],
    streamMuxers: [mplex()],
    // TODO: Experiment with relay, https://github.com/libp2p/js-libp2p/tree/bae32bafce75a3801a7a96f77a9ccf43b3208f9c/examples/discovery-mechanisms
    pubsub: gossipsub({ allowPublishToZeroPeers: true }),
    peerDiscovery: [
        bootstrap({
            list: relayAddresses
        }),
        pubsubPeerDiscovery({
            interval: 1000
        })
    ],
    connectionManager: {
        autoDial: true, // auto connect to discovered peers
    }
});

export default class Node {
    constructor(relayAddresses) {
        this.relayAddresses = relayAddresses;
    }

    async start() {
        this.node = await createLibp2p(getNodeOptions(this.relayAddresses));

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

    async stop() {
        await this.node.stop();
        console.log("Node has stopped");
    }
}