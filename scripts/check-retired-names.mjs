#!/usr/bin/env node
// No page may name a retired package, a package that does not exist, or a
// retired domain. The list is scripts/retired-names.json (see its $comment for
// where it comes from). Code blocks are checked too: a wrong install command is
// the worst place for a wrong name. Run: npm run check:retired
import fs from 'node:fs';
import path from 'node:path';
import { ROOT, listPages, lineOf, rel, report } from './lib.mjs';

const list = JSON.parse(fs.readFileSync(path.join(ROOT, 'scripts/retired-names.json'), 'utf8'));
const names = new Map();
for (const [name, to] of Object.entries(list.packages ?? {})) names.set(name, Array.isArray(to) ? to.join(', ') : String(to));
for (const [name, to] of Object.entries(list.extra ?? {})) names.set(name, String(to));

const escape = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
// A name matches only as a whole name: "@synap-core/sdk" must not match inside
// "@synap-core/sdk-realtime", but "@synap-core/client/foo" is still the retired package.
// A name that ends in "/" is a path prefix: "content/team/" matches "content/team/platform/x.mdx".
const patterns = [...names.keys()].map((name) => ({
  name,
  re: new RegExp(`(?<![A-Za-z0-9_.-])${escape(name)}${name.endsWith('/') ? '' : '(?![A-Za-z0-9_-])'}`, 'g'),
}));

const extraFiles = ['README.md', 'CLAUDE.md', 'AGENTS.md'].map((f) => path.join(ROOT, f)).filter((f) => fs.existsSync(f));
const problems = [];
for (const file of [...listPages(), ...extraFiles]) {
  const text = fs.readFileSync(file, 'utf8');
  for (const { name, re } of patterns) {
    re.lastIndex = 0;
    let m;
    while ((m = re.exec(text))) {
      problems.push(`${rel(file)}:${lineOf(text, m.index)}: "${name}" is retired or does not exist (use: ${names.get(name)})`);
    }
  }
}

process.exit(report('retired names', problems));
