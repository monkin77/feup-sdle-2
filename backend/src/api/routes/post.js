import {Router} from "express";
import node from "../../models/Node.js";

const router = Router();

export default (app) => {
    app.use("/posts", router);

    router.post("/new", postHandler);
};

/**
 * Handles the creation of a post by using a text property in the request body.
 */
async function postHandler(req, res) {
    const text = req.body.text;
    const result = await node.post(text);
    res.send(result);
}
