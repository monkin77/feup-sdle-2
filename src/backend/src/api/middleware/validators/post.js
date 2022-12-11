import {useExpressValidators} from "./utils.js";
import {body} from "express-validator";

export const createPost = useExpressValidators([
    body("text")
        .exists().withMessage("Text is required").bail()
        .isString().withMessage("Text must be a string").bail()
        .isLength({min: 5, max: 1000}).withMessage("Text must be between 5 and 1000 characters long")
]);
