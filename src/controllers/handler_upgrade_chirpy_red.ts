import { NextFunction, Request, Response } from "express";
import BadRequestError from "../errors/bad_request.js";
import { upgradeUserToChirpyRed } from "../lib/db/queries/users_queries.js";
import NotFoundError from "../errors/not_found.js";
import { getAPIKey } from "../auth.js";
import { config } from "../config.js";
import UnauthorizedError from "../errors/unauthorized.js";

type ValidationResult = {
    result: {
        event: string,
        data: {
            userId: string
        }
    } | null,
    errors: string[]
}

export async function handlerUpgradeChirpyRed(req: Request, res: Response, next: NextFunction): Promise<void> {
    try{
        const validationResult: ValidationResult = validateBody(req);
        if (!validationResult.result){
            throw new BadRequestError(
                JSON.stringify({ validationErrors: validationResult.errors })
            );
        }
        if (validationResult.result.event !== "user.upgraded"){
            res.status(204).send();
            return;
        }

        const apiKey = getAPIKey(req);
        if (apiKey !== config.apiConfig.polkaKey){
            throw new UnauthorizedError("Invalid or missing API key");
        }

        const result = await upgradeUserToChirpyRed(validationResult.result.data.userId);

        if (!result) {
            throw new NotFoundError("User not found");
        }

        res.status(204).send()

    } catch (ex: unknown) {
        next(ex);
    }
    

}

function validateBody(req: Request): ValidationResult {
    const errors: string[] = [];

    if (!("event" in req.body)){
        errors.push("Missing 'event' field");
    }
    if (!("data" in req.body)){
        errors.push("Missing 'data' field");
    }
    if("data" in req.body && !("userId" in req.body.data)) {
        errors.push("Missing 'userId' field");
    }

    if (errors.length > 0){
        return {
            result: null,
            errors: errors
        }
    }

    return {
        result: {
            event: req.body.event,
            data: {
                userId: req.body.data.userId
            }
        },
        errors: [],
    };
}