import { NewChirp, chirps } from "../schema.js";
import { db } from "../index.js";
import { eq } from "drizzle-orm";

export async function createChirp(chirp: NewChirp): Promise<NewChirp> {
    const [result] = await db.insert(chirps).values(chirp).returning();
    return result;
}

export async function getChirps(): Promise<NewChirp[]> {
    const result = await db.select().from(chirps).orderBy(() => chirps.createdAt);
    return result;
}

export async function getChirp(id: string): Promise<NewChirp> {
    const [result] = await db.select().from(chirps).where(eq(chirps.id, id));
    return result;
}