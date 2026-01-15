import { defineConfig } from 'drizzle-kit';
import { config } from './src/config.ts'

export default defineConfig({
    schema: "src/lib/db/schema.ts",
    out: "src/lib/db/",
    dialect: "postgresql",
    dbCredentials: {
        url: config.dbConfig.dbUrl,
    },
});