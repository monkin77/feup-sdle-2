import express from "express";
import * as dotenv from "dotenv";
import loadExpress from "./loaders/express.js";
import Node from "./models/Node.js";
import RelayNode from "./models/RelayNode.js";

dotenv.config();

const app = express();
loadExpress(app);

await RelayNode.start();
await new Node(RelayNode.getMultiaddrs()).start();

const port = process.env.PORT || 8080;

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});