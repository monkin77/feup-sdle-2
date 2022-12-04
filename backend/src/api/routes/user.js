import node from "../../models/Node.js";
import {Router} from "express";

const router = Router();

export default (app) => {
    app.use("/users", router);

    router.get("/:username/followers", getFollowersHandler);
    router.post("/:username/follow", followHandler);
    router.post("/:username/unfollow", unfollowHandler);
};

async function getFollowersHandler(req, res) {
    const result = await node.getFollowers(req.params.username);
    res.json({followers: result.data.followers});
}

/**
 * Handles the following of a new user.
 */
async function followHandler(req, res) {
    const username = req.params.username;
    const result = await node.follow(username);
    res.send(result);
}

/**
 * Handles the unfollowing of a user.
 */
async function unfollowHandler(req, res) {
    const username = req.params.username;
    const result = await node.unfollow(username);
    res.send(result);
}
