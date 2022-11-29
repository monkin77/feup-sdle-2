import {createLibp2p} from "libp2p";
import {tcp} from "@libp2p/tcp";
import {noise} from "@chainsafe/libp2p-noise";
import {mplex} from "@libp2p/mplex";
import {bootstrap} from "@libp2p/bootstrap";

const bootstrapAddresses = [
    // TODO: Configure this properly, this is a random address I got in a run
    "/ip4/127.0.0.1/tcp/8000/p2p/12D3KooWCRCA3QNLFSWKfshATM1GvrmEvfUtGGX97A6pK58Wm7qV",
    "/dnsaddr/bootstrap.libp2p.io/p2p/QmNnooDu7bfjPFoTZYxMNLWUQJyrVwtbZg5gBMjTezGAJN",
    "/dnsaddr/bootstrap.libp2p.io/p2p/QmbLHAnMoJPWSCR5Zhtx6BHJX9KiKNN6tpvbUcqanj75Nb",
];

const nodeOptions = {
    addresses: {
        listen: ["/ip4/0.0.0.0/tcp/0"] // TODO: Check this and consider changing
    },
    transports: [tcp()],
    connectionEncryption: [noise()],
    streamMuxers: [mplex()],
    peerDiscovery: [
        bootstrap({
            list: bootstrapAddresses,
            timeout: 2000
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

const nodeSingleton = new Node();
export default nodeSingleton;
