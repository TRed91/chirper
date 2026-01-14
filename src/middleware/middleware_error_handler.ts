import { NextFunction, Request, Response } from "express";
import BadRequestError from "../errors/bad_request.js";
import ForbiddenError from "../errors/forbidden.js";
import NotFoundError from "../errors/not_found.js";
import UnauthorizedError from "../errors/unauthorized.js";

export function middlewareErrorHandler(
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction
) {
    console.log(err.message);

    if (err instanceof BadRequestError){
        res.status(400).json({
            error: err.message
        })
        return;
    }

    if (err instanceof ForbiddenError){
        res.status(403).json({
            error: err.message
        })
        return;
    }

    if (err instanceof UnauthorizedError){
        res.status(401).json({
            error: err.message
        })
        return;
    }

    if (err instanceof NotFoundError){
        res.status(404).json({
            error: err.message
        })
        return;
    }

    res.status(500).json({
        error: "Something went wrong on our end"
    });
}