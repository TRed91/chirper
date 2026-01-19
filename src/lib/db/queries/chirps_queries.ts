import { NewChirp, chirps, Chirp } from "../schema.js";
import { db } from "../index.js";
import { eq } from "drizzle-orm";

export async function createChirp(chirp: NewChirp): Promise<Chirp> {
    const [result] = await db.insert(chirps).values(chirp).returning();
    return result;
}

export async function getChirps(authorId: string): Promise<Chirp[]> {
    let result : Chirp[] = [];
    if (authorId){
        result = await db.select()
            .from(chirps)
            .where(eq(chirps.userId, authorId))
            .orderBy(() => chirps.createdAt);
    } else {
        result = await db.select()
            .from(chirps)
            .orderBy(() => chirps.createdAt);
    }
    return result;
}

export async function getChirp(id: string): Promise<Chirp> {
    const [result] = await db.select().from(chirps).where(eq(chirps.id, id));
    return result;
}

export async function deleteChirp(id: string): Promise<void> {
    await db.delete(chirps).where(eq(chirps.id, id));
}