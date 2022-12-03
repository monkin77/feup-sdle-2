import {Router} from "express";
import {registerHandler, loginHandler} from "./routes/authentication.js";
import {followHandler, unfollowHandler} from "./routes/following.js";
import node from "../models/Node.js";

export default () => {
    const app = Router();

    // Index endpoint
    app.get("/", (req, res) => {
        res.json({message: "Hello World!"});
    });

    
    // Routes
    app.post("/register", registerHandler);
    app.post("/login", loginHandler);
    app.post("/follow", followHandler);
    app.post("/unfollow", unfollowHandler);

    // TODO: Test endpoint, remove later
    app.post("/stop", async (req, res) => {
        await node.stop();
        res.json({});
    });

    return app;
};
