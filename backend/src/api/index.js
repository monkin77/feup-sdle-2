import {Router} from "express";
import Node from "../models/Node.js";

export default () => {
    const app = Router();

    // Index endpoint
    app.get("/", (req, res) => {
        res.json({message: "Hello World!"});
    });

    // TODO: Test endpoint, remove later
    app.post("/stop", async (req, res) => {
        await Node.stop();
        res.json({});
    });

    return app;
};
