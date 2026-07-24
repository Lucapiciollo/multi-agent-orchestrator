import path from "node:path";
import type { ExecutionPlan } from "./models.js";
import { executionPlanSchema } from "./schema.js";
import { readJson } from "./fs-utils.js";

export async function loadWorkflow(
  rootDir: string,
  file: string
): Promise<ExecutionPlan> {
  const raw = await readJson<unknown>(path.resolve(rootDir, file));
  return executionPlanSchema.parse(raw);
}
