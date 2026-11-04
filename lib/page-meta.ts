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

/**
 * The PAGE's review state, not the feature's: `current` (checked against the code), `beta` (not re-verified yet: the
 * page shows a warning banner and carries no `last_reviewed`), `deprecated` (describes something being retired).
 */
export const STATUSES = ['current', 'beta', 'deprecated'] as const;

/**
 * Optional: how far the FEATURE the page describes has shipped, shown as a badge. Leave it out for a feature that is
 * released. `beta`: in beta testing (e.g. Relay on TestFlight); `not-published`: built but not published where people
 * install it (e.g. a store); `main-only`: on a repository's main branch, not in a tagged release yet.
 */
export const MATURITIES = ['beta', 'not-published', 'main-only'] as const;

export type PageType = (typeof PAGE_TYPES)[number];
export type Audience = (typeof AUDIENCES)[number];
export type Availability = (typeof AVAILABILITY)[number];
export type Status = (typeof STATUSES)[number];
export type Maturity = (typeof MATURITIES)[number];

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

export const STATUS_LABELS: Record<Status, string> = {
  current: 'Current',
  beta: 'Not re-verified',
  deprecated: 'Deprecated',
};

export const MATURITY_LABELS: Record<Maturity, string> = {
  beta: 'Beta testing',
  'not-published': 'Not published yet',
  'main-only': 'Not in a release yet',
};
