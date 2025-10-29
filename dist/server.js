import "dotenv/config";
import express from "express";
import cors from "cors";
import pino from "pino";
import pinoHttp from "pino-http";
import cron from "node-cron";
import { router as apiRouter } from "./routes/api.js"; // ✅ must include .js
import { initOAuth } from "./services/qboClient.js";
// import { initOAuth } from "./services/qboClient";
// import { pollBuildiumDeltas } from "./jobs/poller";
const app = express();
const logger = pino({ level: "info" });
app.use(express.json({ limit: "1mb" }));
app.use(cors());
app.use(pinoHttp({ logger }));
app.get("/health", (_req, res) => res.json({ ok: true }));
app.use('/', apiRouter);
// Initialize OAuth client
await initOAuth();
// Cron: poll Buildium every 5 minutes (Asia/Manila)
cron.schedule('*/5 * * * *', async () => {
    try {
        // await pollBuildiumDeltas();
    }
    catch (e) {
        logger.error(e, 'Poller failed');
    }
}, { timezone: process.env.TIMEZONE || 'Asia/Manila' });
const port = process.env.PORT || 4000;
app.listen(port, () => {
    logger.info(`Buildium QBO API running at http://localhost:${port}`);
});
