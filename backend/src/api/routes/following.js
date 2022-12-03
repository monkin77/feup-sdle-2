import node from "../../models/Node.js";

/**
 * Handles the following of a new user.
 * @param {*} req 
 * @param {*} res 
 */
export async function followHandler(req, res) {
    const username = req.body.username;
    const result = await node.follow(username);
    res.send(result);
}

/**
 * Handles the unfollowing of a user.
 * @param {*} req 
 * @param {*} res 
 */
export async function unfollowHandler(req, res) {
    const username = req.body.username;
    const result = await node.unfollow(username);
    res.send(result);
}

export async function postHandler(req, res) {
    const text = req.body.text;
    const result = await node.post(text);
    res.send(result);
}