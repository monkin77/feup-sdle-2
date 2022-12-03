import Node from "../../models/Node.js";

/**
 * Handles the following of a new user.
 * @param {*} req 
 * @param {*} res 
 */
export async function followHandler(req, res) {
    const username = req.body.username;
    const result = await Node.follow(username);
    res.send(result);
}

/**
 * Handles the unfollowing of a user.
 * @param {*} req 
 * @param {*} res 
 */
export async function unfollowHandler(req, res) {
    const username = req.body.username;
    const result = await Node.unfollow(username);
    res.send(result);
}