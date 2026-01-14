import { NextFunction, Request, Response } from "express";
import BadRequestError from "../errors/bad_request.js";

type chirpBody = {
    body: string;
};
type chirpCleaned = {
    cleanedBody: string;
};

export async function handlerValidateChirp(req: Request, res: Response, next: NextFunction) {
    
    try {
        const chirp: chirpBody = req.body;

        if (chirp.body.length > 140){
            throw new BadRequestError("Chirp is too long. Max length is 140");
        }

        const chirpCleaned: chirpCleaned = {
            cleanedBody: sanitizeBody(chirp.body)
        };
        res.status(200).send(JSON.stringify(chirpCleaned));

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