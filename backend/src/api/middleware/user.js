import node from "../../models/Node.js";
import { StatusCodes } from "http-status-codes";
import { getContent } from "../../lib/peer-content.js";

/**
 * Verifies if the user can follow another.
 */
export const canFollow = async(req, res, next) => {
    const username = req.params.username;
    if (username === node.username) {
        return next({
            status: StatusCodes.CONFLICT,
            error: "You cannot follow yourself",
        });
    } else if (node.info().hasFollowing(username)) {
        return next({
            status: StatusCodes.CONFLICT,
            error: `You're already following ${username}`,
        });
    }

    return next();
};

/**
 * Verifies if the user is following another.
 */
export const isFollowing = async(req, res, next) => {
    const username = req.params.username;
    if (!node.info().hasFollowing(username)) {
        return next({
            status: StatusCodes.CONFLICT,
            error: `You're not following ${username}`,
        });
    }

    return next();
};

/**
 * Verifies if the user is registered on the network.
 */
export const existingUser = async(req, res, next) => {
    try {
        await getContent(node.getNode(), `/${req.params.username}`);
    } catch (err) {
        return next({
            status: StatusCodes.NOT_FOUND,
            error: "User does not exist",
        });
    }

    return next();
};