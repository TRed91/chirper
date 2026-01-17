import { NewRefreshToken, RefreshToken, refreshTokens } from "../schema.js";
import { db } from "../index.js";
import { eq, sql, and, isNull } from "drizzle-orm";

export async function createRefreshToken(newToken: NewRefreshToken) {
    const [result] = await db.insert(refreshTokens).values(newToken).returning();
    return result;
}

export async function revokeRefreshToken(token: string) {
    await db.update(refreshTokens)
        .set({ revokedAt: sql`NOW()` })
        .where(eq(refreshTokens.token, token));
}

export async function getRefreshTokenByUserId(userId: string) {
    const [result] = await db.select()
        .from(refreshTokens)
        .where(and(
            eq(refreshTokens.userId, userId), 
            isNull(refreshTokens.revokedAt)));
    return result;
}

export async function getRefreshToken(tokenString: string) {
    const [result] = await db.select()
        .from(refreshTokens)
        .where(eq(refreshTokens.token, tokenString));
    return result;
}