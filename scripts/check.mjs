#!/usr/bin/env node
// Runs every offline docs check and fails if any fails. Run: npm run check
// (check:markdown needs a build, reference:check needs the network: CI runs them separately.)
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const checks = ['check-frontmatter.mjs', 'check-links.mjs', 'check-retired-names.mjs', ['generate-reference.mjs', '--check']];
let failed = 0;
for (const script of checks) {
  const [file, ...args] = [script].flat();
  const r = spawnSync(process.execPath, [path.join(here, file), ...args], { stdio: 'inherit' });
  if (r.status !== 0) failed++;
}
process.exit(failed ? 1 : 0);
