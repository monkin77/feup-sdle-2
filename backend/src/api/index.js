import {Router} from "express";
import authentication from "./routes/authentication.js";
import user from "./routes/user.js";
import post from "./routes/post.js";

import node from "../models/Node.js";

export default () => {
    const app = Router();

    // Life Check
    app.get("/", (req, res) => {
        res.json({online: true});
    });

    app.get("/profiles", (req, res) => {
        const profiles = node.profiles;
        res.json(profiles);
    });

    authentication(app);
    user(app);
    post(app);

    return app;
};
