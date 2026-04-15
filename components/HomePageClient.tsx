'use client';

import { useEffect, useState } from 'react';
import { HomeLayout } from 'fumadocs-ui/layouts/home';
import { Card, Cards } from 'fumadocs-ui/components/card';
import { Callout } from 'fumadocs-ui/components/callout';
import {
  ArrowRight,
  BookOpen,
  Cloud,
  Code2,
  FolderGit2,
  LogIn,
  Network,
  Rocket,
  Server,
} from 'lucide-react';
import Link from 'next/link';
import { buttonVariants } from 'fumadocs-ui/components/ui/button';
import { TeamSignInDialog } from '@/components/TeamSignInDialog';
import { SynapLogoMark } from '@/components/SynapLogoMark';
import { getHostedSignInUrl } from '@/lib/site-links';
import { homeUi } from '@/lib/home-ui';
import { cn } from '@/lib/utils';

export function HomePageClient() {
  const isDev = process.env.NODE_ENV === 'development';
  const hostedFallback = getHostedSignInUrl();
  const [signInOpen, setSignInOpen] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    if (params.get('signin') === '1' || window.location.hash === '#team-sign-in') {
      setSignInOpen(true);
    }
  }, []);

  function handleSignInOpenChange(open: boolean) {
    setSignInOpen(open);
    if (!open && typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      if (url.searchParams.has('signin')) {
        url.searchParams.delete('signin');
        window.history.replaceState({}, '', url.pathname + url.search + url.hash);
      }
    }
  }

  return (
    <>
      <TeamSignInDialog open={signInOpen} onOpenChange={handleSignInOpenChange} />
      <HomeLayout
        className="min-h-screen"
        nav={{
          enableSearch: false,
          title: (
            <span className="flex items-center gap-2">
              <SynapLogoMark className="size-5 shrink-0" />
              <span className="font-bold text-fd-foreground">Synap</span>
            </span>
          ),
          url: '/',
          children: (
            <button
              type="button"
              onClick={() => setSignInOpen(true)}
              className={cn(
                buttonVariants({
                  color: 'secondary',
                  className: 'gap-1.5 py-2.5 max-sm:shrink-0 [&_svg]:size-4',
                })
              )}
            >
              <LogIn className="size-4" aria-hidden />
              Sign in
            </button>
          ),
        }}
        links={[
          { text: 'Documentation', url: '/docs/start' },
          { text: 'Team', url: '/team/home', icon: <Server className="size-4" /> },
        ]}
      >
        <div className="container mx-auto flex flex-1 flex-col gap-12 px-4 py-10 md:gap-16 md:py-14">
          {isDev ? (
            <Callout type="warn" title="Development mode">
              Team routes use a <strong>mock session</strong> — open{' '}
              <Link href="/team/home" className="font-medium underline underline-offset-2">
                Team
              </Link>{' '}
              without API cookies. The sign-in form talks to the real API (needs CORS + trusted origins).
            </Callout>
          ) : null}

          <section className="mx-auto max-w-3xl text-center">
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-fd-muted-foreground">
              Documentation
            </p>
            <h1 className="text-balance text-4xl font-bold tracking-tight text-fd-foreground md:text-5xl">
              Sovereign personal data infrastructure
            </h1>
            <p className="mt-4 text-pretty text-lg text-fd-muted-foreground">
              Public guides below. Internal runbooks and per-surface notes are in{' '}
              <Link href="/team/home" className="font-medium text-fd-foreground underline-offset-4 hover:underline">
                Team
              </Link>{' '}
              after sign-in.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row sm:flex-wrap">
              <Link href="/docs/start/getting-started" className={homeUi.primaryCta}>
                Get started
                <ArrowRight className="size-4" aria-hidden />
              </Link>
              <Link href="/docs/start" className={homeUi.secondaryCta}>
                <BookOpen className="size-4" aria-hidden />
                Browse Use Synap
              </Link>
              <a
                href="https://synap.live"
                target="_blank"
                rel="noreferrer"
                className="text-sm font-medium text-fd-muted-foreground underline-offset-4 hover:text-fd-foreground hover:underline"
              >
                Sign up at synap.live
              </a>
            </div>
          </section>

          <section>
            <div className="mb-6 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
              <div>
                <h2 className="text-2xl font-semibold tracking-tight text-fd-foreground">Public documentation</h2>
                <p className="mt-2 max-w-xl text-fd-muted-foreground">
                  Five journeys — switch space in the sidebar when you are inside the docs.
                </p>
              </div>
              <Link
                href="/docs/start"
                className="inline-flex items-center gap-1 text-sm font-medium text-fd-primary hover:underline"
              >
                Open docs
                <ArrowRight className="size-4" />
              </Link>
            </div>
            <Cards>
              <Card
                className="h-full"
                icon={<Rocket className="size-5" />}
                title="Use Synap"
                description="Install, concepts, guides, and strategy — start using the product."
                href="/docs/start"
              />
              <Card
                className="h-full"
                icon={<Code2 className="size-5" />}
                title="Build & integrate"
                description="Hub Protocol, agents, CLI, skills, SDK, and API reference."
                href="/docs/integrate"
              />
              <Card
                className="h-full"
                icon={<FolderGit2 className="size-5" />}
                title="Contributing"
                description="Repositories, contribution guides, and how the monorepos fit together."
                href="/docs/contributing"
              />
              <Card
                className="h-full"
                icon={<Cloud className="size-5" />}
                title="Cloud & Intelligence"
                description="Hosted control plane (synap.live) and the agent layer on your pod."
                href="/docs/cloud"
              />
              <Card
                className="h-full"
                icon={<Network className="size-5" />}
                title="Architecture"
                description="System design, events, deployment, and deep technical reads."
                href="/docs/architecture"
              />
            </Cards>
          </section>

          <section
            id="team-sign-in"
            className="rounded-2xl border border-fd-border bg-fd-card p-6 md:p-8"
          >
            <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
              <div className="max-w-lg space-y-3">
                <h2 className="text-xl font-semibold tracking-tight text-fd-foreground md:text-2xl">
                  Team documentation
                </h2>
                <p className="text-fd-muted-foreground leading-relaxed">
                  Product voice, per-repo spaces, platform depth, intelligence, control plane, and DevOps — authenticated
                  with your Synap account.
                </p>
                <div className="flex flex-col gap-3 pt-1 sm:flex-row sm:flex-wrap">
                  <Link href="/team/home" className={homeUi.primaryCta}>
                    <Server className="size-4" aria-hidden />
                    Open Team docs
                  </Link>
                  <a
                    href={hostedFallback}
                    className="inline-flex min-h-10 items-center justify-center text-sm font-medium text-fd-muted-foreground underline-offset-4 hover:text-fd-foreground hover:underline"
                  >
                    Hosted sign-in page (fallback)
                  </a>
                </div>
              </div>
              <div className="flex flex-col gap-3 border-t border-fd-border pt-6 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
                <p className="text-sm font-medium text-fd-foreground">Sign in with email</p>
                <button
                  type="button"
                  onClick={() => setSignInOpen(true)}
                  className={cn(
                    buttonVariants({ color: 'secondary' }),
                    'inline-flex w-fit items-center justify-center gap-2 rounded-full px-5 py-2.5'
                  )}
                >
                  <LogIn className="size-4" aria-hidden />
                  Open sign-in
                </button>
              </div>
            </div>
          </section>
        </div>
      </HomeLayout>
    </>
  );
}
