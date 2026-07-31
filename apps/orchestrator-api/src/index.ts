import "dotenv/config";
import express from "express";
import cors from "cors";
import { agentsRouter } from "./routes/agents.js";
import { skillsRouter } from "./routes/skills.js";
import { workflowsRouter } from "./routes/workflows.js";
import { executionsRouter } from "./routes/executions.js";
import { providersRouter } from "./routes/providers.js";
import { healthRouter } from "./routes/health.js";
import { projectsRouter } from "./routes/projects.js";
import { workspaceRouter } from "./routes/workspace.js";
import { ROOT_DIR } from "./config.js";

const app = express();
const PORT = process.env["API_PORT"] ?? 3001;

// ── Middleware ────────────────────────────────────────────────────────────
app.use(cors({
  origin: (origin, callback) => {
    // Consenti: no-origin (curl/Postman), localhost, 127.x, 192.168.x, 10.x, 172.16-31.x
    if (
      !origin ||
      origin.startsWith("http://localhost") ||
      origin.startsWith("http://127.") ||
      origin.match(/^https?:\/\/(192\.168\.|10\.|172\.(1[6-9]|2[0-9]|3[01])\.)/))
    {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));
app.use(express.json({ limit: "1mb" }));

// ── Routes ────────────────────────────────────────────────────────────────
app.use("/api/health",     healthRouter);
app.use("/api/agents",     agentsRouter);
app.use("/api/skills",     skillsRouter);
app.use("/api/workflows",  workflowsRouter);
app.use("/api/executions", executionsRouter);
app.use("/api/providers",  providersRouter);
app.use("/api/projects",   projectsRouter);
app.use("/api/workspace",  workspaceRouter);

// ── 404 ───────────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ error: "Not found", message: "Route not found", statusCode: 404 });
});

// ── Start ─────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`✓ Orchestrator API running on http://localhost:${PORT}`);
  console.log(`  Root: ${ROOT_DIR}`);
});

export default app;
