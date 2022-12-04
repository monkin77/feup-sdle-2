import { Router } from "express";
import {
    registerHandler,
    loginHandler,
    logoutHandler,
} from "./routes/authentication.js";
import {
    followHandler,
    unfollowHandler,
    postHandler,
} from "./routes/following.js";
import node from "../models/Node.js";

export default () => {
    const app = Router();

    // Index endpoint
    app.get("/", (req, res) => {
        res.json({ message: "Hello World!" });
    });

    // Routes
    app.post("/register", registerHandler);
    app.post("/login", loginHandler);
    app.post("/logout", logoutHandler);
    app.post("/follow", followHandler);
    app.post("/unfollow", unfollowHandler);
    app.post("/post", postHandler);

    // TODO: Test endpoint, remove later
    app.post("/stop", async (req, res) => {
        await node.stop();
        res.json({});
    });

    return app;
};
