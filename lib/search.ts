import { createFromSource } from 'fumadocs-core/search/server';
import { docsSource } from './source';

/** One search index, shared by /api/search (the site's search dialog) and the docs MCP server. */
export const searchServer = createFromSource(docsSource);
