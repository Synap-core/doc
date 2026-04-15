'use client';

import { useState } from 'react';
import { getSynapApiUrl } from '@/lib/auth-config';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

/** Inset field on popover: use muted/card, not bg-fd-background (blends with popover in dark) */
const inputClassName = cn(
  'h-11 w-full rounded-lg border border-fd-border bg-fd-card px-3.5 text-sm text-fd-foreground',
  'shadow-sm outline-none transition-shadow placeholder:text-fd-muted-foreground',
  'focus-visible:border-fd-ring focus-visible:ring-2 focus-visible:ring-fd-ring/50'
);

/**
 * Email/password sign-in against Synap API (Better Auth).
 */
export function TeamSignInForm({ id }: { id?: string }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    try {
      const api = getSynapApiUrl();
      const origin = typeof window !== 'undefined' ? window.location.origin : '';
      const callbackURL = `${origin}/team/home`;
      const res = await fetch(`${api}/auth/sign-in/email`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          callbackURL,
          rememberMe: true,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { message?: string };
      if (!res.ok) {
        setError(typeof data.message === 'string' ? data.message : 'Sign in failed');
        return;
      }
      window.location.href = '/team/home';
    } catch {
      setError(
        'Could not reach the API. For local dev, use Team without signing in, or check CORS / trustedOrigins on the API.'
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <form id={id} onSubmit={onSubmit} className="flex w-full flex-col">
      <div className="space-y-5">
        <div className="space-y-2.5">
          <label htmlFor="team-signin-email" className="block text-sm font-medium text-fd-foreground">
            Email
          </label>
          <input
            id="team-signin-email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClassName}
          />
        </div>
        <div className="space-y-2.5">
          <label htmlFor="team-signin-password" className="block text-sm font-medium text-fd-foreground">
            Password
          </label>
          <input
            id="team-signin-password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputClassName}
          />
        </div>
      </div>
      {error ? (
        <p className="mt-4 text-sm text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className={cn(
          'mt-6 inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg px-4',
          'bg-fd-primary text-sm font-medium text-fd-primary-foreground',
          'shadow-sm transition-colors hover:opacity-90 disabled:opacity-60'
        )}
      >
        {pending ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
        {pending ? 'Signing in…' : 'Sign in'}
      </button>
      <div className="mt-6 border-t border-fd-border pt-4">
        <p className="break-all text-xs leading-relaxed text-fd-muted-foreground">
          API:{' '}
          <code className="rounded-md bg-fd-muted px-2 py-1 font-mono text-[11px] text-fd-foreground">
            {getSynapApiUrl()}
          </code>
        </p>
      </div>
    </form>
  );
}
