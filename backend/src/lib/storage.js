import fs from "fs";
import peer from "../models/Node.js";
import { buildStatusRes } from "./utils.js";
import { cloneDeep } from "lodash";

const STORAGE_PATH = "../storage";
const NUMBER_OF_POSTS_TO_KEEP = 100;
const ONE_DAY_TIMESTAMP = 86400000;

/**
 * Store a user's data into the folder of the logged in user 
 * @param {string} fileUsername username of the user that is being saved
 * @param {*} data data to be stored in JSON format 
 */
export const saveUserData = async(fileUsername, data) => {
    const loggedUsername = peer.username;
    const jsonData = JSON.stringify(data);
    const folderPath = `${STORAGE_PATH}/${loggedUsername}`;
    const path = `${folderPath}/${fileUsername}.json`;

    // TODO: Check if there is any error handling to be done, such as retrying to save the data in case of specific errors?
    // TODO: Check if we need to return true/false to indicate if this operation was succesfull
    try {
        await fs.promises.mkdir(folderPath, { recursive: true });
        await fs.promises.writeFile(path, jsonData);

        console.log(`Data ${jsonData} saved to file at path ${path}`);
    } catch (err) {
        console.log(`Error saving user data at path ${path}: ${err}`);
    }
};

/**
 * Reads a user's data from the folder of the logged in user
 * @param {string} fileUsername username of the user that is being saved
 * @returns {Dict} {error: error, data: data} If error is different from null, read operation failed. Data -> Dict with user info
 */
export const getUserData = async(fileUsername) => {
    const loggedUsername = peer.username;
    const path = `${STORAGE_PATH}/${loggedUsername}/${fileUsername}.json`;

    try {
        // Reads file asynchronously 
        const data = await fs.promises.readFile(path);

        return buildStatusRes(null, JSON.parse(data));
    } catch (err) {
        return buildStatusRes(err, null);
    }
};

/**
 * Deletes a user's data from the folder of the logged in user
 * @param {string} fileUsername username of the user that is being saved
 * @returns {Dict} {err: error, data: data} If error is different from null, delete operation failed
 */
export const deleteUserData = (fileUsername) => {
    const loggedUsername = peer.username;

    const path = `${STORAGE_PATH}/${loggedUsername}/${fileUsername}.json`;

    // TODO: Check if there is any way of retrying deletino upon failure
    // remove file
    fs.unlink(path, (err) => {
        if (err) {
            console.log(`Error deleting file at path ${path}`);
            return;
        }
        console.log(`File at path ${path} deleted`);
    });
};


/**
 * Adds a post to the user's posts list
 * @param {string} fileUsername username of user that posted the post
 * @param {string} post post to be added
 */
export const addPost = async(fileUsername, post) => {
    const { data, error } = await getUserData(fileUsername);
    if (error) {
        console.log(`Error reading user data so we can't add a Post: ${error}`);
        return;
    }

    data.posts.push(post);

    await saveUserData(fileUsername, data);
};

/**
 * Adds a follower to the user's follower list
 * @param {string} fileUsername username of user that was followed
 * @param {*} follower username of user that followed the user
 * @returns {Dict} {err: error, data: data} If error is different from null, add follower operation failed
 */
export const addFollower = async(fileUsername, follower) => {
    const { data, error } = await getUserData(fileUsername);
    if (error) {
        console.log(`Error reading user data so we can't add a follower: ${error}`);
        return;
    }

    data.followers.push(follower);

    await saveUserData(fileUsername, data);
};


/**
 * Adds a following to the user's following list
 * @param {string} fileUsername username of user that started following
 * @param {*} following username of user that was followed
 */
export const addFollowing = async(fileUsername, following) => {
    const { data, error } = await getUserData(fileUsername);
    if (error) {
        console.log(`Error reading user data so we can't add a following: ${error}`);
        return;
    }

    data.following.push(following);

    await saveUserData(fileUsername, data);
};

