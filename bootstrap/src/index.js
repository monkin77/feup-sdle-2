import * as dotenv from "dotenv";
import BootstrapNode from "./BootstrapNode.js";

dotenv.config();

await BootstrapNode.start();

console.log("Bootstrap Node: ", BootstrapNode.getMultiaddrs());