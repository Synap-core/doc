'use client';

import { LogIn, User, Globe } from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';
import { cn } from '@/lib/utils';

interface SpaceSwitcherProps {
  isAuthenticated: boolean;
  user?: { email?: string; name?: string; role?: string };
  /** Single-line strip under the space selector (team layout). */
  compact?: boolean;
}

export function SpaceSwitcher({ isAuthenticated, user, compact }: SpaceSwitcherProps) {
  const { login } = useAuth();

  if (compact && isAuthenticated) {
    return (
      <div className="flex min-w-0 items-center gap-2 px-2 py-0.5">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-fd-primary/15 text-fd-primary">
          <User className="size-3.5" aria-hidden />
        </div>
        <span className="min-w-0 truncate text-xs text-fd-muted-foreground">{user?.email ?? 'Team'}</span>
      </div>
    );
  }

  return (
    <div className={cn('border-b border-fd-border bg-fd-card px-3 py-2')}>
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <div
            className={
              isAuthenticated
                ? 'flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-fd-primary/15 text-fd-primary'
                : 'flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-fd-muted text-fd-muted-foreground'
            }
          >
            {isAuthenticated ? <User className="size-4" /> : <Globe className="size-4" />}
          </div>

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-fd-foreground">
              {isAuthenticated ? (user?.name || 'Team Member') : 'Public Access'}
            </p>
            <p className="truncate text-xs text-fd-muted-foreground">
              {isAuthenticated ? (user?.email || 'synap.io') : 'Browse public docs'}
            </p>
          </div>
        </div>

        {!isAuthenticated && (
          <button
            type="button"
            onClick={login}
            className="rounded-md p-2 text-fd-muted-foreground transition-colors hover:bg-fd-muted hover:text-fd-foreground"
            aria-label="Sign in to team spaces"
            title="Sign in to access team documentation"
          >
            <LogIn className="size-4" />
          </button>
        )}
      </div>
    </div>
  );
}


