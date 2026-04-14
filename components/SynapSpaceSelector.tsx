'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronDown } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from 'fumadocs-ui/components/ui/popover';
import { useSidebar } from 'fumadocs-ui/provider';
import { cn } from '@/lib/utils';
import { publicSpaces, teamSpaces, type SpaceConfig } from '@/lib/spaces';

function normalizePath(pathname: string) {
  if (pathname.length > 1 && pathname.endsWith('/')) return pathname.slice(0, -1);
  return pathname;
}

function selectSpace(pathname: string, list: SpaceConfig[]): SpaceConfig | undefined {
  const p = normalizePath(pathname);
  const sorted = [...list].sort((a, b) => b.path.length - a.path.length);
  return sorted.find((s) => p === s.path || p.startsWith(`${s.path}/`));
}

function SpaceIcon({ space }: { space: SpaceConfig }) {
  const Icon = space.icon;
  return (
    <span className="flex size-8 shrink-0 items-center justify-center">
      <Icon className={cn('size-4 shrink-0', space.spaceSelectorIconClass)} aria-hidden />
    </span>
  );
}

/**
 * Replaces Fumadocs `RootToggle`: closed state is icon + title only (no description);
 * each space has its own accent on the trigger. Menu rows keep title + description.
 */
export function SynapSpaceSelector({ variant }: { variant: 'public' | 'team' }) {
  const primaryList = variant === 'public' ? publicSpaces : teamSpaces;
  const secondaryList = variant === 'public' ? teamSpaces : publicSpaces;
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { closeOnRedirect } = useSidebar();

  const selected = useMemo(
    () => selectSpace(pathname, primaryList) ?? selectSpace(pathname, secondaryList),
    [pathname, primaryList, secondaryList]
  );

  const onPick = () => {
    closeOnRedirect.current = false;
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        type="button"
        className={cn(
          'flex w-full min-w-0 flex-row items-center gap-2 rounded-2xl border px-2 py-1.5 text-start transition-colors',
          'outline-none focus-visible:ring-2 focus-visible:ring-fd-primary/40',
          selected
            ? selected.spaceSelectorActiveClass
            : 'border-transparent hover:bg-fd-accent/50 hover:text-fd-accent-foreground'
        )}
      >
        {selected ? (
          <>
            <SpaceIcon space={selected} />
            <span className="min-w-0 flex-1 truncate text-sm font-medium">{selected.title}</span>
          </>
        ) : (
          <span className="min-w-0 flex-1 truncate text-sm text-fd-muted-foreground">Select space</span>
        )}
        <ChevronDown className="ms-auto size-4 shrink-0 text-fd-muted-foreground" />
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-[min(26rem,var(--radix-popover-trigger-width))] overflow-hidden rounded-2xl border border-fd-border bg-fd-popover p-0 shadow-2xl"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <div className="flex max-h-[min(72vh,32rem)] flex-col overflow-y-auto p-1.5">
          <SpaceSection
            title={variant === 'public' ? 'Public spaces' : 'Team spaces'}
            spaces={primaryList}
            selectedId={selected?.id}
            onPick={onPick}
          />
          <div className="my-1 h-px bg-fd-border" />
          <SpaceSection
            title={variant === 'public' ? 'Team spaces' : 'Public spaces'}
            spaces={secondaryList}
            selectedId={selected?.id}
            onPick={onPick}
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}

function SpaceSection({
  title,
  spaces,
  selectedId,
  onPick,
}: {
  title: string;
  spaces: SpaceConfig[];
  selectedId?: string;
  onPick: () => void;
}) {
  return (
    <div className="space-y-1">
      <p className="px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-fd-muted-foreground">{title}</p>
      {spaces.map((space) => {
        const active = selectedId === space.id;
        return (
          <Link
            key={space.id}
            href={space.path}
            onClick={onPick}
            className={cn(
              'flex w-full flex-row items-start gap-2 rounded-xl px-2 py-2.5 transition-colors',
              active ? 'bg-fd-accent text-fd-accent-foreground' : 'hover:bg-fd-accent/50'
            )}
          >
            <SpaceIcon space={space} />
            <div className="min-w-0 flex-1 text-start">
              <p className="text-sm font-medium leading-tight">{space.title}</p>
              <p
                className={cn(
                  'mt-0.5 text-xs leading-snug',
                  active ? 'text-fd-accent-foreground/80' : 'text-fd-muted-foreground'
                )}
              >
                {space.description}
              </p>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
