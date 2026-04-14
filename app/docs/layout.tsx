import { DocsLayout } from 'fumadocs-ui/layouts/docs';
import { docsSource } from '@/lib/source';
import { SynapSpaceSelector } from '@/components/SynapSpaceSelector';
import { LogIn } from 'lucide-react';
import { buttonVariants } from 'fumadocs-ui/components/ui/button';
import { cn } from '@/lib/utils';
import { SynapLogoMark } from '@/components/SynapLogoMark';
import type { ReactNode } from 'react';

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <DocsLayout
      tree={docsSource.pageTree}
      nav={{
        title: (
          <span className="flex items-center gap-2">
            <SynapLogoMark className="size-5 shrink-0" />
            <span className="font-bold text-sm tracking-tight text-fd-foreground">Synap</span>
            <span className="text-xs font-medium text-fd-muted-foreground">Docs</span>
          </span>
        ),
        url: '/docs/start',
        children: (
          <a
            href="/?signin=1"
            className={cn(
              buttonVariants({
                color: 'secondary',
                className:
                  'hidden size-9 items-center justify-center rounded-full p-0 text-fd-muted-foreground hover:text-fd-foreground md:ml-auto md:inline-flex',
              })
            )}
            aria-label="Sign in"
            title="Sign in"
          >
            <LogIn className="size-4" aria-hidden />
          </a>
        ),
      }}
      links={[]}
      sidebar={{
        collapsible: true,
        defaultOpenLevel: 1,
        tabs: false,
        banner: (
          <div className="-mx-2 px-2">
            <SynapSpaceSelector variant="public" />
          </div>
        ),
      }}
    >
      {children}
    </DocsLayout>
  );
}
