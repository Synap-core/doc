import { createGetUrl } from 'fumadocs-core/source';

export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://docs.synap.live').replace(/\/$/, '');
export const docsRoute = '/docs';
/** Internal route that serves a page's Markdown; proxy.ts maps `/docs/<page>.md` onto it. */
export const docsContentRoute = '/llms.mdx/docs';

export const gitConfig = {
  user: 'Synap-core',
  repo: 'doc',
  branch: 'main',
};

const getContentUrl = createGetUrl(docsContentRoute);

/** The internal Markdown route of a page (what proxy.ts rewrites to). */
export function getPageMarkdownUrl(page: { slugs: string[]; locale?: string }) {
  const segments = [...page.slugs, 'content.md'];
  return { segments, url: getContentUrl(segments, page.locale) };
}

/** The public Markdown URL of a page: its URL plus `.md` (`/docs.md` for the root). */
export function getPublicMarkdownUrl(page: { url: string }) {
  return `${page.url}.md`;
}
