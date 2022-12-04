import bcrypt from "bcryptjs";

/**
 * Hashes a password using bcrypt with constant salt
 * @param {*} pass Plain text password
 * @returns Hashed password 
 */
export const hashPassword = async(pass) => {
    return await bcrypt.hash(pass, 10);
};

/**
 * Compares a password with a hashed password
 * @param {*} pass 
 * @param {*} hash 
 * @returns true if the password is correct, false otherwise
 */
export const comparePassword = async (pass, hash) => {
    return await bcrypt.compare(pass, hash);
};

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
