import {Router} from "express";
import Node from "../models/Node.js";

export default () => {
    const app = Router();

    // Index endpoint
    app.get("/", (req, res) => {
        res.json({message: "Hello World!"});
    });

    
    // Routes
    app.post("/register", registerHandler);

    // TODO: Test endpoint, remove later
    app.post("/stop", async (req, res) => {
        await Node.stop();
        res.json({});
    });

    return app;
};


async function registerHandler(req, res) {
    const username = req.body.username;
    const password = req.body.password;
    const result = await Node.register(username, password);
    res.send(result);
}