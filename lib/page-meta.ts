/**
 * The page frontmatter vocabulary. One list, read by:
 *  - source.config.ts (the build validates every page against it)
 *  - scripts/check-frontmatter.mjs (the same rules, without a build)
 *  - the page header (badges)
 *
 * Change a list here and both checks follow.
 */
export const PAGE_TYPES = ['tutorial', 'how-to', 'reference', 'explanation'] as const;

export const AUDIENCES = ['user', 'self-host', 'builder', 'contributor'] as const;

export const AVAILABILITY = [
  'pod-oss',
  'cloud',
  'browser',
  'relay',
  'raycast',
  'eve',
  'cli',
  'sdk',
] as const;

export const STATUSES = ['current', 'beta', 'deprecated'] as const;

export type PageType = (typeof PAGE_TYPES)[number];
export type Audience = (typeof AUDIENCES)[number];
export type Availability = (typeof AVAILABILITY)[number];
export type Status = (typeof STATUSES)[number];

export const AVAILABILITY_LABELS: Record<Availability, string> = {
  'pod-oss': 'Open-source pod',
  cloud: 'Synap Cloud',
  browser: 'Browser',
  relay: 'Relay',
  raycast: 'Raycast',
  eve: 'Eve',
  cli: 'CLI',
  sdk: 'SDK',
};

export const AUDIENCE_LABELS: Record<Audience, string> = {
  user: 'Users',
  'self-host': 'Self-hosters',
  builder: 'Builders',
  contributor: 'Contributors',
};
