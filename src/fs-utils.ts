import { access, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

export async function pathExists(target: string): Promise<boolean> {
  try {
    await access(target);
    return true;
  } catch {
    return false;
  }
}

export async function ensureDir(target: string): Promise<void> {
  await mkdir(target, { recursive: true });
}

export async function readJson<T>(target: string): Promise<T> {
  const content = await readFile(target, "utf8");
  return JSON.parse(content) as T;
}

export async function writeJson(target: string, data: unknown): Promise<void> {
  await ensureDir(path.dirname(target));
  await writeFile(target, JSON.stringify(data, null, 2) + "\n", "utf8");
}

export function normalizeRelativePath(value: string): string {
  return value.replaceAll("\\", "/").replace(/^\.?\//, "");
}

export function isSubPath(parent: string, child: string): boolean {
  const relative = path.relative(path.resolve(parent), path.resolve(child));
  return relative === "" || (!relative.startsWith("..") && !path.isAbsolute(relative));
}
