import { docsLlms, docsSource } from '@/lib/source';
import { getPublicMarkdownUrl, siteUrl } from '@/lib/shared';

export const revalidate = false;

/**
 * Every hand-written page of the docs as Markdown, in navigation order. The generated reference
 * (CLI, MCP tools, events, Hub REST API: pages with `generated_from`) is linked, not inlined: it is
 * most of the site by size and an agent should fetch the one reference page it needs.
 */
export async function GET() {
  const pages = docsSource.getPages();
  const written = pages.filter((page) => !page.data.generated_from);
  const generated = pages.filter((page) => page.data.generated_from);

  const rendered = await Promise.all(written.map((page) => docsLlms.page(page)));
  const reference = [
    '# Generated reference',
    '',
    'These pages are generated from the source repositories and are not included above. Fetch the one you need as',
    'Markdown:',
    '',
    ...generated.map((page) => `- [${page.data.title}](${siteUrl}${getPublicMarkdownUrl(page)})`),
  ].join('\n');

  return new Response([...rendered, reference].join('\n\n') + '\n', {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
