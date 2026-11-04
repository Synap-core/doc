/**
 * Re-rank the search engine's results so a reader finds the page they mean.
 *
 * The engine returns pages in order of their best text match, each followed by up to 8 matching
 * passages. On its own it lets the generated reference (the CLI, MCP tools and Hub REST API pages,
 * which mention almost every word) outrank the guide whose title is the query, and it shows long
 * passages. This keeps the engine's order as the base, then:
 *  - lifts a page whose title matches the query (all of it, or every word of it);
 *  - lowers the generated reference pages, so a guide comes first and the reference still appears;
 *  - keeps at most MAX_PASSAGES passages per page, each cut to MAX_PASSAGE_CHARS.
 *
 * No imports, so `node --test` can load it directly (scripts/search-rank.test.mjs).
 */

export interface SearchResult {
  id: string;
  type: 'page' | 'heading' | 'text';
  content: string;
  url: string;
  breadcrumbs?: string[];
  [key: string]: unknown;
}

export const MAX_PASSAGES = 2;
export const MAX_PASSAGE_CHARS = 160;
export const MAX_PAGES = 12;

/** Generated reference pages: useful to look up, but never the first answer to a plain question. */
const REFERENCE_PREFIXES = ['/docs/reference/cli', '/docs/reference/mcp-tools', '/docs/reference/events', '/docs/reference/hub-api'];

function words(text: string): string[] {
  return text
    .toLowerCase()
    .split(/[^\p{L}\p{N}]+/u)
    .filter((w) => w.length > 1);
}

/**
 * How far a generated reference page drops. A Hub REST API tag page ("Import", "Keys") drops furthest: its
 * one-word title often equals a plain question, while the guide of the same name is the answer.
 */
function referencePenalty(url: string): number {
  const path = url.split('#')[0];
  if (path.startsWith('/docs/reference/hub-api/')) return 150;
  return REFERENCE_PREFIXES.some((prefix) => path === prefix || path.startsWith(`${prefix}/`)) ? 50 : 0;
}

/** How well a page title answers the query: 3 exact, 2 every word, else the share of query words it has. */
export function titleScore(title: string, query: string): number {
  const t = title.trim().toLowerCase();
  const q = query.trim().toLowerCase();
  if (!q) return 0;
  if (t === q) return 3;
  const qWords = words(q);
  const tWords = new Set(words(t).map(stem));
  if (qWords.length === 0) return 0;
  const hits = qWords.filter((w) => tWords.has(stem(w))).length;
  if (hits === qWords.length) return 2;
  return hits / qWords.length;
}

/** Plural and simple verb endings, so "templates" finds "Spaces and templates" and "import" finds "Importing". */
function stem(word: string): string {
  return word.replace(/ing$/u, '').replace(/([^s])s$/u, '$1');
}

function cut(text: string): string {
  const flat = text.replace(/\s+/g, ' ').trim();
  if (flat.length <= MAX_PASSAGE_CHARS) return flat;
  const slice = flat.slice(0, MAX_PASSAGE_CHARS);
  const lastSpace = slice.lastIndexOf(' ');
  return `${slice.slice(0, lastSpace > 80 ? lastSpace : MAX_PASSAGE_CHARS)}…`;
}

export function rankResults(results: SearchResult[], query: string): SearchResult[] {
  const groups: { page: SearchResult; passages: SearchResult[]; order: number }[] = [];
  for (const item of results) {
    if (item.type === 'page') {
      groups.push({ page: item, passages: [], order: groups.length });
    } else if (groups.length > 0) {
      groups[groups.length - 1].passages.push(item);
    }
  }

  const score = (g: (typeof groups)[number]) =>
    Math.round(titleScore(g.page.content, query) * 100) - referencePenalty(g.page.url) - g.order;

  return groups
    .sort((a, b) => score(b) - score(a))
    .slice(0, MAX_PAGES)
    .flatMap((g) => [
      g.page,
      ...g.passages
        // A passage that only repeats the page title adds nothing.
        .filter((p) => p.content.trim().toLowerCase() !== g.page.content.trim().toLowerCase())
        // A table indexed as raw Markdown ("| a | b | | --- |") reads as noise in a result list.
        .filter((p) => !/\|\s*-{3,}/.test(p.content))
        .slice(0, MAX_PASSAGES)
        .map((p) => ({ ...p, content: cut(p.content) })),
    ]);
}
