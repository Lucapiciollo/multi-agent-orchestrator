#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const featurePath = process.argv[2];
if (!featurePath) {
  console.error('Usage: node validate-generated-library.mjs <projects/feature>');
  process.exit(1);
}

const root = path.resolve(featurePath);
const errors = [];

function exists(p) {
  return fs.existsSync(path.join(root, p));
}

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });
}

if (!exists('src/lib')) errors.push('Missing src/lib');
if (!exists('src/public-api.ts')) errors.push('Missing src/public-api.ts');

const componentsDir = path.join(root, 'src/lib/components');
if (fs.existsSync(componentsDir)) {
  for (const entry of fs.readdirSync(componentsDir, { withFileTypes: true })) {
    if (entry.isFile() && entry.name.includes('.component.')) {
      errors.push(`Flat component file under components/: ${entry.name}`);
    }
  }
}

const files = walk(root);
for (const file of files) {
  if (file.endsWith('.component.scss')) {
    const content = fs.readFileSync(file, 'utf8');
    if (!content.includes('.responsive')) errors.push(`Missing responsive import: ${file}`);
    if (!content.includes('.theme')) errors.push(`Missing theme import: ${file}`);
  }
}

console.log(JSON.stringify({
  root,
  valid: errors.length === 0,
  errors
}, null, 2));

process.exit(errors.length ? 2 : 0);
