import { NextFunction, Request, Response } from "express";
import BadRequestError from "../errors/bad_request.js"
import { createChirp } from "../lib/db/queries/chirps_queries.js";

type ChirpBody = {
    body: string,
    userId: string,
};

const MAX_CHAR_LENGTH = 140;

export async function handlerCreateChirp(req: Request, res: Response, next: NextFunction) {
    try {

        const payload: ChirpBody = req.body;

        if (payload.body.length > MAX_CHAR_LENGTH){
            throw new BadRequestError("Chirp is too long. Max length is 140");
        }

        const sanitizedChirp = sanitizeBody(payload.body);

        const result = await createChirp({ 
            body: sanitizedChirp, 
            userId: payload.userId 
        });

        res.status(201).json(result);

    } catch (ex: unknown) {
        next(ex);
    }
}

function sanitizeBody(body: string): string {
    const words : string[] = body.split(" ");
    for (let i = 0; i < words.length; i++){
        if (words[i].toLowerCase() === "kerfuffle" || 
            words[i].toLowerCase() === "sharbert" ||
            words[i].toLowerCase() === "fornax") {
                words[i] = "****";
            }
    }
    return words.join(" ");
}