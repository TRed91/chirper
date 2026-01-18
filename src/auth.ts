import argon2 from "argon2";
import { Request } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import crypto from "crypto"
import BadRequestError from "./errors/bad_request.js";
import UnauthorizedError from "./errors/unauthorized.js";

export async function hashPassword(password:string): Promise<string> {
    const hashed = await argon2.hash(password);
    return hashed;
}

export async function checkPasswordHash(password: string, hash: string): Promise<boolean> {
    const result = await argon2.verify(hash, password);
    return result;
}

export function makeJWT(userId: string, secret: string): string {

    type Payload = Pick<JwtPayload, "iss" | "sub" | "iat" | "exp">;
    const issuedAtInSeconds = Math.floor(Date.now() / 1000);

    const payload: Payload = {
        iss: "chirpy",
        sub: userId,
        iat: issuedAtInSeconds,
        exp: issuedAtInSeconds + 3600
    }

    const token = jwt.sign(payload, secret)
    return token;
}

export function validateJWT(tokenString: string, secret: string): string {
    try {
        const result = jwt.verify(tokenString, secret);
        
        const user = result.sub;
        if (typeof user !== "string"){
            throw new UnauthorizedError("JWT invalid or expired");
        }
        return user;
    } catch (ex: unknown) {
        throw new UnauthorizedError("JWT invalid or expired");
    }
    
}

export function getBearerToken(req: Request): string {
    const token = req.get("Authorization");
    if (!token) {
        throw new UnauthorizedError("Missing or invalid JWT token")
    }
    return token.substring(7);
} 

export function getAPIKey(req: Request): string {
    const token = req.get("Authorization");
    if (!token) {
        throw new UnauthorizedError("Missing Api key")
    }
    return token.substring(7);
}

export function makeRefreshToken(): string {
    const bytes = crypto.randomBytes(32).toString("hex");
    return bytes;
}