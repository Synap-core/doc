// Unit test for lib/search-rank.ts (the order of the site search and the docs MCP server's search tool).
// Run: node --test scripts/search-rank.test.mjs (npm test runs it).
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { MAX_PASSAGE_CHARS, MAX_PASSAGES, rankResults, titleScore } from '../lib/search-rank.ts';

const page = (title, url) => ({ id: url, type: 'page', content: title, url });
const text = (content, url) => ({ id: `${url}-${content.length}`, type: 'text', content, url });

test('a page whose title is the query comes first, ahead of the generated reference', () => {
  const engine = [
    page('CLI', '/docs/reference/cli'),
    text('synap market install', '/docs/reference/cli'),
    page('Capabilities', '/docs/customize/capabilities'),
    text('Capabilities come from the marketplace.', '/docs/customize/capabilities'),
    page('Marketplace', '/docs/customize/marketplace'),
    text('Browse it on the web.', '/docs/customize/marketplace'),
  ];
  const ranked = rankResults(engine, 'marketplace').filter((r) => r.type === 'page').map((r) => r.content);
  assert.deepEqual(ranked, ['Marketplace', 'Capabilities', 'CLI']);
});

test('the generated reference goes after guides when no title matches', () => {
  const engine = [page('MCP tools', '/docs/reference/mcp-tools'), page('Connect an agent', '/docs/agents')];
  const ranked = rankResults(engine, 'claude').map((r) => r.url);
  assert.deepEqual(ranked, ['/docs/agents', '/docs/reference/mcp-tools']);
});

test('a reference page still wins when its title is the query', () => {
  const engine = [page('Spaces and templates', '/docs/customize/spaces-and-templates'), page('CLI', '/docs/reference/cli')];
  assert.equal(rankResults(engine, 'cli')[0].url, '/docs/reference/cli');
});

test('a guide whose title has every word beats a Hub API tag page with the exact title', () => {
  const engine = [page('Import', '/docs/reference/hub-api/import'), page('Import your data', '/docs/customize/import')];
  assert.deepEqual(rankResults(engine, 'import').map((r) => r.url), ['/docs/customize/import', '/docs/reference/hub-api/import']);
});

test('passages are capped per page and cut short', () => {
  const long = 'word '.repeat(100);
  const engine = [page('Import your data', '/docs/customize/import'), ...[1, 2, 3, 4].map((n) => text(`${n} ${long}`, '/docs/customize/import'))];
  const out = rankResults(engine, 'import');
  const passages = out.filter((r) => r.type !== 'page');
  assert.equal(passages.length, MAX_PASSAGES);
  for (const p of passages) assert.ok(p.content.length <= MAX_PASSAGE_CHARS + 1, `${p.content.length} chars`);
});

test('a passage that is raw table Markdown is dropped', () => {
  const engine = [
    page('Choose your path', '/docs/start/choose-your-path'),
    text('| If you want to… | Start at | | --- | --- | | Bring in data | Import |', '/docs/start/choose-your-path'),
    text('Bring your data in. Import what you already have.', '/docs/start/choose-your-path'),
  ];
  const passages = rankResults(engine, 'import').filter((r) => r.type !== 'page').map((r) => r.content);
  assert.deepEqual(passages, ['Bring your data in. Import what you already have.']);
});

test('title score: exact, every word, plurals, none', () => {
  assert.equal(titleScore('Marketplace', 'marketplace'), 3);
  assert.equal(titleScore('Spaces and templates', 'templates'), 2);
  assert.equal(titleScore('Spaces and templates', 'template'), 2);
  assert.equal(titleScore('Write mode and Undo', 'write mode'), 2);
  assert.equal(titleScore('Import your data', 'import csv'), 0.5);
  assert.equal(titleScore('Webhooks', 'pricing'), 0);
});
