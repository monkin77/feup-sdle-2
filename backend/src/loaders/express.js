import express from "express";
import apiRoutes from "../api/index.js";
import {StatusCodes} from "http-status-codes";

export default (app) => {
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

    app.use(apiRoutes());

    // Custom error handler
    // eslint-disable-next-line no-unused-vars
    app.use((err, req, res, _) => {
        const {status = StatusCodes.INTERNAL_SERVER_ERROR, ...msg} = err;

        if (!msg.error) {
            console.error(err);
            msg.error = "Unexpected Error";
        }
        res.status(status).json(msg);
    });
};
