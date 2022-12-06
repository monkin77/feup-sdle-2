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