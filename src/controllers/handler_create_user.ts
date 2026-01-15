import { NextFunction, Request, Response } from "express";
import { createUser } from "../lib/db/queries/users_queries.js";

export async function handlerCreateUser(req: Request, res: Response, next: NextFunction) {
    try {

        const email: { email: string } = req.body;
        const result = await createUser(email);
        res.status(201).json(result);

    } catch (ex: unknown) {
        next(ex);
    }
}