// Each section's index page is its landing page: it must link every page of the section, as a Card, in the order
// the section's meta.json lists them. This keeps the landing pages from drifting when a page is added or moved.
// Run: node --test scripts/section-index.test.mjs (npm test and npm run check run it).
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { test } from 'node:test';
import { DOCS_DIR, readPage } from './lib.mjs';

const root = JSON.parse(fs.readFileSync(path.join(DOCS_DIR, 'meta.json'), 'utf8'));

for (const section of root.pages) {
  test(`${section}/index.mdx links its pages in navigation order`, () => {
    const meta = JSON.parse(fs.readFileSync(path.join(DOCS_DIR, section, 'meta.json'), 'utf8'));
    const expected = meta.pages
      .filter((item) => item !== 'index' && !/^---.*---$/.test(item))
      .map((item) => `/docs/${section}/${item}`);
    const { body } = readPage(path.join(DOCS_DIR, section, 'index.mdx'));
    const cardHrefs = [...body.matchAll(/<Card\b[^>]*?\bhref="([^"]+)"/g)].map((m) => m[1]);
    const inSection = cardHrefs.filter((href) => expected.includes(href));
    const firstSeen = [...new Set(inSection)];
    assert.deepEqual(firstSeen, expected, `${section}/index.mdx: Cards must link ${expected.join(', ')} in this order`);
  });
}
