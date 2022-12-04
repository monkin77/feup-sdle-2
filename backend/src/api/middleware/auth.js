import {getContent} from "../../lib/dht.js";
import node from "../../models/Node.js";
import {StatusCodes} from "http-status-codes";
import {comparePassword} from "../../lib/passwords.js";

/**
 * Verifies if the user is not registered on the network.
 */
export const isNotRegistered = async (req, res, next) => {
    try {
        await getContent(node.getNode(), `/${req.body.username}`);
        return next({
            status: StatusCodes.UNPROCESSABLE_ENTITY,
            error: "User already exists",
        });
    } catch (err) {
        if (err.code !== "ERR_NOT_FOUND" && err.code !== "ERR_NO_PEERS_IN_ROUTING_TABLE") {
            throw err;
        }
    }

    return next();
};

/**
 * Verifies if the user is not logged in.
 */
export const isNotLoggedIn = async (req, res, next) => {
    if (node.isLoggedIn()) {
        return next({
            status: StatusCodes.CONFLICT,
            error: "Already logged in",
        });
    }

    return next();
};

/**
 * Verifies if the user is logged in.
 */
export const isLoggedIn = async (req, res, next) => {
    if (!node.isLoggedIn()) {
        return next({
            status: StatusCodes.CONFLICT,
            error: "Not logged in",
        });
    }

    return next();
};

/**
 * Verifies if the given credentials are valid.
 * Checks if the user is registered and if the password is correct.
 */
export const validCredentials = async (req, res, next) => {
    try {
        const hashedPassword = await getContent(node.getNode(), `/${req.body.username}`);
        if (!(await comparePassword(req.body.password, hashedPassword))) {
            return next({
                status: StatusCodes.UNAUTHORIZED,
                error: "Wrong credentials",
            });
        }
    } catch (err) {
        return next({
            status: StatusCodes.UNPROCESSABLE_ENTITY,
            error: "Username does not exist",
        });
    }

    return next();
};
