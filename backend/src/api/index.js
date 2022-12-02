import {Router} from "express";
import {registerHandler, loginHandler} from "./routes/authentication.js";

export default () => {
    const app = Router();

    // Index endpoint
    app.get("/", (req, res) => {
        res.json({message: "Hello World!"});
    });

    
    // Routes
    app.post("/register", registerHandler);
    app.post("/login", loginHandler);

    // TODO: Test endpoint, remove later
    app.post("/stop", async (req, res) => {
        await Node.stop();
        res.json({});
    });

    return app;
};
