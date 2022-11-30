import { createLibp2p } from "libp2p";
import { tcp } from "@libp2p/tcp";
import { noise } from "@chainsafe/libp2p-noise";
import { mplex } from "@libp2p/mplex";
import { pubsubPeerDiscovery } from "@libp2p/pubsub-peer-discovery";
import { gossipsub } from "@chainsafe/libp2p-gossipsub";

class RelayNode {
    async start() {
        const nodeOptions = this.buildOptions(process.env.RELAY_IP, process.env.RELAY_PORT);
        this.node = await createLibp2p(nodeOptions);

        await this.node.start();
        console.log("Relay has started");

        const relayMultiaddrs = this.node.getMultiaddrs();
        console.log("Relay listening on addresses: ", relayMultiaddrs);
    }

    async stop() {
        await this.node.stop();
        console.log("Node has stopped");
    }

    buildOptions(ip, port) {
        const address = `/ip4/${ip}/tcp/${port}`;
        console.log(address);
        const nodeOptions = {
            addresses: {
                listen: [address] // TODO: Check this and consider changing
            },
            transports: [tcp()],
            connectionEncryption: [noise()],
            streamMuxers: [mplex()],
            pubsub: gossipsub({ allowPublishToZeroPeers: true }),
            peerDiscovery: [
                pubsubPeerDiscovery({
                    interval: 1000
                })
            ],
            relay: {
                enabled: true, // Allows you to dial and accept relayed connections. Does not make you a relay.
                hop: {
                    enabled: true // Allows you to be a relay for other peers
                }
            },
        };
        return nodeOptions;
    }

    getMultiaddrs() {
        return this.node.getMultiaddrs();
    }
}

const nodeSingleton = new RelayNode();
export default nodeSingleton;