import { Request, Response } from "express";

type chirpBody = {
    body: string;
};
type chirpError = {
    error: string;
};
type chirpCleaned = {
    cleanedBody: string;
};

export async function handlerValidateChirp(req: Request, res: Response) {
    
    try {
        const chirp: chirpBody = req.body;

        if (chirp.body.length > 140){
            const chirpError: chirpError = {
                error: "Chirp is too long"
            } 
            res.status(400).send(JSON.stringify(chirpError));
            return;
        }

        const chirpCleaned: chirpCleaned = {
            cleanedBody: sanitizeBody(chirp.body)
        };
        res.status(200).send(JSON.stringify(chirpCleaned));

    } catch (ex: unknown) {
        const chirpError: chirpError = {
            error: "Something went wrong"
        } 
        res.status(400).send(JSON.stringify(chirpError));
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