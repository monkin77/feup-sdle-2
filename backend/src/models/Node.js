import {createLibp2p} from "libp2p";
import {tcp} from "@libp2p/tcp";
import {noise} from "@chainsafe/libp2p-noise";
import {mplex} from "@libp2p/mplex";
import {bootstrap} from "@libp2p/bootstrap";

const bootstrapMultiaddrs = [
    "/ip4/127.0.0.1/tcp/8000/p2p/12D3KooWCRCA3QNLFSWKfshATM1GvrmEvfUtGGX97A6pK58Wm7qV"
];

const nodeOptions = {
    addresses: {
        listen: ["/ip4/127.0.0.1/tcp/8000"] // TODO: Check this and consider changing
    },
    transports: [tcp()],
    connectionEncryption: [noise()],
    streamMuxers: [mplex()],
    peerDiscovery: [
        bootstrap({
            list: bootstrapMultiaddrs,
        })
    ],
    connectionManager: {
        autoDial: true, // auto connect to discovered peers
    }
};

class Node {
    async start() {
        this.node = await createLibp2p(nodeOptions);

        await this.node.start();
        console.log("Node has started");

        this.node.addEventListener("peer:discovery", (e) => {
            console.log("Discovered ", e.detail.id.toString());
        });

        this.node.addEventListener("peer:connect", (e) => {
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

const nodeSingleton = new Node();
export default nodeSingleton;
