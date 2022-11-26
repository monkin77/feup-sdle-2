import express from "express";
import * as dotenv from "dotenv";

dotenv.config();

const app = express();
const port = process.env.PORT || 8080;

// TODO: Move this configuration into a loaders package
app.use(express.json());

// Adding headers (CORS)
app.use((_, res, next) => {
    // Allow connections for all origins
    res.setHeader("Access-Control-Allow-Origin", process.env.CORS_ALLOW_ORIGIN);
    // Allowed request methods
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, PATCH, DELETE");
    // Allowed request headers
    res.setHeader("Access-Control-Allow-Headers", "X-Requested-With, content-type, authorization");
    // Because we need the website to include cookies in the requests sent
    // to the API (we are using sessions)
    res.setHeader("Access-Control-Allow-Credentials", true);
    // Continue to next layer of middleware
    return next();
});

app.get("/", (req, res) => {
    res.json({ message: "Hello World!" });
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
