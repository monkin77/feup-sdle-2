import node from "../../models/Node.js";
import { Router } from "express";
import { isLoggedIn } from "../middleware/authentication.js";
import { canFollow, existingUser, isFollowing, isUser } from "../middleware/user.js";
import { collectInfo, mergePostsIntoTimeline } from "../../lib/peer-content.js";

const router = Router();

export default (app) => {
    app.use("/users", router);

    router.get("/:username/timeline", isLoggedIn, isUser, timelineHandler);
    router.get("/:username/info", isLoggedIn, existingUser, infoHandler);
    router.post("/:username/follow", isLoggedIn, existingUser, canFollow, followHandler);
    router.post("/:username/unfollow", isLoggedIn, existingUser, isFollowing, unfollowHandler);
};

/**
 * Handles the following of a new user.
 */
async function followHandler(req, res) {
    const username = req.params.username;
    const status = await node.follow(username);

    if (!status) {
        return res.status(500).json({
            error: "Could not follow user",
        });
    }

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
    let info = username === node.username || node.info().hasFollowing(username) ?
        node.getInfo(username) :
        await collectInfo(username);

    if (info == null) info = {};

    res.json(info);
}

async function timelineHandler(req, res) {
    const timeline = mergePostsIntoTimeline();
    res.json(timeline);
}