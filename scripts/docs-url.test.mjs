// Unit test for lib/docs-url.ts (what the docs MCP server's get_page accepts).
// Run: node --test scripts/docs-url.test.mjs (npm run check runs it).
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { normalizeDocsUrl } from '../lib/docs-url.ts';

const cases = [
  ['/docs/run/backups', '/docs/run/backups'],
  ['/docs/run/backups/', '/docs/run/backups'],
  ['/docs/run/backups.md', '/docs/run/backups'],
  ['/docs/run/backups.mdx', '/docs/run/backups'],
  ['https://docs.synap.live/docs/run/backups', '/docs/run/backups'],
  ['https://docs.synap.live/docs/run/backups.md', '/docs/run/backups'],
  ['https://docs.synap.live/docs/run/backups?x=1#restore', '/docs/run/backups'],
  ['http://localhost:3000/docs/build/sdk.md', '/docs/build/sdk'],
  ['docs.synap.live/docs/build/sdk', '/docs/build/sdk'],
  ['docs/build/sdk', '/docs/build/sdk'],
  ['run/backups', '/docs/run/backups'],
  ['  /docs/start  ', '/docs/start'],
  ['/docs', '/docs'],
  ['/docs.md', '/docs'],
  ['https://docs.synap.live/docs.md', '/docs'],
  ['', '/docs'],
  ['/docs/reference/hub-api/entities', '/docs/reference/hub-api/entities'],
];

for (const [input, expected] of cases) {
  test(`normalizeDocsUrl(${JSON.stringify(input)})`, () => {
    assert.equal(normalizeDocsUrl(input), expected);
  });
}
