#!/usr/bin/env node
// Internal link check, offline. For every page:
//  - a link to /docs/... must name an existing page, and its #anchor an existing heading;
//  - a #anchor on its own must name a heading of the same page;
//  - relative links (./x, ../x) are refused: they resolve against the URL, which
//    breaks on index pages and when a page moves. Use /docs/... instead.
// It also checks the navigation: every meta.json entry must exist, and every page
// must be listed in its folder's meta.json. External links are not fetched.
// Run: npm run check:links
import fs from 'node:fs';
import path from 'node:path';
import { DOCS_DIR, listPages, readPage, pageUrl, lineOf, stripCode, rel, report } from './lib.mjs';

/** github-slugger compatible enough for our headings. */
function slugify(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N}\s_-]/gu, '')
    .replace(/\s/g, '-');
}

function headingText(raw) {
  return raw
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1') // [text](url) -> text
    .replace(/[`*_]/g, '') // code and emphasis markers
    .replace(/\s+#*\s*$/, '')
    .trim();
}

const pages = listPages();
const byUrl = new Map();
for (const file of pages) {
  const { body } = readPage(file);
  const anchors = new Set();
  const seen = new Map();
  for (const line of stripCode(body).split('\n')) {
    const m = line.match(/^(#{1,6})\s+(.*)$/);
    if (!m) continue;
    let slug = slugify(headingText(m[2]));
    const n = seen.get(slug) ?? 0;
    seen.set(slug, n + 1);
    if (n > 0) slug = `${slug}-${n}`;
    anchors.add(slug);
  }
  byUrl.set(pageUrl(file), { file, anchors });
}

const problems = [];
const LINK_RE = /\[[^\]]*\]\(\s*<?([^)\s>]+)>?(?:\s+"[^"]*")?\s*\)|\bhref=["']([^"']+)["']/g;

for (const file of pages) {
  const { text, body, bodyOffset } = readPage(file);
  const scan = stripCode(body);
  const self = byUrl.get(pageUrl(file));
  LINK_RE.lastIndex = 0;
  let m;
  while ((m = LINK_RE.exec(scan))) {
    const target = m[1] ?? m[2];
    const where = `${rel(file)}:${lineOf(text, bodyOffset + m.index)}`;
    if (/^(https?:|mailto:|tel:)/i.test(target)) continue;
    if (target.startsWith('#')) {
      const anchor = decodeURIComponent(target.slice(1));
      if (!self.anchors.has(anchor)) problems.push(`${where}: no heading for anchor "${target}" on this page`);
      continue;
    }
    if (!target.startsWith('/')) {
      problems.push(`${where}: relative link "${target}": use an absolute /docs/... path`);
      continue;
    }
    const [pathPart, anchor] = target.split('#');
    const url = pathPart.replace(/\/$/, '') || '/';
    if (url === '/') continue;
    if (!url.startsWith('/docs')) {
      problems.push(`${where}: "${target}" is not a docs page`);
      continue;
    }
    const dest = byUrl.get(url);
    if (!dest) {
      problems.push(`${where}: "${target}" does not exist`);
      continue;
    }
    if (anchor && !dest.anchors.has(decodeURIComponent(anchor)))
      problems.push(`${where}: "${target}": ${rel(dest.file)} has no heading for #${anchor}`);
  }
}

// Navigation: meta.json entries exist, and no page is left out of its folder's meta.json.
function checkMeta(dir) {
  const metaFile = path.join(dir, 'meta.json');
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const children = new Set(
    entries
      .filter((e) => e.isDirectory() || /\.mdx?$/.test(e.name))
      .map((e) => (e.isDirectory() ? e.name : e.name.replace(/\.mdx?$/, ''))),
  );
  if (!fs.existsSync(metaFile)) {
    problems.push(`${rel(dir)}: no meta.json (the folder's pages have no navigation order)`);
  } else {
    const meta = JSON.parse(fs.readFileSync(metaFile, 'utf8'));
    const listed = new Set();
    for (const item of meta.pages ?? []) {
      if (/^---.*---$/.test(item) || item === '...' || /^\[.*\]\(.*\)$/.test(item)) continue;
      const name = item.replace(/^\.\.\./, '');
      listed.add(name);
      if (!children.has(name)) problems.push(`${rel(metaFile)}: "${item}" is not a page or folder here`);
    }
    if (!(meta.pages ?? []).includes('...')) {
      for (const child of children) {
        if (!listed.has(child)) problems.push(`${rel(metaFile)}: "${child}" exists but is not listed in "pages"`);
      }
    }
  }
  for (const e of entries) if (e.isDirectory()) checkMeta(path.join(dir, e.name));
}
checkMeta(DOCS_DIR);

process.exit(report('internal links and navigation', problems));
