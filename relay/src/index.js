import * as dotenv from "dotenv";
import RelayNode from "./RelayNode.js";

dotenv.config();

await RelayNode.start();

console.log("Relay Node: ", RelayNode.getMultiaddrs());