import { cn } from '@/lib/utils';

/**
 * Home and 404 pages: single source for CTA and surface classes.
 * Tailwind v4 detects these class strings automatically (lib/ is not gitignored).
 */
export const homeUi = {
  primaryCta: cn(
    'inline-flex items-center justify-center gap-2 rounded-full',
    'bg-fd-primary px-6 py-2.5 text-sm font-semibold text-fd-primary-foreground',
    'transition-colors hover:bg-fd-primary/90'
  ),
  secondaryCta: cn(
    'inline-flex items-center justify-center gap-2 rounded-full',
    'border border-fd-border bg-fd-card px-6 py-2.5 text-sm font-medium text-fd-foreground',
    'transition-colors hover:bg-fd-accent/80'
  ),
  /** A section heading: small, quiet, above a group of cards. */
  sectionLabel: 'mb-4 text-xs font-semibold uppercase tracking-[0.12em] text-fd-muted-foreground',
  /** A card surface: the paper film over the ground, a hairline border. */
  surface: 'rounded-2xl border border-fd-border bg-fd-card',
  /** A whole-card link. */
  linkCard: cn(
    'group flex flex-col gap-2 rounded-2xl border border-fd-border bg-fd-card p-5',
    'transition-colors hover:border-fd-ring/50 hover:bg-fd-accent/60',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fd-ring'
  ),
  /** The icon tile on a card: the ochre wash. */
  iconTile: 'flex size-9 items-center justify-center rounded-xl bg-fd-accent text-fd-primary [&_svg]:size-[1.125rem]',
  /** A text link inside a card. */
  inlineLink: cn(
    'inline-flex items-center gap-1 rounded-sm text-sm text-fd-foreground underline decoration-fd-primary/40',
    'underline-offset-4 transition-colors hover:decoration-fd-primary',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fd-ring'
  ),
} as const;
