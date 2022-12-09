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

    // TODO: this is for debugging purposes only
    app.get("/profiles", (req, res) => {
        const profiles = Object.values(node.profiles).map(profile => profile.toJson());
        res.json(profiles);
    });

    authentication(app);
    user(app);
    post(app);

    return app;
};
