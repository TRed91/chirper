import { NewUser, users, User } from "../schema.js";
import { db } from "../index.js";
import { eq } from "drizzle-orm";

export async function createUser(user : NewUser): Promise<User> {
    const [result] = await db
        .insert(users)
        .values(user)
        .onConflictDoNothing()
        .returning();
    
    return result;
}

export async function deleteUsers(): Promise<void> {
    await db.delete(users);
}

export async function getUserByEmail(email: string): Promise<User> {
    const [result] = await db.select().from(users).where(eq(users.email, email));
    return result;
}