import { CID } from "multiformats/cid";
import { sha256 } from "multiformats/hashes/sha2";
import all from "it-all";


/**
 * Get the content from the DHT
 * Catches the error of no peers in routing table
 * in case it is the first node in the network
 * @param {*} node
 * @param {*} key
 * @returns content if success, throws error otherwise
 */
export const getContent = async(node, key) => {
    const content = await node.contentRouting.get(
        new TextEncoder().encode(key)
    );

    return JSON.parse(new TextDecoder().decode(content));
};

/**
 * Put the content in the DHT
 * @param {*} node
 * @param {string} key
 * @param {*} value
 */
export const putContent = async(node, key, value) => {
    try {
        await node.contentRouting.put(
            new TextEncoder().encode(key),
            new TextEncoder().encode(JSON.stringify(value))
        );
    } catch (err) {
        if (err.code !== "ERR_NO_PEERS_IN_ROUTING_TABLE") {
            throw err;
        }

        console.log("No peers in routing table");
    }
};

/**
 * Published a message to a given topic.
 * @param node
 * @param {string} topic
 * @param {string} message
 */
export const publishMessage = async(node, topic, message) => {
    await node.pubsub.publish(
        topic,
        new TextEncoder().encode(message)
    );
};

export const discoveryTopic = "_peer-discovery._p2p._pubsub";

/**
 * Announce that this node provides the content correspondent to the key.
 * Register the lookup function to be called when a peer wants to get the content.
 * @param {Libp2p} node 
 * @param {string} key 
 */
export const provideInfo = async (peer, key) => {
    const node = peer.node;
    const cid = await createCID(key);

    // Node annouce that it has the content for the given key
    await node.contentRouting.provide(cid);

    // Node register the retrieve function to be called when a peer request the content
    node.fetchService.registerLookupFunction(`/${key}`, (trash) => {
        const info = peer.getInfo(key)
        return new TextEncoder().encode(JSON.stringify(info));
     });
};

/**
 * Find the peers that provide the content for the given key.
 * Fetch the content from the first peer that provides it. // TODO: tweek this
 * @param {Libp2p} node 
 * @param {string} key 
 */
export const collectInfo = async (peer, key) => {
    const node = peer.node;
    const cid = await createCID(key);

    const providers = await all(node.contentRouting.findProviders(
        cid,
        { maxTimeout: 1000, maxNumProviders: 1 }
    ));
    for (const provider of providers) {
        let info = await node.fetch(provider.id, `/${key}`);
        info = JSON.parse(new TextDecoder().decode(info));
        peer.setInfo(key, info); // TODO: merge infos instead of overwriting (?) 
    }
};

const createCID = async (content) => {
    const bytes = new TextEncoder().encode(content);
    const hash = await sha256.digest(bytes);
    return CID.create(1, 0x55, hash);
};

