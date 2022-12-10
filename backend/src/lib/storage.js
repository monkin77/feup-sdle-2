import fs from "fs";

const STORAGE_PATH = "../storage";

/**
 * Store a user's data into the folder of the logged in user 
 * @param {string} loggedUsername logged user username 
 * @param {string} fileUsername username of the user that is being saved
 * @param {*} data data to be stored in JSON format 
 */
export const saveUserData = async(loggedUsername, fileUsername, data) => {
    const jsonData = JSON.stringify(data);
    const folderPath = `${STORAGE_PATH}/${loggedUsername}`;
    const path = `${folderPath}/${fileUsername}.json`;

    // TODO: Check if there is any error handling to be done, such as retrying to save the data in case of specific errors?
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
 * @param {string} loggedUsername logged user username 
 * @param {string} fileUsername username of the user that is being saved
 * @returns {Dict} {err: error, data: data} If error is different from null, read operation failed
 */
export const getUserData = async(loggedUsername, fileUsername) => {
    // TODO: If the data to get is from the logged in user, could fetch it from the peer instead of reading from the file

    const path = `${STORAGE_PATH}/${loggedUsername}/${fileUsername}.json`;

    try {
        // Reads file asynchronously 
        const data = await fs.promises.readFile(path);

        return { error: null, data: JSON.parse(data) };
    } catch (err) {
        return { error: err, data: null };
    }
};

/**
 * Deletes a user's data from the folder of the logged in user
 * @param {string} loggedUsername logged user username
 * @param {string} fileUsername username of the user that is being saved
 * @returns {Dict} {err: error, data: data} If error is different from null, delete operation failed
 */
export const deleteUserData = (loggedUsername, fileUsername) => {
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
 * @param {string} loggedUsername logged user username
 * @param {string} fileUsername username of user that posted the post
 * @param {string} post post to be added
 */
export const addPost = async(loggedUsername, fileUsername, post) => {
    const { data, error } = await getUserData(loggedUsername, fileUsername);
    if (error) {
        console.log(`Error reading user data so we can't add a Post: ${error}`);
        return;
    }

    const posts = data.posts;
    posts.push(post);

    await saveUserData(loggedUsername, fileUsername, data);
};

/**
 * Adds a follower to the user's follower list
 * @param {string} loggedUsername logged user username
 * @param {string} fileUsername username of user that was followed
 * @param {*} follower username of user that followed the user
 * @returns {Dict} {err: error, data: data} If error is different from null, add follower operation failed
 */
export const addFollower = async(loggedUsername, fileUsername, follower) => {
    const { data, error } = await getUserData(loggedUsername, fileUsername);
    if (error) {
        console.log(`Error reading user data so we can't add a follower: ${error}`);
        return;
    }

    const followersList = data.followers;
    followersList.push(follower);

    await saveUserData(loggedUsername, fileUsername, data);
};


/**
 * Adds a following to the user's following list
 * @param {string} loggedUsername logged user username
 * @param {string} fileUsername username of user that started following
 * @param {*} following username of user that was followed
 */
export const addFollowing = async(loggedUsername, fileUsername, following) => {
    const { data, error } = await getUserData(loggedUsername, fileUsername);
    if (error) {
        console.log(`Error reading user data so we can't add a following: ${error}`);
        return;
    }

    const followingList = data.following;
    followingList.push(following);

    await saveUserData(loggedUsername, fileUsername, data);
};

/**
 * Removes a follower from the user's follower list
 * @param {*} loggedUsername logged user username
 * @param {*} fileUsername username of user that lost a follower
 * @param {*} follower username of user that unfollowed the user
 */
export const removeFollower = async(loggedUsername, fileUsername, follower) => {
    const { data, error } = await getUserData(loggedUsername, fileUsername);
    if (error) {
        console.log(`Error reading user data so we can't remove a follower: ${error}`);
        return;
    }

    const followersList = data.followers;
    const index = followersList.indexOf(follower);
    if (index > -1) {
        followersList.splice(index, 1);
    }

    await saveUserData(loggedUsername, fileUsername, data);
};


/**
 * Removes a following from the user's following list
 * @param {*} loggedUsername logged user username
 * @param {*} fileUsername username of user that stopped following
 * @param {*} following username of user that was unfollowed
 */
export const removeFollowing = async(loggedUsername, fileUsername, following) => {
    const { data, error } = await getUserData(loggedUsername, fileUsername);
    if (error) {
        console.log(`Error reading user data so we can't remove a following: ${error}`);
        return;
    }

    const followingList = data.following;
    const index = followingList.indexOf(following);
    if (index > -1) {
        followingList.splice(index, 1);
    }

    await saveUserData(loggedUsername, fileUsername, data);
};

export const getAllPosts = async(loggedUsername) => {
    const path = `${STORAGE_PATH}/${loggedUsername}`;
    const posts = [];

    const files = fs.readdirSync(path);

    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileName = file.replace(".json", "");
        const { data, error } = await getUserData(loggedUsername, fileName);
        if (error) {
            // if we can't read a user's data, we just skip the posts from that user
            console.log(`Failed to retrieve posts from user ${fileName}. Error: ${error}`);
            continue;
        }
        posts.push(...data.posts);
    }

    return posts;
};