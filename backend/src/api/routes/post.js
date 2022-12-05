import {Router} from "express";
import node from "../../models/Node.js";
import {isLoggedIn} from "../middleware/authentication.js";
import * as validators from "../middleware/validators/post.js";

const router = Router();

export default (app) => {
    app.use("/posts", router);

    router.post("/new", validators.createPost, isLoggedIn, postHandler);
};

/**
 * Handles the creation of a post by using a text property in the request body.
 */
async function postHandler(req, res) {
    const post = await node.post(req.body.text);
    res.json(post);
}
