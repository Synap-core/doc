'use client';

import { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { getSpaceByPath } from '@/lib/spaces';
import { useAuth } from '@/components/AuthProvider';
import { SignIn } from './auth/SignIn';

interface AuthGuardProps {
  children: ReactNode;
  requireAuth?: boolean;
}

export function AuthGuard({ children, requireAuth = false }: AuthGuardProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const pathname = usePathname();
  
  let spaceRequiresAuth = requireAuth;
  if (!spaceRequiresAuth && pathname) {
    const space = getSpaceByPath(pathname);
    if (space) {
      spaceRequiresAuth = space.requireAuth;
    }
  }
  
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-fd-background">
        <div className="text-center">
          <div className="inline-block size-8 animate-spin rounded-full border-2 border-fd-border border-t-fd-primary" />
          <p className="mt-4 text-sm text-fd-muted-foreground">Loading authentication…</p>
        </div>
      </div>
    );
  }

  if (spaceRequiresAuth && !isAuthenticated) {
    return <SignIn />;
  }

  return <>{children}</>;
}