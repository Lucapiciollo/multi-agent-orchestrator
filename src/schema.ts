import { z } from "zod";

const providerTypeSchema = z.enum(["mock", "copilot", "ollama"]);

const providerConfigSchema = z.object({
  type: providerTypeSchema,
  model: z.string().optional(),
  fallbackProvider: providerTypeSchema.optional(),
  fallbackModel: z.string().optional(),
  timeoutMs: z.number().int().positive().optional()
});

export const taskSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
  agentId: z.string().min(1),
  skillIds: z.array(z.string()).default([]),
  dependencies: z.array(z.string()).default([]),
  inputPaths: z.array(z.string()).default([]),
  outputPaths: z.array(z.string()).default([]),
  forbiddenPaths: z.array(z.string()).optional(),
  validationCriteria: z.array(z.string()).default([]),
  commands: z.array(z.string()).optional(),
  status: z.enum(["pending", "running", "completed", "failed", "blocked", "skipped"]).default("pending"),
  attempts: z.number().int().nonnegative().default(0),
  maxAttempts: z.number().int().positive().optional(),
  continueOnError: z.boolean().optional(),
  metadata: z.record(z.unknown()).optional()
});

export const executionPlanSchema = z.object({
  id: z.string().min(1),
  objective: z.string().min(1),
  projectRoot: z.string().min(1),
  contextFiles: z.array(z.string()).default([]),
  createGitCheckpoints: z.boolean().default(false),
  tasks: z.array(taskSchema).min(1)
});

export const agentDefinitionSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  description: z.string().min(1),
  skills: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
  capabilities: z.array(z.string()).default([]),
  allowedPaths: z.array(z.string()).default(["**/*"]),
  forbiddenPaths: z.array(z.string()).default([]),
  priority: z.number().default(0),
  provider: providerConfigSchema.optional()
});

export const skillDefinitionSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  description: z.string().min(1),
  file: z.string().min(1)
});
