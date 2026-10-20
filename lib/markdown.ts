import type { DocsPage } from './source';
import { siteUrl } from './shared';
import { hubApiTagMarkdown } from './openapi-markdown';

/**
 * The Markdown form of one page, from the same compiled MDX as its HTML
 * (fumadocs-mdx `includeProcessedMarkdown`). Used by `/docs/<page>.md`,
 * `/llms-full.txt` and the docs MCP server, and checked by scripts/check-markdown.mjs.
 */
export async function renderPageMarkdown(page: DocsPage): Promise<string> {
  const data = page.data;
  const lines: string[] = [`# ${data.title}`, ''];
  if (data.description) lines.push(`> ${data.description}`, '');

  const facts = [`URL: ${siteUrl}${page.url}`];
  if (data.generated_from) facts.push(`Generated from ${data.generated_from}`);
  if (data.status !== 'current') facts.push(`Status: ${data.status}`);
  if (data.last_reviewed) facts.push(`Last reviewed against the code: ${data.last_reviewed}`);
  lines.push(facts.join(' · '), '');

  // Generated Hub REST API pages are a single <OpenAPIPage /> with no Markdown body: render their operations.
  const body = data._openapi ? hubApiTagMarkdown(data.title) : await data.getText('processed');
  lines.push(body.trim(), '');
  return lines.join('\n');
}
