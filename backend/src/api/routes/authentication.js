import node from "../../models/Node.js";
import {Router} from "express";
import {isNotLoggedIn, isNotRegistered, validCredentials} from "../middleware/auth.js";
import {hashPassword} from "../../lib/passwords.js";

const router = Router();

export default (app) => {
    app.use("/auth", router);

    router.post("/register", isNotRegistered, registerHandler);
    router.post("/login", isNotLoggedIn, validCredentials, loginHandler);
    router.post("/logout", logoutHandler);
};

/**
 * Handles the registration of a new user. Sends a register request to the node.
 */
async function registerHandler(req, res) {
    const hashedPassword = await hashPassword(req.body.password);
    await node.register(req.body.username, hashedPassword);
    res.json({});
}

/**
 * Handles the login of a user. Sends a login request to the node.
 */
async function loginHandler(req, res) {
    const result = await node.login(req.body.username);
    res.send(result);
}

/**
 * Handles the logout of a user by calling the node's logout method.
 */
async function logoutHandler(req, res) {
    const result = await node.logout();
    res.send(result);
}
