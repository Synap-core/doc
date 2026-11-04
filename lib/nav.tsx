import type { LinkItemType } from 'fumadocs-ui/layouts/shared';
import type * as PageTree from 'fumadocs-core/page-tree';
import { Library } from 'lucide-react';

/**
 * The navigation outside the section switcher (founder decision 2026-11-04):
 *  - the switcher lists the reading sections only;
 *  - Reference is a top-level link, in the nav and at the top of the sidebar;
 *  - Community is a footer (the sidebar's and the home page's).
 * Both stay root folders in content/docs/meta.json, so their pages keep their URLs and, once you are inside one, the
 * sidebar shows that section's own pages (app/docs/layout.tsx marks them `unlisted` instead of removing them).
 */
export const OFF_SWITCHER_SECTIONS = ['reference', 'community'] as const;

export const REFERENCE_URL = '/docs/reference';
export const COMMUNITY_URL = '/docs/community';

/** Reference, as a link: the same coloured icon as in the switcher (app/globals.css, `[data-section]`). */
export const referenceLink: LinkItemType = {
  text: 'Reference',
  url: REFERENCE_URL,
  active: 'nested-url',
  icon: (
    <span className="section-icon size-5 shrink-0" data-section="reference" aria-hidden>
      <Library />
    </span>
  ),
};

export interface NavPage {
  title: string;
  url: string;
}

/**
 * The Community section's pages, in its meta.json order (index first), read from the page tree so a page added to
 * the section shows in the footer without a second list to keep in sync.
 *
 * Community is a root folder, and fumadocs-core 16 gives a root folder no `index`: its index page is one of its
 * children (`meta.root` leaves the index name unset, fumadocs-core dist/dynamic-*.js). So the section is found by the
 * page it holds, and a non-root shape (`folder.index`) is read too.
 */
export function communityPages(tree: PageTree.Root): NavPage[] {
  const holds = (folder: PageTree.Folder) =>
    folder.index?.url === COMMUNITY_URL ||
    folder.children.some((node) => node.type === 'page' && node.url === COMMUNITY_URL);
  const folder = tree.children.find((node): node is PageTree.Folder => node.type === 'folder' && holds(node));
  if (!folder) throw new Error(`No section holding the page ${COMMUNITY_URL} in the page tree`);
  const pages: NavPage[] = [];
  const add = (item: PageTree.Item) => {
    if (!pages.some((p) => p.url === item.url)) pages.push({ title: String(item.name), url: item.url });
  };
  if (folder.index) add(folder.index);
  for (const node of folder.children) if (node.type === 'page') add(node);
  return pages;
}
