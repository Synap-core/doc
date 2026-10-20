// Shared helpers for the docs checks (scripts/check-*.mjs). No dependencies
// beyond js-yaml, so the checks run with `node` alone after `npm ci`.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import yaml from 'js-yaml';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const DOCS_DIR = path.join(ROOT, process.env.DOCS_DIR ?? 'content/docs');

/** Every .md/.mdx page under content/docs, as absolute paths, sorted. */
export function listPages(dir = DOCS_DIR) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...listPages(full));
    else if (/\.mdx?$/.test(entry.name)) out.push(full);
  }
  return out.sort();
}

/** Split a page into its frontmatter (parsed) and body. */
export function readPage(file) {
  const text = fs.readFileSync(file, 'utf8');
  const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!match) return { text, frontmatter: null, body: text, bodyOffset: 0, error: 'no frontmatter block' };
  let frontmatter;
  try {
    // JSON_SCHEMA keeps dates as strings (2026-10-20 stays "2026-10-20").
    frontmatter = yaml.load(match[1], { schema: yaml.JSON_SCHEMA }) ?? {};
  } catch (err) {
    return { text, frontmatter: null, body: text, bodyOffset: 0, error: `invalid YAML: ${err.message}` };
  }
  return { text, frontmatter, body: text.slice(match[0].length), bodyOffset: match[0].length };
}

/** The URL path (/docs/...) a page is served at. */
export function pageUrl(file) {
  let rel = path.relative(DOCS_DIR, file).replace(/\\/g, '/').replace(/\.mdx?$/, '');
  if (rel === 'index') rel = '';
  else if (rel.endsWith('/index')) rel = rel.slice(0, -'/index'.length);
  return rel ? `/docs/${rel}` : '/docs';
}

export function lineOf(text, offset) {
  return text.slice(0, offset).split('\n').length;
}

/** The body with fenced code blocks and inline code blanked out (same length, so offsets stay valid). */
export function stripCode(body) {
  return body
    .replace(/^(```|~~~)[\s\S]*?^\1/gm, (m) => m.replace(/[^\n]/g, ' '))
    .replace(/`[^`\n]*`/g, (m) => ' '.repeat(m.length));
}

export function rel(file) {
  return path.relative(ROOT, file);
}

export function report(name, problems) {
  if (problems.length === 0) {
    console.log(`✓ ${name}`);
    return 0;
  }
  console.error(`✗ ${name}: ${problems.length} problem(s)`);
  for (const p of problems) console.error(`  ${p}`);
  return 1;
}
