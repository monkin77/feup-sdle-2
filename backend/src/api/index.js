import {Router} from "express";

export default () => {
    const app = Router();

    // Index endpoint
    app.get("/", (req, res) => {
        res.json({message: "Hello World!"});
    });

    return app;
}
