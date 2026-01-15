import express from "express";
import postgres from "postgres";
import { migrate } from "drizzle-orm/postgres-js/migrator"
import { drizzle } from "drizzle-orm/postgres-js";
import { config } from "./config.js";
import { handlerReadiness } from "./controllers/handler_readiness.js"
import { middlewareLogResponses } from "./middleware/middleware_log_responses.js";
import { middlewareMetricsInc } from "./middleware/middleware_metrics_inc.js";
import { handlerMetrics, handlerReset } from "./controllers/handler_metrics.js";
import { middlewareErrorHandler } from "./middleware/middleware_error_handler.js";
import { handlerCreateUser } from "./controllers/handler_create_user.js";
import { handlerCreateChirp } from "./controllers/handler_create_chirp.js";
import { handlerGetChirp, handlerGetChirps } from "./controllers/handler_get_chirps.js";

const migrationsClient = postgres(config.dbConfig.dbUrl, { max: 1 });
await migrate(drizzle(migrationsClient), config.dbConfig.migrationConfig);

const app = express();
const PORT = 8080;

app.use(express.json());

app.use("/app", middlewareMetricsInc);
app.use("/app", express.static("./src/app"));

app.use(middlewareLogResponses);

app.get("/api/healthz", handlerReadiness);
app.post("/api/users", handlerCreateUser);
app.post("/api/chirps", handlerCreateChirp);
app.get("/api/chirps", handlerGetChirps);
app.get("/api/chirps/:chirpID", handlerGetChirp);

app.get("/admin/metrics", handlerMetrics);
app.post("/admin/reset", handlerReset);

app.use(middlewareErrorHandler);

app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`)
});
