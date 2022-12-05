import {Router} from "express";
import authentication from "./routes/authentication.js";
import user from "./routes/user.js";
import post from "./routes/post.js";

export default () => {
    const app = Router();

    // Life Check
    app.get("/", (req, res) => {
        res.json({online: true});
    });

    authentication(app);
    user(app);
    post(app);

    return app;
};
