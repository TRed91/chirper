import { NextFunction, Request, Response } from "express";
import { getChirp, getChirps } from "../lib/db/queries/chirps_queries.js";

export async function handlerGetChirps(req: Request, res: Response, next: NextFunction) {
    try {
        const result = await getChirps();
        res.status(200).json(result);
    } catch (ex: unknown) {
        next(ex);
    }
}

export async function handlerGetChirp(req: Request, res: Response, next: NextFunction) {
    try {
        const result = await getChirp(req.params["chirpID"]);
        if (!result) {
            res.status(404);
            return;
        }
        res.status(200).json(result);
    } catch (ex: unknown) {
        next(ex);
    }
}