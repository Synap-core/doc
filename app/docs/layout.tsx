import { DocsLayout } from 'fumadocs-ui/layouts/docs';
import type { LayoutTab } from 'fumadocs-ui/layouts/shared';
import { docsSource } from '@/lib/source';
import { baseOptions } from '@/lib/layout.shared';
import type { ReactNode } from 'react';

/**
 * The section switcher shows each section's title and a coloured icon, nothing else: a reader scans
 * nine short names, and the colour tells sections apart at a glance. The hue per section is in
 * app/globals.css (`.section-icon[data-section=…]`); a section without one gets the neutral tile.
 */
function sectionTab(option: LayoutTab): LayoutTab {
  const section = option.url.split('/')[2] ?? '';
  return {
    ...option,
    description: undefined,
    icon: (
      <span className="section-icon" data-section={section} aria-hidden>
        {option.icon}
      </span>
    ),
  };
}

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <DocsLayout
      {...baseOptions()}
      tree={docsSource.getPageTree()}
      tabs={{ transform: sectionTab }}
      sidebar={{
        collapsible: true,
        defaultOpenLevel: 0,
      }}
    >
      {children}
    </DocsLayout>
  );
}
