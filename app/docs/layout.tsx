import { DocsLayout } from 'fumadocs-ui/layouts/docs';
import { docsSource } from '@/lib/source';
import { baseOptions } from '@/lib/layout.shared';
import type { ReactNode } from 'react';

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <DocsLayout
      {...baseOptions({ docsLabel: true })}
      tree={docsSource.getPageTree()}
      sidebar={{
        collapsible: true,
        defaultOpenLevel: 0,
      }}
    >
      {children}
    </DocsLayout>
  );
}
