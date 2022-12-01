import express from "express";
import * as dotenv from "dotenv";
import loadExpress from "./loaders/express.js";
import Node from "./models/Node.js";

dotenv.config();

const app = express();
loadExpress(app);

await Node.start();

const port = process.env.PORT || 8080;

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

async function registerHandler(req, res) {
    const username = req.body.username;
    const password = req.body.password;
    const result = await Node.register(username, password);
    res.send(result);
}

// Routes
app.post("/register", registerHandler);

/*
TODO: Figure out how data is stored persistently
TODO: Confirm if we really need relay nodes opposed to just using bootstrap nodes
*/