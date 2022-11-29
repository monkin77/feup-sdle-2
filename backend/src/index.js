import express from "express";
import * as dotenv from "dotenv";
import loadExpress from "./loaders/express.js";

dotenv.config();

const app = express();
loadExpress(app);

const port = process.env.PORT || 8080;

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
