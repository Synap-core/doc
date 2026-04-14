/** Canonical Synap API (Better Auth, session). Browser + server. */
export const DEFAULT_SYNAP_API_URL = 'https://api.synap.live';

export function getSynapApiUrl(): string {
  return (
    process.env.NEXT_PUBLIC_SYNAP_API_URL ||
    process.env.NEXT_PUBLIC_CP_API_URL ||
    DEFAULT_SYNAP_API_URL
  ).replace(/\/$/, '');
}
