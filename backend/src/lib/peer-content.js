import { CID } from "multiformats/cid";
import { sha256 } from "multiformats/hashes/sha2";
import all from "it-all";
import peer from "../models/Node.js";
import { getUserData } from "./storage.js";

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
 * @param {string} key 
 */
export const provideInfo = async(key) => {
    const node = peer.node;
    const cid = await createCID(key);

    // Node annouce that it has the content for the given key
    await node.contentRouting.provide(cid);

    // Node register the retrieve function to be called when a peer request the content
    try {
        node.fetchService.registerLookupFunction(`/${key}`, () => {
            const info = peer.getInfo(key);
            return new TextEncoder().encode(JSON.stringify(info));
        });
    } catch (err) {
        console.log(`Error registering the lookup function for ${key}: ${err}`);
    }
};

/**
 * Unregister the lookup function to be called when a peer wants to get the content.
 * The unprovide can't be done since there is no support for it.
 * @param {string} key 
 */
export const unprovideInfo = async(key) => {
    const node = peer.node;

    // TODO: Check if we don't need anything else to unprovide
    // Theres is no unprovide so it continues providing but unregister the providing callback
    try {
        node.fetchService.unregisterLookupFunction(`/${key}`);
    } catch (err) {
        console.log(`Error unregistering the lookup function for ${key}: ${err}`);
    }
};

/**
 * Find the peers that provide the content for the given key.
 * Fetch the content from the first peer that provides it. // TODO: tweek this
 * If the content is not found, tries to get it locally.
 * If the content is not found locally, returns null.
 * @param {Libp2p} node 
 * @param {string} key 
 * @returns {object} Dictionary with the content if found, null otherwise.
 */
export const collectInfo = async(key) => {
    const node = peer.node;

    const providers = await getPeerProviders(key);
    let foundProviders = providers.length > 0;

    if (foundProviders) {
        console.log(`Found ${providers.length} providers for ${key}: ${providers.map(provider => provider.id)}`);

        // TODO: Check how info will be updated from the providers
        for (const provider of providers) {
            try {
                let info = await node.fetch(provider.id, `/${key}`);
                return JSON.parse(new TextDecoder().decode(info));
            } catch (err) {
                console.log(`Error fetching info from provider ${provider.id}: ${err}. Trying next...`);
            }
        }
    }

    // Try get local info
    const username = peer.username;

    console.log(`Trying to get info locally for ${key} on folder ./storage/${username}`);
    const {data, error : readError} = await getUserData(username, key);
    console.log("data", data, "error", readError);

    if (!readError) {
        return data;
    }

    return null;
};

/**
 * Gets the peers that provide the content for the given key.
 * @param {*} key 
 * @returns List of peers that provide the content excluding itself. If no peers are found, returns an empty list.
 */
export const getPeerProviders = async(key) => {
    const cid = await createCID(key);

    let providers = [];
    try {
        providers = await all(peer.node.contentRouting.findProviders(
            cid, { maxTimeout: 1000, maxNumProviders: 10 } // TODO: Check maxNumProviders
        ));
    } catch (err) { /* empty */ }

    // Remove own node from the list
    providers = providers.filter(provider => !peer.node.peerId.equals(provider.id));

    return providers;
};

/**
 * Create a CID from the given content.
 * @param {string} content 
 * @returns CID of the content
 */
const createCID = async(content) => {
    const bytes = new TextEncoder().encode(content);
    const hash = await sha256.digest(bytes);
    return CID.create(1, 0x55, hash);
};

/**
 * Collect the posts of peer profiles object and merge them into a single array ordered by timestamp in reverse.
 * @returns {Array} All the posts of the own user and the users he is following ordered by timestamp in reverse.
 */
export const mergePostsIntoTimeline = () => {
    const timeline = [];
    Object.values(peer.profiles).forEach(profile => {
        timeline.push(...profile.posts);
    });
    timeline.sort((a,b) => b.timestamp - a.timestamp);
    return timeline;
};
