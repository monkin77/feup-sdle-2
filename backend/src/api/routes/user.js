import node from "../../models/Node.js";
import { Router } from "express";
import { isLoggedIn } from "../middleware/authentication.js";
import { canFollow, existingUser, isFollowing, isUser } from "../middleware/user.js";
import { collectInfo, findRecommendedUsers, mergePostsIntoTimeline } from "../../lib/peer-content.js";
import { StatusCodes } from "http-status-codes";

const router = Router();

export default (app) => {
    app.use("/users", router);

    router.get("/:username/timeline", isLoggedIn, isUser, timelineHandler);
    router.get("/:username/info", isLoggedIn, existingUser, infoHandler);
    router.get("/:username/recommended", isLoggedIn, existingUser, isUser, recommendedHandler);
    router.post("/:username/follow", isLoggedIn, existingUser, canFollow, followHandler);
    router.post("/:username/unfollow", isLoggedIn, existingUser, isFollowing, unfollowHandler);
};

/**
 * Handles the following of a new user.
 */
async function followHandler(req, res) {
    const username = req.params.username;
    const {status, error} = await node.follow(username);

    if (error) {
        if (status == 404) {
            return res.status(StatusCodes.NOT_FOUND).json({
                error: "User not found",
            });
        } else {
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                error: "Could not follow the user",
            });
        }
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
    const {error, data} = await collectInfo(username);

    const info = error ? {} : data;

    res.json(info);
}

/**
 * 
 * @param {*} req 
 * @param {*} res 
 */
async function timelineHandler(req, res) {
    const timeline = await mergePostsIntoTimeline();
    res.json(timeline);
}

/**
 *  
 * @param {*} req
 * @param {*} res
 */
async function recommendedHandler(req, res) {
    const username = req.params.username;
    const recommended = await findRecommendedUsers(username);
    res.json(recommended);
}
