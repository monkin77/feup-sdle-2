import {createLibp2p} from "libp2p";
import {tcp} from "@libp2p/tcp";
import {noise} from "@chainsafe/libp2p-noise";
import {mplex} from "@libp2p/mplex";

const nodeOptions = {
    addresses: {
        listen: ["/ip4/127.0.0.1/tcp/8000"] // TODO: Check this and consider changing
    },
    transports: [tcp()],
    connectionEncryption: [noise()],
    streamMuxers: [mplex()]
};

class Node {
    async start() {
        this.node = await createLibp2p(nodeOptions);

        await this.node.start();
        console.log("Node has started");

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
