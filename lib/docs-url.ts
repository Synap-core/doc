/**
 * Turn whatever an agent passes as a page reference into the page's URL path, so the docs
 * MCP server's `get_page` finds it: a path (`/docs/run/backups`), the Markdown URL
 * (`/docs/run/backups.md`), a full URL (`https://docs.synap.live/docs/run/backups#restore`),
 * a URL without its scheme, or a path without the `/docs` prefix (`run/backups`).
 *
 * No imports, so `node --test` can load it directly (scripts/docs-url.test.mjs).
 */
export function normalizeDocsUrl(input: string, base = '/docs'): string {
  let path = input.trim();

  if (/^[a-z][a-z0-9+.-]*:\/\//i.test(path)) {
    try {
      path = new URL(path).pathname;
    } catch {
      // Not a parseable URL: treat it as a path below.
    }
  } else if (/^[a-z0-9-]+(\.[a-z0-9-]+)+(:\d+)?\//i.test(path)) {
    // A host without a scheme, such as docs.synap.live/docs/run/backups.
    path = path.slice(path.indexOf('/'));
  }

  path = path.replace(/[?#].*$/, '');
  try {
    path = decodeURIComponent(path);
  } catch {
    // Keep a malformed escape as it is; it simply matches no page.
  }

  path = `/${path}`.replace(/\/{2,}/g, '/');
  path = path.replace(/\.mdx?$/i, '').replace(/\/+$/, '');
  if (path === '') return base;
  if (path !== base && !path.startsWith(`${base}/`)) path = `${base}${path}`;
  return path;
}
