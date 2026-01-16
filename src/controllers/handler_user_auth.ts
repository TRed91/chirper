import { NextFunction, Request, Response } from "express";
import { createUser, getUserByEmail } from "../lib/db/queries/users_queries.js";
import { checkPasswordHash, hashPassword } from "../auth.js";
import { NewUser } from "../lib/db/schema.js";

type CreateUser = {
    email: string,
    hashedPassword: string,
}

type UserResponse = Omit<NewUser, "hashedPassword">;

export async function handlerCreateUser(req: Request, res: Response, next: NextFunction) {
    try {
        const validationErrors = validBody(req);

        if (validationErrors.length > 0){
            res.status(400).json({errors: validationErrors});
            return;
        }

        const hashedPassword = await hashPassword(req.body.password);

        const user: CreateUser = {
            email: req.body.email,
            hashedPassword: hashedPassword,
        };
        
        const result = await createUser(user);
        const response : UserResponse = {
            id: result.id,
            email: result.email,
            createdAt: result.createdAt,
            updatedAt: result.updatedAt,
        }
        res.status(201).json(response);

    } catch (ex: unknown) {
        next(ex);
    }
}

export async function handlerLoginUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const validationErrors = validBody(req);

        if (validationErrors.length > 0){
            res.status(400).json(validationErrors);
            return;
        }

        const user = await getUserByEmail(req.body.email);

        if (user && user.hashedPassword){
            const result = await checkPasswordHash(req.body.password, user.hashedPassword);
            if (result){
                const userResponse: UserResponse = {
                    id: user.id,
                    email: user.email,
                    createdAt: user.createdAt,
                    updatedAt: user.updatedAt,
                };
                res.status(200).json(userResponse);
                return;
            }
        }
        res.status(401).json({error: "Incorrect email or password"});
    } catch (ex: unknown) {
        next(ex);
    }
}

function validBody(req: Request): string[] {
    const errors: string[] = [];
    if ("email" in req.body){
        if (!req.body.email){
            errors.push("Email is not a valid email Adress.");
        }
    } else {
        errors.push("Email missing.");
    }
    if ("password" in req.body){
        if (!req.body.password){
            errors.push("Password is not valid.");
        }
    } else {
        errors.push("Password missing.");
    }
    return errors;
}