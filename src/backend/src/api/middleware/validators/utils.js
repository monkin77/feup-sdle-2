// Automatically run validators in order to have a standardized error response
import {validationResult} from "express-validator";
import {StatusCodes} from "http-status-codes";

export const useExpressValidators = (validators) => async (req, res, next) => {
    await Promise.all(validators.map((validator) => validator.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
        return next();
    }

    return next({
        status: StatusCodes.BAD_REQUEST,
        errors: errors.array(),
    });
};
