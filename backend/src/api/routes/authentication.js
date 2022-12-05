import node from "../../models/Node.js";
import {Router} from "express";
import {isLoggedIn, isNotLoggedIn, isNotRegistered, validCredentials} from "../middleware/authentication.js";
import {hashPassword} from "../../lib/passwords.js";
import * as validators from "../middleware/validators/authentication.js";

const router = Router();

export default (app) => {
    app.use("/auth", router);

    router.post("/register", validators.register, isNotRegistered, registerHandler);
    router.post("/login", validators.login, isNotLoggedIn, validCredentials, loginHandler);
    router.post("/logout", isLoggedIn, logoutHandler);
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
    await node.login(req.body.username);
    res.json({});
}

/**
 * Handles the logout of a user. Sends a logout request to the node.
 */
async function logoutHandler(req, res) {
    await node.logout();
    res.json({});
}
