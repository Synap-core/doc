#!/usr/bin/env node
// Runs every docs check and fails if any fails. Run: npm run check
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const checks = ['check-frontmatter.mjs', 'check-links.mjs', 'check-retired-names.mjs'];
let failed = 0;
for (const script of checks) {
  const r = spawnSync(process.execPath, [path.join(here, script)], { stdio: 'inherit' });
  if (r.status !== 0) failed++;
}
process.exit(failed ? 1 : 0);
