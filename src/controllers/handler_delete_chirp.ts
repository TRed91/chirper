import { NextFunction, Request, Response } from "express";
import { deleteChirp, getChirp, getChirps } from "../lib/db/queries/chirps_queries.js";
import { getBearerToken, validateJWT } from "../auth.js";
import { config } from "../config.js";
import NotFoundError from "../errors/not_found.js";
import ForbiddenError from "../errors/forbidden.js";

export async function handlerDeleteChirp(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const accessToken = getBearerToken(req);
        const userId = validateJWT(accessToken, config.apiConfig.secret);

        const chirp = await getChirp(req.params["chirpID"]);
        if (!chirp) {
            throw new NotFoundError("Chirp not found");
        }
        if (chirp.userId !== userId) {
            throw new ForbiddenError("Unauthorized chrip delete attempt");
        }

        await deleteChirp(chirp.id);

        res.status(204).send();

    } catch (ex: unknown) {
        next(ex);
    }
}