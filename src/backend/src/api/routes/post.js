import { Router } from "express";
import node from "../../models/Node.js";
import { isLoggedIn } from "../middleware/authentication.js";
import * as validators from "../middleware/validators/post.js";

const router = Router();

export default (app) => {
    app.use("/posts", router);

    router.post("/new", validators.createPost, isLoggedIn, postHandler);
    router.get("/sse", isLoggedIn, sseHandler);
};

/**
 * Handles the creation of a post by using a text property in the request body.
 */
async function postHandler(req, res) {
    const post = await node.post(req.body.text);
    res.json(post);
}

async function sseHandler(req, res) {
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("connection", "keep-alive");
    res.setHeader("Content-Type", "text/event-stream");
    res.status(200);

    // save the sse response object in the Node singleton to send updates
    node.setSSEResponse(res);

    // Set SSEResponse to null on Node in case of connection loss
    res.on("close", () => {
        console.log("SSE connection closed!");
        node.setSSEResponse(null);
    });
}