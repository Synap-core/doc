import sources from '@/content/reference-data/sources.json';

/**
 * Where a generated reference page comes from, for its header: the repository, the ref and the commit recorded in
 * content/reference-data/sources.json by scripts/sync-reference.mjs (read at build time, so the label follows each
 * sync). The pages are generated from each repository's main branch, which can be ahead of what people install.
 */
const RELEASED_AS: Record<string, string> = {
  'Synap-core/backend': 'the stable release self-hosters install',
  'Synap-core/synap-cli': 'the published @synap-core/cli',
};

export interface GeneratedSource {
  repo: string;
  ref: string;
  commit: string;
  shortCommit: string;
  url: string;
  /** What the ref can be ahead of, in words. */
  releasedAs: string;
}

interface SourceEntry {
  repo: string;
  ref: string;
  commit: string;
}

/** `generated_from` is "<owner>/<repo>@<commit> (<ref>)" (scripts/generate-reference.mjs). */
/** Throws (and so fails the build) when the repository is not in sources.json: a label must never silently vanish. */
export function generatedSource(generatedFrom: string): GeneratedSource {
  const repo = generatedFrom.split('@')[0];
  const entry = Object.values(sources as Record<string, unknown>).find(
    (value): value is SourceEntry =>
      typeof value === 'object' && value !== null && (value as SourceEntry).repo === repo,
  );
  if (!entry) throw new Error(`generated_from "${generatedFrom}": ${repo} is not in content/reference-data/sources.json`);
  return {
    repo: entry.repo,
    ref: entry.ref,
    commit: entry.commit,
    shortCommit: entry.commit.slice(0, 7),
    url: `https://github.com/${entry.repo}/tree/${entry.commit}`,
    releasedAs: RELEASED_AS[entry.repo] ?? 'the latest release',
  };
}
