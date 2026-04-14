/**
 * When true, team docs skip CP auth (middleware + server layout).
 * - SYNAP_TEAM_DOCS_BYPASS_AUTH=true
 * - NODE_ENV=development
 * - hostname localhost / 127.0.0.1 / ::1 (local next start uses production NODE_ENV)
 */
export function teamDocsSkipCpAuth(hostname: string | undefined): boolean {
  if (process.env.SYNAP_TEAM_DOCS_BYPASS_AUTH === "true") return true;
  if (process.env.NODE_ENV === "development") return true;
  if (!hostname) return false;
  const h = hostname.split(":")[0]?.toLowerCase() ?? "";
  return h === "localhost" || h === "127.0.0.1" || h === "::1";
}
