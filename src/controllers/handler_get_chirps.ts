import { NextFunction, Request, Response } from "express";
import { getChirp, getChirps } from "../lib/db/queries/chirps_queries.js";
import NotFoundError from "../errors/not_found.js";

export async function handlerGetChirps(req: Request, res: Response, next: NextFunction) {
    try {
        const authorId : string = typeof req.query.authorId === "string" 
            ? req.query.authorId 
            : ""; 
        
        const chrips = await getChirps(authorId);

        const sort : "asc" | "desc" = typeof req.query.sort === "string" && req.query.sort === "desc"
            ? "desc"
            : "asc"

        
        const result = sort === "asc" ? chrips : chrips.reverse();

        res.status(200).json(result);
    } catch (ex: unknown) {
        next(ex);
    }
}

export async function handlerGetChirp(req: Request, res: Response, next: NextFunction) {
    try {
        const result = await getChirp(req.params["chirpID"]);
        if (!result) {
            throw new NotFoundError("Chirp not found");
        }
        res.status(200).json(result);
    } catch (ex: unknown) {
        next(ex);
    }
}