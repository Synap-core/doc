import { DocsLayout } from 'fumadocs-ui/layouts/docs';
import { teamSource } from '@/lib/source';
import type { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { getServerLoginUrl, getServerSession } from '@/lib/cp-auth-server';
import { BookOpen, Home } from 'lucide-react';
import { SpaceSwitcher } from '@/components/SpaceSwitcher';
import { SynapSpaceSelector } from '@/components/SynapSpaceSelector';
import { SynapLogoMark } from '@/components/SynapLogoMark';

export const dynamic = 'force-dynamic';

export default async function TeamLayout({ children }: { children: ReactNode }) {
  const session = await getServerSession();

  if (!session?.user) {
    redirect(getServerLoginUrl('/team/overview'));
  }

  return (
    <DocsLayout
      tree={teamSource.pageTree}
      nav={{
        title: (
          <span className="flex items-center gap-2">
            <SynapLogoMark className="size-5 shrink-0" />
            <span className="font-bold text-sm tracking-tight text-fd-foreground">Synap</span>
            <span className="text-xs font-medium text-fd-muted-foreground">Team</span>
          </span>
        ),
        url: '/team/overview',
      }}
      links={[
        { text: 'Site home', url: '/', icon: <Home className="size-4" /> },
        { text: 'Public docs', url: '/docs/start', icon: <BookOpen className="size-4" /> },
      ]}
      sidebar={{
        collapsible: true,
        defaultOpenLevel: 1,
        tabs: false,
        banner: (
          <div className="-mx-2 flex flex-col gap-0.5 px-2">
            <SynapSpaceSelector variant="team" />
            <SpaceSwitcher isAuthenticated compact user={session.user} />
          </div>
        ),
        footer: (
          <div className="border-t border-fd-border px-3 py-2 text-xs text-fd-muted-foreground">
            <span className="text-fd-foreground/80">Signed in</span>
            <span className="mx-1 text-fd-border">·</span>
            <span className="truncate">{session.user.email}</span>
          </div>
        ),
      }}
    >
      {children}
    </DocsLayout>
  );
}
