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