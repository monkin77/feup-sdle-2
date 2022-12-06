import node from "../../models/Node.js";
import {Router} from "express";
import {isLoggedIn} from "../middleware/authentication.js";
import {canFollow, existingUser, isFollowing} from "../middleware/user.js";
import { collectInfo } from "../../lib/peer-content.js";

const router = Router();

export default (app) => {
    app.use("/users", router);
    
    router.get("/:username/info", isLoggedIn, existingUser, infoHandler);
    router.post("/:username/follow", isLoggedIn, existingUser, canFollow, followHandler);
    router.post("/:username/unfollow", isLoggedIn, existingUser, isFollowing, unfollowHandler);
};

/**
 * Handles the following of a new user.
 */
async function followHandler(req, res) {
    const username = req.params.username;
    await node.follow(username);
    res.json({});
}

/**
 * Handles the unfollowing of a user.
 */
async function unfollowHandler(req, res) {
    const username = req.params.username;
    await node.unfollow(username);
    res.json({});
}

/**
 * Handles getting the info of a user (itself or following).
 */
async function infoHandler(req, res) {
    const username = req.params.username;
    const info = username === node.username || node.info().hasFollowing(username)
        ? node.getInfo(username)
        : await collectInfo(node, username);
        
    res.json(info);
}