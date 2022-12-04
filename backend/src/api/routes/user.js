import node from "../../models/Node.js";
import {Router} from "express";
import {isLoggedIn} from "../middleware/auth.js";
import {canFollow, existingUser, isFollowing} from "../middleware/user.js";

const router = Router();

export default (app) => {
    app.use("/users", router);

    router.get("/:username/followers", existingUser, getFollowersHandler);
    router.post("/:username/follow", isLoggedIn, existingUser, canFollow, followHandler);
    router.post("/:username/unfollow", isLoggedIn, existingUser, isFollowing, unfollowHandler);
};

/**
 * Handles getting the followers of a user.
 */
async function getFollowersHandler(req, res) {
    const followers = await node.getFollowers(req.params.username);
    res.json({followers});
}

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
