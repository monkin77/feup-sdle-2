import node from "../../models/Node.js";
import {Router} from "express";
import {isLoggedIn} from "../middleware/auth.js";
import {canFollow, existingUser} from "../middleware/user.js";

const router = Router();

export default (app) => {
    app.use("/users", router);

    router.get("/:username/followers", getFollowersHandler);
    router.post("/:username/follow", isLoggedIn, existingUser, canFollow, followHandler);
    router.post("/:username/unfollow", unfollowHandler);
};

/**
 * Handles getting the followers of a user.
 */
async function getFollowersHandler(req, res) {
    const result = await node.getFollowers(req.params.username);
    res.json({followers: result.data.followers});
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
    const result = await node.unfollow(username);
    res.send(result);
}
