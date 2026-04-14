import { headers } from 'next/headers';
import type { Session } from './cp-auth';
import { getSynapApiUrl } from './auth-config';

import { teamDocsSkipCpAuth } from '@/lib/team-docs-dev-bypass';

const CP_API_URL = getSynapApiUrl();
const DOCS_URL = process.env.NEXT_PUBLIC_DOCS_URL || '';

const devSession: Session = {
  user: {
    id: 'dev-user',
    email: 'dev@synap.local',
    name: 'Developer',
    role: 'admin',
  },
  session: {
    id: 'dev-session',
    userId: 'dev-user',
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  },
};

export async function getServerSession(): Promise<Session | null> {
  const requestHeaders = await headers();
  const host =
    requestHeaders.get('x-forwarded-host') ?? requestHeaders.get('host') ?? '';
  const hostname = host.split(':')[0] ?? '';

  if (teamDocsSkipCpAuth(hostname)) {
    return devSession;
  }

  try {
    const cookie = requestHeaders.get('cookie');

    const res = await fetch(`${CP_API_URL}/auth/get-session`, {
      headers: {
        Accept: 'application/json',
        ...(cookie ? { cookie } : {}),
      },
      cache: 'no-store',
    });

    if (!res.ok) return null;

    const data = await res.json();
    if (!data?.user) return null;

    return data as Session;
  } catch {
    return null;
  }
}

export function getServerLoginUrl(returnPath = '/team/overview'): string {
  const callbackUrl = DOCS_URL ? `${DOCS_URL}${returnPath}` : returnPath;
  return `${getSynapApiUrl()}/auth/sign-in?callbackUrl=${encodeURIComponent(callbackUrl)}`;
}
