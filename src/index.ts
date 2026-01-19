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
import { handlerCreateUser, handlerLoginUser, handlerRefresh, handlerRevoke, handlerUpdateUser } from "./controllers/handler_user_auth.js";
import { handlerCreateChirp } from "./controllers/handler_create_chirp.js";
import { handlerDeleteChirp } from "./controllers/handler_delete_chirp.js";
import { handlerGetChirp, handlerGetChirps } from "./controllers/handler_get_chirps.js";
import { handlerUpgradeChirpyRed } from "./controllers/handler_upgrade_chirpy_red.js";

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
app.put("/api/users", handlerUpdateUser);

app.post("/api/login", handlerLoginUser);

app.post("/api/chirps", handlerCreateChirp);
app.get("/api/chirps{/:authorId}{/:sort}", handlerGetChirps);
app.get("/api/chirps/:chirpID", handlerGetChirp);
app.delete("/api/chirps/:chirpID", handlerDeleteChirp);

app.post("/api/refresh", handlerRefresh);
app.post("/api/revoke", handlerRevoke);

app.post("/api/polka/webhooks", handlerUpgradeChirpyRed)

app.get("/admin/metrics", handlerMetrics);
app.post("/admin/reset", handlerReset);

app.use(middlewareErrorHandler);

app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`)
});
