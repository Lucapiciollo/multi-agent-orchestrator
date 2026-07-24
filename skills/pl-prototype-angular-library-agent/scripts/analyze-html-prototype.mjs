#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const input = process.argv[2];
if (!input) {
  console.error('Usage: node analyze-html-prototype.mjs <prototype.html>');
  process.exit(1);
}

const html = fs.readFileSync(input, 'utf8');
const patterns = [
  ['toolbar', /toolbar|header|topbar|actions/i],
  ['filters', /filter|search|query/i],
  ['form', /<form|input|select|textarea|mat-form-field/i],
  ['table', /<table|mat-table|grid/i],
  ['cards', /card|summary|kpi/i],
  ['dialog', /dialog|modal/i],
  ['sidebar', /sidebar|aside|drawer/i]
];

const found = patterns
  .filter(([, regex]) => regex.test(html))
  .map(([name]) => name);

console.log(JSON.stringify({
  file: path.resolve(input),
  detectedBlocks: found,
  recommendedNextStep: 'Create Component split proposal before generating files.'
}, null, 2));
