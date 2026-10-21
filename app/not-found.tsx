import { HomeLayout } from 'fumadocs-ui/layouts/home';
import { ArrowRight, House } from 'lucide-react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { baseOptions } from '@/lib/layout.shared';
import { homeUi } from '@/lib/home-ui';

export const metadata: Metadata = {
  title: 'Page not found',
};

/** Every unknown URL, under /docs or not: the site's own chrome, a way back, and search in the navbar. */
export default function NotFound() {
  return (
    <HomeLayout {...baseOptions()} className="min-h-screen" links={[{ text: 'Documentation', url: '/docs/start' }]}>
      <div className="container mx-auto flex flex-1 flex-col items-center justify-center gap-4 px-4 py-16 text-center">
        <p className="text-sm font-semibold uppercase tracking-widest text-fd-muted-foreground">404</p>
        <h1 className="text-balance text-3xl font-bold tracking-tight text-fd-foreground md:text-4xl">Page not found</h1>
        <p className="max-w-md text-pretty text-fd-muted-foreground">
          There is no page at this address. It may have moved when the docs were reorganized: search for it, or go back
          to the start.
        </p>
        <div className="mt-4 flex flex-col items-center gap-4 sm:flex-row">
          <Link href="/docs/start" className={homeUi.primaryCta}>
            Start here
            <ArrowRight className="size-4" aria-hidden />
          </Link>
          <Link href="/" className={homeUi.secondaryCta}>
            <House className="size-4" aria-hidden />
            Home
          </Link>
        </div>
      </div>
    </HomeLayout>
  );
}