/**
 * Removes a follower from the user's follower list
 * @param {*} fileUsername username of user that lost a follower
 * @param {*} follower username of user that unfollowed the user
 */
export const removeFollower = async(fileUsername, follower) => {
    const { data, error } = await getUserData(fileUsername);
    if (error) {
        console.log(`Error reading user data so we can't remove a follower: ${error}`);
        return;
    }

    const index = data.followers.indexOf(follower);
    if (index > -1) {
        data.followers.splice(index, 1);
    }

    await saveUserData(fileUsername, data);
};


/**
 * Removes a following from the user's following list
 * @param {*} fileUsername username of user that stopped following
 * @param {*} following username of user that was unfollowed
 */
export const removeFollowing = async(fileUsername, following) => {
    const { data, error } = await getUserData(fileUsername);
    if (error) {
        console.log(`Error reading user data so we can't remove a following: ${error}`);
        return;
    }

    const index = data.following.indexOf(following);
    if (index > -1) {
        data.following.splice(index, 1);
    }

    await saveUserData(fileUsername, data);
};

/**
 * @returns {dict[]} Array of posts
 */
export const getAllPosts = async() => {
    const loggedUsername = peer.username;
    const path = `${STORAGE_PATH}/${loggedUsername}`;
    const posts = [];

    const files = await fs.promises.readdir(path);

    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileName = file.replace(".json", "");
        const { data, error } = await getUserData(fileName);
        if (error) {
            // if we can't read a user's data, we just skip the posts from that user
            console.log(`Failed to retrieve posts from user ${fileName}. Error: ${error}`);
            continue;
        }
        posts.push(...data.posts);
    }

    return posts;
};



/**
 * Function that deletes posts that are older than 1 day (ONE_DAY_TIMESTAMP)
 */
export const garbageCollect = async() => {
    const loggedUsername = peer.username;
    const path = `${STORAGE_PATH}/${loggedUsername}`;
    const files = await fs.promises.readdir(path);

    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileName = file.replace(".json", "");
        const { data, error } = await getUserData(fileName);
        if (error) {
            // if we can't read a user's data, we just skip the posts from that user
            console.log(`Failed to get posts from user ${fileName}. Error: ${error}`);
            continue;
        }

        const currTime = Date.now();

        // CloneDeep utility function is used to avoid mutating the original data even in nested structures
        const newPosts = cloneDeep(data.posts);

        // sort posts by timestamps in ascending order
        newPosts.sort((a, b) => a.timestamp - b.timestamp);

        // remove posts that are older than 1 day
        for (let j = 0; j < newPosts.length; j++) {
            const postTime = newPosts[j].timestamp;
            if (currTime - postTime > ONE_DAY_TIMESTAMP) {
                newPosts.splice(j, 1);
                j--;
            } else {
                break; //  Since posts are sorted by timestamp, we can stop once we find a post that is not old
            }
        }

        if (newPosts.length !== data.posts.length) {
            data.posts = newPosts;
            await saveUserData(fileName, data);
        }
    }
};


/**
 * Garbage collects a user's posts if they have more than 100 posts
 * @param {*} fileUsername name of the user to garbage collect
 */
export const garbageCollectFile = async(fileUsername) => {
    const { error, data } = await getUserData(fileUsername);

    if (error) {
        console.log(`Error reading user data so we can't garbage collect: ${error}`);
        return;
    } else {
        const newPosts = [...data.posts];
        newPosts.sort((a, b) => a.timestamp - b.timestamp);

        if (newPosts.length > NUMBER_OF_POSTS_TO_KEEP) {
            newPosts.splice(0, newPosts.length - NUMBER_OF_POSTS_TO_KEEP);
        }

        if (newPosts.length !== data.posts.length) {
            data.posts = newPosts;
            await saveUserData(fileUsername, data);
        }
    }

};