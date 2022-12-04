import node from "../../models/Node.js";

/**
 * Handles the registration of a new user.
 * To do so, sends a register request to the node, which will check if the account already exists on content routing.
 * @param {*} req
 * @param {*} res message wifh format { success: true/false, message: "message" }
 * where message can be an error message if success is false
 */
export async function registerHandler(req, res) {
    const username = req.body.username;
    const password = req.body.password;
    const result = await node.register(username, password);
    res.send(result);
}

/**
 * Handles the login of a user.
 * To do so, sends a login request to the node, which will check if the account already exists on content routing and,
 * if so, if the password is correct.
 * @param {*} req
 * @param {*} res message wifh format { success: true/false, message: "message" }
 * where message can be an error message if success is false
 */
export async function loginHandler(req, res) {
    const username = req.body.username;
    const password = req.body.password;
    const result = await node.login(username, password);
    res.send(result);
}

export async function logoutHandler(req, res) {
    const result = await node.logout();
    res.send(result);
}
