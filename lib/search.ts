import { createFromSource } from 'fumadocs-core/search/server';
import { docsSource } from './source';
import { rankResults, type SearchResult } from './search-rank';

const engine = createFromSource(docsSource);

/** Enough raw results for the re-ranking to find the page whose title is the query. */
const ENGINE_LIMIT = 200;

/**
 * One search, shared by /api/search (the site's search dialog) and the docs MCP server: the engine's results,
 * re-ranked by lib/search-rank.ts (title matches first, generated reference after the guides, short passages).
 */
export const searchServer = {
  export: engine.export,
  staticGET: engine.staticGET,
  async search(query: string, options?: Parameters<typeof engine.search>[1]) {
    if (query.trim().length === 0) return [];
    const results = await engine.search(query, { ...options, limit: ENGINE_LIMIT });
    return rankResults(results as SearchResult[], query) as typeof results;
  },
};

/** GET /api/search?query=…: the shape the Fumadocs search dialog reads. */
export async function searchGET(request: Request): Promise<Response> {
  return Response.json(await searchServer.search(new URL(request.url).searchParams.get('query') ?? ''));
}
