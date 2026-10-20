import { docs } from 'collections/server';
import { llms, loader } from 'fumadocs-core/source';
import { lucideIconsPlugin } from 'fumadocs-core/source/plugins/lucide-icons';
import { docsRoute } from './shared';
import { renderPageMarkdown } from './markdown';

export const docsSource = loader({
  baseUrl: docsRoute,
  source: docs.toFumadocsSource(),
  // `icon` in meta.json / frontmatter names a lucide-react icon (e.g. "Rocket").
  plugins: [lucideIconsPlugin()],
});

/** Search index source. */
export const source = docsSource;

export type DocsPage = ReturnType<typeof docsSource.getPages>[number];

/**
 * The Markdown form of the docs, built from the same compiled pages as the HTML:
 * `/docs/<page>.md`, `/llms-full.txt` and the docs MCP server all use `page()`/`full()`.
 * `/llms.txt` is curated by hand in app/llms.txt/route.ts.
 */
export const docsLlms = llms(docsSource, {
  renderPage: (page) => renderPageMarkdown(page as DocsPage),
});
