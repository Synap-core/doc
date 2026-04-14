import { cn } from '@/lib/utils';

/**
 * Home landing page — single source for CTA / surface spacing.
 *
 * IMPORTANT: This file MUST be listed in `tailwind.config.ts` `content` — otherwise JIT
 * never emits these utilities and spacing classes silently do nothing in production.
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
} as const;
