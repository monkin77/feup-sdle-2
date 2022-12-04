import {getContent} from "../../lib/dht.js";
import node from "../../models/Node.js";
import {StatusCodes} from "http-status-codes";

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
