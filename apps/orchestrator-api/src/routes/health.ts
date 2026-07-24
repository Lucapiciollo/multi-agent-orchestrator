import { Router } from "express";

export const healthRouter = Router();

healthRouter.get("/", (_req, res) => {
  res.json({
    data: {
      status: "ok",
      version: "2.0.0",
      timestamp: new Date().toISOString(),
      services: {
        orchestratorCore: "available",
        api: "healthy"
      }
    }
  });
});
