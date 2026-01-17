import { NextFunction, Request, Response } from "express";
import { createUser, getUserByEmail } from "../lib/db/queries/users_queries.js";
import { checkPasswordHash, getBearerToken, hashPassword, makeJWT, makeRefreshToken } from "../auth.js";
import { NewRefreshToken, RefreshToken, User } from "../lib/db/schema.js";
import { config } from "../config.js";
import { createRefreshToken, getRefreshToken, revokeRefreshToken } from "../lib/db/queries/refresh_token_queries.js";

type CreateUser = {
    email: string,
    hashedPassword: string,
}

type LoginRequestBody = {
    password: string,
    email: string,
}

type UserResponse = Omit<User, "hashedPassword">;

export async function handlerCreateUser(req: Request, res: Response, next: NextFunction) {
    try {
        const validationErrors = validateBody(req);

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
        const validationErrors = validateBody(req);

        if (validationErrors.length > 0){
            res.status(400).json(validationErrors);
            return;
        }

        const requestBody : LoginRequestBody = req.body;

        const user = await getUserByEmail(requestBody.email);
        if (!user){
            res.status(401).json({error: "Incorrect email"});
        }

        const result = await checkPasswordHash(requestBody.password, user.hashedPassword);
        if (!result){
            res.status(401).json({error: "Incorrect password"});
        }

        const accessToken = makeJWT(user.id, config.apiConfig.secret)

        const expDate = new Date()
        expDate.setDate(expDate.getDate() + 60);
        const newRefreshToken: NewRefreshToken = {
            token: makeRefreshToken(),
            userId: user.id,
            expiresAt: expDate
        };

        const refreshToken = await createRefreshToken(newRefreshToken);

        const userResponse: UserResponse | { token: string, refreshToken: string } = {
            id: user.id,
            email: user.email,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
            token: accessToken,
            refreshToken: refreshToken.token,
        };
        res.status(200).json(userResponse);
               
    } catch (ex: unknown) {
        next(ex);
    }
}

export async function handlerRefresh(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {

        const bearerToken = getBearerToken(req);
        const refreshToken = await getRefreshToken(bearerToken);
        
        if (!tokenIsValid(refreshToken)){
            res.status(401).json({ error: "Invalid token" });
            return;
        }

        const newAccessToken = makeJWT(refreshToken.userId, config.apiConfig.secret);

        res.status(200).json({ token: newAccessToken });

    } catch (ex: unknown) {
        next(ex);
    }
}

export async function handlerRevoke(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {

        const bearerToken = getBearerToken(req);
        
        const refreshToken = await getRefreshToken(bearerToken);

        if (!refreshToken){
            res.status(401);
        }
        
        await revokeRefreshToken(refreshToken.token);

        res.status(204).send();

    } catch (ex: unknown) {
        next(ex);
    }
}

function validateBody(req: Request): string[] {
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

function tokenIsValid(refreshToken : RefreshToken): boolean {
    return refreshToken && 
        !refreshToken.revokedAt && 
        refreshToken.expiresAt > new Date();
}