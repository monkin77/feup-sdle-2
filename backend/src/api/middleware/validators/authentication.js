import {useExpressValidators} from "./utils.js";
import {body} from "express-validator";

export const register = useExpressValidators([
    body("username")
        .exists().withMessage("Username is required").bail()
        .isString().withMessage("Username must be a string"),

    body("password")
        .exists().withMessage("Password is required").bail()
        .isString().withMessage("Password must be a string").bail()
        .isLength({min: 8}).withMessage("Password must be at least 8 characters long")
        .matches(/\d/).withMessage("Password must contain at least one number")
]);

export const login = useExpressValidators([
    body("username")
        .exists().withMessage("Username is required").bail()
        .isString().withMessage("Username must be a string"),

    body("password")
        .exists().withMessage("Password is required").bail()
        .isString().withMessage("Password must be a string")
]);
