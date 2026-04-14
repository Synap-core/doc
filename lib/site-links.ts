import { getSynapApiUrl } from './auth-config';

/** Hosted sign-in page on the API (fallback if you prefer redirect over the home form). */
export function getHostedSignInUrl(returnPath = '/team/overview'): string {
  const api = getSynapApiUrl();
  const docsBase = process.env.NEXT_PUBLIC_DOCS_URL || '';
  const callback = docsBase ? `${docsBase.replace(/\/$/, '')}${returnPath}` : returnPath;
  return `${api}/auth/sign-in?callbackUrl=${encodeURIComponent(callback)}`;
}
