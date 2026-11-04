import Link from 'next/link';
import { Users } from 'lucide-react';
import type { NavPage } from '@/lib/nav';
import { cn } from '@/lib/utils';

/**
 * The Community section as a footer: its landing page, then each of its pages. Shown at the bottom of the docs
 * sidebar and of the home page (founder decision 2026-11-04: Community left the section switcher).
 */
export function CommunityFooter({ pages, className }: { pages: NavPage[]; className?: string }) {
  const [index, ...rest] = pages;
  return (
    <nav aria-label="Community" className={cn('flex flex-col gap-1.5 text-xs text-fd-muted-foreground', className)}>
      <Link
        href={index.url}
        className="inline-flex items-center gap-1.5 font-medium text-fd-foreground hover:text-fd-primary"
      >
        <span className="section-icon size-4 shrink-0" data-section="community" aria-hidden>
          <Users />
        </span>
        {index.title}
      </Link>
      <ul className="flex flex-wrap gap-x-3 gap-y-1">
        {rest.map((page) => (
          <li key={page.url}>
            <Link href={page.url} className="hover:text-fd-foreground hover:underline hover:underline-offset-4">
              {page.title}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
