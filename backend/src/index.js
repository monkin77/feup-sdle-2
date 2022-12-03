import express from "express";
import * as dotenv from "dotenv";
import loadExpress from "./loaders/express.js";
import node from "./models/Node.js";

dotenv.config();

const app = express();
loadExpress(app);

await node.start();

const port = process.env.PORT || 8080;

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

/*
TODO: Figure out how data is stored persistently
TODO: Confirm if we really need relay nodes opposed to just using bootstrap nodes
*/