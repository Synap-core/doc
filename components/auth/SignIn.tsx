'use client';

import { useRouter } from 'next/navigation';
import { ArrowRight, Globe, Users, Shield } from 'lucide-react';
import { spaces } from '@/lib/spaces';
import { redirectToLogin } from '@/lib/cp-auth';
import { Callout } from 'fumadocs-ui/components/callout';

export function SignIn() {
  const router = useRouter();

  const teamSpaces = spaces.filter(space => space.requireAuth);
  const publicSpaces = spaces.filter(space => !space.requireAuth);

  return (
    <div className="min-h-screen bg-fd-background flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="rounded-xl border border-fd-border bg-fd-card p-6 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-fd-primary/10 text-fd-primary flex items-center justify-center">
              <Shield className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-fd-foreground">Team Portal</h2>
              <p className="text-sm text-fd-muted-foreground">Internal access</p>
            </div>
          </div>
          <p className="text-sm text-fd-muted-foreground">
            Access internal documentation, roadmap, and team resources
          </p>

          <div className="space-y-6">
            <Callout type="info">
              Sign in with your Synap account to access team documentation
            </Callout>

            <button
              className="w-full rounded-lg bg-fd-primary px-4 py-2.5 text-sm font-medium text-fd-primary-foreground transition-colors hover:bg-fd-primary/90"
              onClick={() => redirectToLogin('/team/overview')}
            >
              <Shield className="h-4 w-4 mr-2" />
              Sign in with Synap
            </button>

            <div className="pt-4 border-t border-fd-border/30">
              <p className="text-sm text-fd-muted-foreground text-center">
                Use your existing Synap account credentials
              </p>
            </div>
          </div>

          <div className="w-full text-center">
            <p className="text-sm text-fd-muted-foreground">
              Not a team member?{' '}
              <a
                href="/docs/start/getting-started"
                className="text-fd-primary hover:underline inline-flex items-center font-medium"
              >
                Explore public docs
                <ArrowRight className="h-3 w-3 ml-1" />
              </a>
            </p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-xl border border-fd-border bg-fd-card p-6">
            <div className="mb-4">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-fd-primary" />
                <h3 className="text-base font-semibold text-fd-foreground">Team Spaces</h3>
              </div>
              <p className="text-sm text-fd-muted-foreground mt-1">
                What you&apos;ll unlock with authentication
              </p>
            </div>
            <div>
              <div className="space-y-3">
                {teamSpaces.slice(0, 4).map((space) => {
                  const SpaceIcon = space.icon;
                  return (
                    <div
                      key={space.id}
                      className="rounded-lg border border-fd-border bg-fd-card p-3 transition-colors hover:bg-fd-muted/40"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-fd-primary/10 text-fd-primary">
                          <SpaceIcon className="size-4" aria-hidden />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="truncate text-sm font-medium text-fd-foreground">{space.title}</h3>
                          <p className="truncate text-xs text-fd-muted-foreground">{space.description}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-fd-border">
              <div className="w-full text-center">
                <p className="text-sm text-fd-muted-foreground">
                  Plus {teamSpaces.length - 4} more team-only spaces
                </p>
              </div>
            </div>
          </div>

          <Callout type="info">
            <div className="flex items-start gap-3">
              <Globe className="h-5 w-5 text-fd-primary mt-0.5 flex-shrink-0" />
              <div>
                <div className="font-medium text-fd-foreground mb-1">
                  Public Access Available
                </div>
                <p className="text-sm text-fd-muted-foreground">
                  You can still explore {publicSpaces.length} public spaces without signing in
                </p>
                <button
                  className="mt-3 rounded-lg border border-fd-border px-3 py-1.5 text-sm text-fd-foreground hover:bg-fd-muted transition-colors"
                  onClick={() => router.push('/docs/start/getting-started')}
                >
                  Browse Public Docs
                </button>
              </div>
            </div>
          </Callout>
        </div>
      </div>
    </div>
  );
}
