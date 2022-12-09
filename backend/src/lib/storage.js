import fs from "fs";

const STORAGE_PATH = "../storage";

/**
 * Store a user's data into the folder of the logged in user 
 * @param {string} loggedUsername logged user username 
 * @param {string} fileUsername username of the user that is being saved
 * @param {*} data data to be stored in JSON format 
 */
export const saveUserData = async (loggedUsername, fileUsername, data) => {
    const jsonData = JSON.stringify(data);
    const folderPath = `${STORAGE_PATH}/${loggedUsername}`;
    const path = `${folderPath}/${fileUsername}.json`;

    fs.mkdir(folderPath, { recursive: true }, (err) => {
        if (err) {
            console.log(`Error writing to file at path ${path}`);
            return;
        }
        fs.writeFile(path, jsonData, () => {
            console.log(`Data ${jsonData} saved to file at path ${path}`);
        });
    });
};

/**
 * Reads a user's data from the folder of the logged in user
 * @param {string} loggedUsername logged user username 
 * @param {string} fileUsername username of the user that is being saved
 * @returns {Dict} {err: error, data: data} If error is different from null, read operation failed
 */
export const getUserData = async (loggedUsername, fileUsername) => {
    const path = `${STORAGE_PATH}/${loggedUsername}/${fileUsername}.json`;

    try {
        let data = fs.readFileSync(path);
        return {error: null, data: JSON.parse(data)};
    } catch (err) {
        return {error: err, data: null};
    }
};

/**
 * Deletes a user's data from the folder of the logged in user
 * @param {string} loggedUsername logged user username
 * @param {string} fileUsername username of the user that is being saved
 * @returns {Dict} {err: error, data: data} If error is different from null, delete operation failed
 */
export const deleteUserData = async (loggedUsername, fileUsername) => {
    const path = `${STORAGE_PATH}/${loggedUsername}/${fileUsername}.json`;
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
 * @returns {Dict} {err: error, data: data} If error is different from null, add post operation failed
 */
export const addPost = async (loggedUsername, fileUsername, post) => {
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
export const addFollower = async (loggedUsername, fileUsername, follower) => {
    const { data, error } = await getUserData(loggedUsername, fileUsername);
    if (error) {
        console.log(`Error reading user data so we can't add a follower: ${error}`);
        return;
    }

    const followers = data.followers;
    followers.push(follower);

    await saveUserData(loggedUsername, fileUsername, data);
};


/**
 * Adds a following to the user's following list
 * @param {string} loggedUsername logged user username
 * @param {string} fileUsername username of user that started following
 * @param {*} following username of user that was followed
 * @returns {Dict} {err: error, data: data} If error is different from null, add following operation failed
 * */
export const addFollowing = async (loggedUsername, fileUsername, following) => {
    const { data, error } = await getUserData(loggedUsername, fileUsername);
    if (error) {
        console.log(`Error reading user data so we can't add a following: ${error}`);
        return;
    }

    const followings = data.following;
    followings.push(following);

    await saveUserData(loggedUsername, fileUsername, data);
};

/**
 * Removes a follower from the user's follower list
 * @param {*} loggedUsername logged user username
 * @param {*} fileUsername username of user that lost a follower
 * @param {*} follower username of user that unfollowed the user
 * @returns {Dict} {err: error, data: data} If error is different from null, remove follower operation failed
 */
export const removeFollower = async (loggedUsername, fileUsername, follower) => {
    const { data, error } = await getUserData(loggedUsername, fileUsername);
    if (error) {
        console.log(`Error reading user data so we can't remove a follower: ${error}`);
        return;
    }

    const followers = data.followers;
    const index = followers.indexOf(follower);
    if (index > -1) {
        followers.splice(index, 1);
    }

    await saveUserData(loggedUsername, fileUsername, data);
};


/**
 * Removes a following from the user's following list
 * @param {*} loggedUsername logged user username
 * @param {*} fileUsername username of user that stopped following
 * @param {*} following username of user that was unfollowed
 * @returns 
 */
export const removeFollowing = async (loggedUsername, fileUsername, following) => {
    const { data, error } = await getUserData(loggedUsername, fileUsername);
    if (error) {
        console.log(`Error reading user data so we can't remove a following: ${error}`);
        return;
    }

    const followings = data.following;
    const index = followings.indexOf(following);
    if (index > -1) {
        followings.splice(index, 1);
    }

    await saveUserData(loggedUsername, fileUsername, data);
};

export const getAllPosts = async (loggedUsername) => {
    const path = `${STORAGE_PATH}/${loggedUsername}`;
    const posts = [];

    const files = fs.readdirSync(path);

    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileName = file.replace(".json", "");
        const { data, error } = await getUserData(loggedUsername, fileName);
        if (error) {
            console.log(`Error reading user data so we can't get all posts: ${error}`);
            return;
        }
        posts.push(...data.posts);
    }

    return posts;
};

