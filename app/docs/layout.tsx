import { DocsLayout } from 'fumadocs-ui/layouts/docs';
import type { LayoutTab } from 'fumadocs-ui/layouts/shared';
import { docsSource } from '@/lib/source';
import { baseOptions } from '@/lib/layout.shared';
import { OFF_SWITCHER_SECTIONS, communityPages } from '@/lib/nav';
import { CommunityFooter } from '@/components/CommunityFooter';
import type { ReactNode } from 'react';

/**
 * The section switcher shows each reading section's title and a coloured icon, nothing else: a reader scans short
 * names, and the colour tells sections apart at a glance. The hue per section is in app/globals.css
 * (`.section-icon[data-section=…]`); a section without one gets the neutral tile.
 *
 * Reference and Community are not listed in it (lib/nav.tsx): Reference is a top-level link and Community a footer.
 * They are marked `unlisted` rather than dropped, so inside one of them the switcher still names the section you are
 * in and the sidebar shows its own pages.
 */
function sectionTab(option: LayoutTab): LayoutTab {
  const section = option.url.split('/')[2] ?? '';
  return {
    ...option,
    description: undefined,
    unlisted: (OFF_SWITCHER_SECTIONS as readonly string[]).includes(section) || option.unlisted,
    icon: (
      <span className="section-icon" data-section={section} aria-hidden>
        {option.icon}
      </span>
    ),
  };
}

export default function Layout({ children }: { children: ReactNode }) {
  const tree = docsSource.getPageTree();
  return (
    <DocsLayout
      {...baseOptions()}
      tree={tree}
      tabs={{ transform: sectionTab }}
      sidebar={{
        collapsible: true,
        defaultOpenLevel: 0,
        footer: <CommunityFooter pages={communityPages(tree)} className="mt-3 border-t border-fd-border pt-3" />,
      }}
    >
      {children}
    </DocsLayout>
  );
}
