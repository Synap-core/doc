#!/usr/bin/env node
// Runs every offline docs check (and the unit tests) and fails if any fails. Run: npm run check
// (check:markdown needs a build, reference:check needs the network: CI runs them separately.)
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const checks = [
  [path.join(here, 'check-frontmatter.mjs')],
  [path.join(here, 'check-links.mjs')],
  [path.join(here, 'check-retired-names.mjs')],
  [path.join(here, 'generate-reference.mjs'), '--check'],
  ['--test', '--test-reporter=dot', path.join(here, 'docs-url.test.mjs')],
];
let failed = 0;
for (const args of checks) {
  const r = spawnSync(process.execPath, args, { stdio: 'inherit' });
  if (r.status !== 0) failed++;
}
process.exit(failed ? 1 : 0);
