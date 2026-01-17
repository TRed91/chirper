import { MigrationConfig } from 'drizzle-orm/migrator';
import { migrationConfig } from './lib/db/migration_config.js';

process.loadEnvFile();
export type APIConfig = {
    fileserverHits: number;
    patform: string;
};

export type DBConfig = {
    dbUrl: string,
    migrationConfig: MigrationConfig
}

export const config = {
    apiConfig: {
        fileServerHits: 0,
        platform: envOrThrow(process.env.PLATFORM),
        secret: envOrThrow(process.env.SECRET)
    },
    dbConfig: {
        dbUrl: envOrThrow(process.env.DB_URL),
        migrationConfig: migrationConfig,
    },
};

function envOrThrow(key: string | undefined): string{
    if (typeof key !== "string"){
        throw new Error("Missing Environment Variables!");
    }
    return key;
}