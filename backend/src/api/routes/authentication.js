import node from "../../models/Node.js";
import {Router} from "express";

const router = Router();

export default (app) => {
    app.use("/auth", router);

    router.post("/register", registerHandler);
    router.post("/login", loginHandler);
    router.post("/logout", logoutHandler);
};

/**
 * Handles the registration of a new user.
 * Sends a register request to the node after checking if the account already exists on content routing.
 */
async function registerHandler(req, res) {
    const username = req.body.username;
    const password = req.body.password;
    const result = await node.register(username, password);
    res.send(result);
}

/**
 * Handles the login of a user.
 * To do so, sends a login request to the node after checking if the account already exists
 * on content routing. If so, checks if the password is correct.
 */
async function loginHandler(req, res) {
    const username = req.body.username;
    const password = req.body.password;
    const result = await node.login(username, password);
    res.send(result);
}

/**
 * Handles the logout of a user by calling the node's logout method.
 */
async function logoutHandler(req, res) {
    const result = await node.logout();
    res.send(result);
}
