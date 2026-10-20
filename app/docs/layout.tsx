import { DocsLayout } from 'fumadocs-ui/layouts/docs';
import { docsSource } from '@/lib/source';
import { SynapLogoMark } from '@/components/SynapLogoMark';
import type { ReactNode } from 'react';

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <DocsLayout
      tree={docsSource.getPageTree()}
      nav={{
        title: (
          <span className="flex items-center gap-2">
            <SynapLogoMark className="size-5 shrink-0" />
            <span className="font-bold text-sm tracking-tight text-fd-foreground">Synap</span>
            <span className="text-xs font-medium text-fd-muted-foreground">Docs</span>
          </span>
        ),
        url: '/',
      }}
      links={[{ text: 'GitHub', url: 'https://github.com/Synap-core', external: true }]}
      sidebar={{
        collapsible: true,
        defaultOpenLevel: 0,
      }}
    >
      {children}
    </DocsLayout>
  );
}
