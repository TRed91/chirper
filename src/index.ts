import express from "express";
import { handlerReadiness } from "./controllers/handler_readiness.js"
import { middlewareLogResponses } from "./middleware/middleware_log_responses.js";
import { middlewareMetricsInc } from "./middleware/middleware_metrics_inc.js";
import { handlerMetrics, handlerReset } from "./controllers/handler_metrics.js";
import { handlerValidateChirp } from "./controllers/handler_validate_chirp.js";

const app = express();
const PORT = 8080;

app.use(express.json());

app.use("/app", middlewareMetricsInc);
app.use("/app", express.static("./src/app"));

app.use(middlewareLogResponses);

app.get("/api/healthz", handlerReadiness);
app.post("/api/validate_chirp", handlerValidateChirp);

app.get("/admin/metrics", handlerMetrics);
app.post("/admin/reset", handlerReset);

app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`)
});
