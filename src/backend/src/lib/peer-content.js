import { CID } from "multiformats/cid";
import { sha256 } from "multiformats/hashes/sha2";
import all from "it-all";
import peer from "../models/Node.js";
import { getAllPosts } from "./storage.js";

/**
 * Get the content from the DHT
 * Catches the error of no peers in routing table
 * in case it is the first node in the network
 * @param {*} node
 * @param {*} key
 * @returns content if success, throws error otherwise
 */
export const getContent = async (node, key) => {
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
export const putContent = async (node, key, value) => {
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
export const publishMessage = async (node, topic, message) => {
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
export const provideInfo = async (key) => {
    const node = peer.node;
    const cid = await createCID(key);

    // Node annouce that it has the content for the given key
    await node.contentRouting.provide(cid);

    // Node register the retrieve function to be called when a peer request the content
    try {
        node.fetchService.registerLookupFunction(`/${key}`, async () => {
            const info = await peer.getInfo(key);
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
export const unprovideInfo = async (key) => {
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
 * If the content is not found locally, returns error.
 * @param {Libp2p} node 
 * @param {string} key 
 * @returns {Dict} {error: error, data: data} data -> Dictionary with user's info
 */
export const collectInfo = async (key) => {
    const node = peer.node;

    const providers = await getPeerProviders(key);
    let foundProviders = providers.length > 0;

    if (foundProviders) {
        console.log(`Found ${providers.length} providers for ${key}: ${providers.map(provider => provider.id)}`);

        const infos = [];
        for (const provider of providers) {
            try {
                const infoReq = await node.fetch(provider.id, `/${key}`);
                const { error, data } = JSON.parse(new TextDecoder().decode(infoReq));
                if (!error) {
                    infos.push(data);
                } else {
                    console.log(`Error in provider ${provider.id}: ${error}.`);
                }
            } catch (err) {
                console.log(`Error fetching info from provider ${provider.id}: ${err}. Trying next...`);
            }
        }

        if (infos.length > 0) {
            return { error: null, data: mergeInfos(infos) };
        }
    }

    // Try to collect info from the local info in this node
    return peer.getInfo(key);
};

/**
 * Gets the peers that provide the content for the given key.
 * @param {*} key 
 * @returns List of peers that provide the content excluding itself. If no peers are found, returns an empty list.
 */
export const getPeerProviders = async (key) => {
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
const createCID = async (content) => {
    const bytes = new TextEncoder().encode(content);
    const hash = await sha256.digest(bytes);
    return CID.create(1, 0x55, hash);
};

/**
 * Collect the posts of peer profiles object and merge them into a single array ordered by timestamp in reverse.
 * @returns {Array} All the posts of the own user and the users he is following ordered by timestamp in reverse.
 */
export const mergePostsIntoTimeline = async () => {
    const timeline = await getAllPosts();
    timeline.sort((a, b) => b.timestamp - a.timestamp);
    return timeline;
};


/**
 * Find users that are beeing followed by the users that the own user is following and that does not follow already. Until 2 levels of depth.
 * @returns {Array} Recommended users for the own user.
 */
export const findRecommendedUsers = async () => {
    const profile = peer.profile;
    let recommendedUsers = [];
    const following = profile.getFollowing();
    for (const user of following) {
        const { error, data } = await collectInfo(user);
        if (error) continue;
        const followingFollowings = data.following;
        recommendedUsers.push(...followingFollowings);
        for (const subuser of followingFollowings) {
            const { error, data } = await collectInfo(subuser);
            if (error) continue;
            recommendedUsers.push(...data.following);
        }
    }
    recommendedUsers = [...new Set(recommendedUsers)];
    recommendedUsers = recommendedUsers.filter(user => user != peer.username && !following.has(user));
    return recommendedUsers;
};

/**
 * Merge the info of the given infos by voting on every single field.
 * @param {*} infos 
 * @returns Info dictionary with the merged info of the given infos. 
 */
const mergeInfos = (infos) => {
    const posts = {};
    /**
     * @type {Dict} Dictionary with the votes for each field.
     * @property {Dict} followers Dictionary with the votes for each follower.
     * @property {Dict} following Dictionary with the votes for each following.
     * @property {Dict} posts Dictionary with the votes for each post timestamp.
     */
    const votes = {
        followers: {},
        following: {},
        posts: {},
    };

    for (const info of infos) {
        for (const follower of info.followers) {
            votes.followers[follower] = (votes.followers[follower] || 0) + 1;
        }
        for (const following of info.following) {
            votes.following[following] = (votes.following[following] || 0) + 1;
        }
        for (const post of info.posts) {
            votes.posts[post.timestamp] = (votes.posts[post.timestamp] || 0) + 1;
            posts[post.timestamp] = post;
        }
    }

    // Use the info that has been voted by more than half of the peers
    const info = {
        followers: Object.entries(votes.followers).filter(entry => entry[1] > infos.length / 2).map(entry => entry[0]),
        following: Object.entries(votes.following).filter(entry => entry[1] > infos.length / 2).map(entry => entry[0]),
        posts: Object.entries(votes.posts).filter(entry => entry[1] > infos.length / 2).map(entry => posts[entry[0]]),
    };
    info.posts.sort((a, b) => b.timestamp - a.timestamp);
    return info;
};
