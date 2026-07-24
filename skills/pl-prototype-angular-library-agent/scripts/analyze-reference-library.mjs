#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const refPath = process.argv[2];
if (!refPath) {
  console.error('Usage: node analyze-reference-library.mjs <projects/holidays>');
  process.exit(1);
}

const root = path.resolve(refPath);
function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });
}

const files = walk(root).map((f) => path.relative(root, f).replaceAll('\\', '/'));
const summary = {
  root,
  hasPublicApi: files.includes('src/public-api.ts'),
  modules: files.filter((f) => f.endsWith('.module.ts')),
  routingModules: files.filter((f) => f.includes('routing') || f.endsWith('-routing.module.ts')),
  storeFiles: files.filter((f) => f.includes('/store/') || f.startsWith('src/lib/store/')),
  componentFiles: files.filter((f) => f.endsWith('.component.ts')),
  scssFiles: files.filter((f) => f.endsWith('.scss'))
};

console.log(JSON.stringify(summary, null, 2));
