import { createMcpHandler, McpServer } from '@modelcontextprotocol/server';
import { registerSearchTool, registerSourceTools } from 'fumadocs-core/mcp';
import { docsLlms, docsSource } from '@/lib/source';
import { searchServer } from '@/lib/search';
import { normalizeDocsUrl } from '@/lib/docs-url';

/**
 * The page source as `get_page` sees it: the same loader, except that a page is looked up by
 * whatever the agent passes (a path, the `.md` URL or a full URL), normalized to its path.
 */
const lenientSource: typeof docsSource = Object.create(docsSource, {
  getPageByUrl: {
    value: (url: string, language?: string) => docsSource.getPageByUrl(normalizeDocsUrl(url), language),
  },
});

/**
 * The docs MCP server (Streamable HTTP), for coding agents that read these docs:
 * `list_pages` (the page index), `get_page` (one page as Markdown, by path, `.md` URL or full URL)
 * and `search`. It serves only this public documentation; it is not a pod's MCP endpoint.
 */
const handler = createMcpHandler(() => {
  const mcp = new McpServer({ name: 'synap-docs', version: '1.0.0' });
  registerSourceTools(mcp, lenientSource, docsLlms);
  registerSearchTool(mcp, searchServer);
  return mcp;
});

export const GET = (request: Request) => handler.fetch(request);
export const POST = (request: Request) => handler.fetch(request);
export const DELETE = (request: Request) => handler.fetch(request);
