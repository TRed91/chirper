import { NextFunction, Request, Response } from "express";
import { createUser, getUserByEmail, updateUser } from "../lib/db/queries/users_queries.js";
import { checkPasswordHash, getBearerToken, hashPassword, makeJWT, makeRefreshToken, validateJWT } from "../auth.js";
import { NewRefreshToken, RefreshToken, User } from "../lib/db/schema.js";
import { config } from "../config.js";
import { createRefreshToken, getRefreshToken, revokeRefreshToken } from "../lib/db/queries/refresh_token_queries.js";
import BadRequestError from "../errors/bad_request.js";
import UnauthorizedError from "../errors/unauthorized.js";

type CreateUser = {
    email: string,
    hashedPassword: string,
}

export type UpdateUser = CreateUser & {
    id: string
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
            throw new BadRequestError(JSON.stringify({ validationErrors: validationErrors }))
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
            isChirpyRed: result.isChirpyRed
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
            throw new BadRequestError(JSON.stringify({ validationErrors: validationErrors }))
        }

        const requestBody : LoginRequestBody = req.body;

        const user = await getUserByEmail(requestBody.email);
        if (!user){
            throw new UnauthorizedError("Incorrect email");
        }

        const result = await checkPasswordHash(requestBody.password, user.hashedPassword);
        if (!result){
            throw new UnauthorizedError("Incorrect password");
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

        const userResponse: UserResponse & { token: string, refreshToken: string } = {
            id: user.id,
            email: user.email,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
            isChirpyRed: user.isChirpyRed,
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
            throw new UnauthorizedError("Invalid token")
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
            throw new UnauthorizedError("Invalid refresh token")
        }
        
        await revokeRefreshToken(refreshToken.token);

        res.status(204).send();

    } catch (ex: unknown) {
        next(ex);
    }
}

export async function handlerUpdateUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const validationErrors = validateBody(req);

        if (validationErrors.length > 0) {
            throw new BadRequestError(JSON.stringify({ validationErrors: validationErrors }))
        }

        const accessToken = getBearerToken(req);
        const userId = await validateJWT(accessToken, config.apiConfig.secret);

        const hashedPassword = await hashPassword(req.body.password);

        const userUpdate: UpdateUser = {
            id: userId,
            email: req.body.email,
            hashedPassword: hashedPassword,
        };

        const result = await updateUser(userUpdate);

        const response: UserResponse = {
            id: result.id,
            email: result.email,
            createdAt: result.createdAt,
            updatedAt: result.updatedAt,
            isChirpyRed: result.isChirpyRed,
        }

        res.status(200).json(response);

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