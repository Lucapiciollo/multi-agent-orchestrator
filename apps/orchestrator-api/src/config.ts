import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** Cartella radice del monorepo (multi-agent-orchestrator/) */
export const ROOT_DIR = path.resolve(__dirname, "..", "..", "..");
