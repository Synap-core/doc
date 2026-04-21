import {
  Rocket,
  Cloud,
  Code2,
  Compass,
  Layers,
  Brain,
  Server,
  Smartphone,
  Terminal,
  FolderGit2,
  Network,
  Monitor,
  AppWindow,
  Command,
  Package,
  type LucideIcon,
} from 'lucide-react';

export interface SpaceConfig {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  path: string;
  requireAuth: boolean;
  category: 'team' | 'public' | 'development';
  order: number;
  /**
   * Closed space selector (popover trigger): background + border when this space is active.
   * Use translucent Tailwind colors so icons stay visible.
   */
  spaceSelectorActiveClass: string;
  /** Icon color in the selector (no box); align hue with `spaceSelectorActiveClass`. */
  spaceSelectorIconClass: string;
}

/** Longest-prefix match: list paths from most specific to least. */
export const spaces: SpaceConfig[] = [
  // —— Public (/docs) — same labels as Fumadocs root tabs ——
  {
    id: 'start',
    title: 'Use Synap',
    description: 'Install, concepts, guides, deployment, usage',
    icon: Rocket,
    path: '/docs/start',
    requireAuth: false,
    category: 'public',
    order: 0,
    spaceSelectorActiveClass:
      'border border-sky-500/30 bg-sky-500/14 text-fd-foreground dark:border-sky-400/35 dark:bg-sky-500/18',
    spaceSelectorIconClass: 'text-sky-600 dark:text-sky-400',
  },
  {
    id: 'integrate',
    title: 'Build & integrate',
    description: 'SDK, API reference, webhooks, extensions',
    icon: Code2,
    path: '/docs/integrate',
    requireAuth: false,
    category: 'public',
    order: 1,
    spaceSelectorActiveClass:
      'border border-indigo-500/30 bg-indigo-500/14 text-fd-foreground dark:border-indigo-400/35 dark:bg-indigo-500/18',
    spaceSelectorIconClass: 'text-indigo-600 dark:text-indigo-400',
  },
  {
    id: 'contributing',
    title: 'Contributing',
    description: 'Repositories, contribution guides, ecosystem',
    icon: FolderGit2,
    path: '/docs/contributing',
    requireAuth: false,
    category: 'public',
    order: 2,
    spaceSelectorActiveClass:
      'border border-emerald-500/30 bg-emerald-500/14 text-fd-foreground dark:border-emerald-400/35 dark:bg-emerald-500/18',
    spaceSelectorIconClass: 'text-emerald-600 dark:text-emerald-400',
  },
  {
    id: 'cloud-intelligence',
    title: 'Cloud & Intelligence',
    description: 'synap.live, api.synap.live, and the agent layer on your pod',
    icon: Cloud,
    path: '/docs/cloud',
    requireAuth: false,
    category: 'public',
    order: 3,
    spaceSelectorActiveClass:
      'border border-cyan-500/30 bg-cyan-500/14 text-fd-foreground dark:border-cyan-400/35 dark:bg-cyan-500/18',
    spaceSelectorIconClass: 'text-cyan-600 dark:text-cyan-400',
  },
  {
    id: 'architecture-public',
    title: 'Architecture',
    description: 'System design, events, and deep technical reads',
    icon: Network,
    path: '/docs/architecture',
    requireAuth: false,
    category: 'public',
    order: 4,
    spaceSelectorActiveClass:
      'border border-fuchsia-500/30 bg-fuchsia-500/14 text-fd-foreground dark:border-fuchsia-400/35 dark:bg-fuchsia-500/18',
    spaceSelectorIconClass: 'text-fuchsia-600 dark:text-fuchsia-400',
  },

  // —— Team (auth) — matches Fumadocs team root tabs ——
  {
    id: 'home',
    title: 'Home & vision',
    description: 'North star, voice, roadmap, strategy, launch, market',
    icon: Compass,
    path: '/team/home',
    requireAuth: true,
    category: 'team',
    order: 10,
    spaceSelectorActiveClass:
      'border border-orange-500/30 bg-orange-500/14 text-fd-foreground dark:border-orange-400/35 dark:bg-orange-500/18',
    spaceSelectorIconClass: 'text-orange-600 dark:text-orange-400',
  },
  {
    id: 'synap-app',
    title: 'Synap App',
    description: 'Web app monorepo (synap-app) — UX, flows, frontend architecture',
    icon: Monitor,
    path: '/team/synap-app',
    requireAuth: true,
    category: 'team',
    order: 11,
    spaceSelectorActiveClass:
      'border border-sky-500/30 bg-sky-500/14 text-fd-foreground dark:border-sky-400/35 dark:bg-sky-500/18',
    spaceSelectorIconClass: 'text-sky-600 dark:text-sky-400',
  },
  {
    id: 'synap-packages',
    title: 'Synap packages',
    description: 'synap-app monorepo — all @synap-core packages, boundaries, GitHub',
    icon: Package,
    path: '/team/synap-packages',
    requireAuth: true,
    category: 'team',
    order: 12,
    spaceSelectorActiveClass:
      'border border-cyan-500/30 bg-cyan-500/14 text-fd-foreground dark:border-cyan-400/35 dark:bg-cyan-500/18',
    spaceSelectorIconClass: 'text-cyan-600 dark:text-cyan-400',
  },
  {
    id: 'browser',
    title: 'Browser',
    description: 'Electron desktop app — primary client surface',
    icon: AppWindow,
    path: '/team/browser',
    requireAuth: true,
    category: 'team',
    order: 13,
    spaceSelectorActiveClass:
      'border border-violet-500/30 bg-violet-500/14 text-fd-foreground dark:border-violet-400/35 dark:bg-violet-500/18',
    spaceSelectorIconClass: 'text-violet-600 dark:text-violet-400',
  },
  {
    id: 'relay',
    title: 'Relay',
    description: 'Mobile app and native OS integration',
    icon: Smartphone,
    path: '/team/relay',
    requireAuth: true,
    category: 'team',
    order: 14,
    spaceSelectorActiveClass:
      'border border-pink-500/30 bg-pink-500/14 text-fd-foreground dark:border-pink-400/35 dark:bg-pink-500/18',
    spaceSelectorIconClass: 'text-pink-600 dark:text-pink-400',
  },
  {
    id: 'raycast',
    title: 'Raycast',
    description: 'Raycast extension — power-user workflows',
    icon: Command,
    path: '/team/raycast',
    requireAuth: true,
    category: 'team',
    order: 15,
    spaceSelectorActiveClass:
      'border border-amber-500/30 bg-amber-500/14 text-fd-foreground dark:border-amber-400/35 dark:bg-amber-500/18',
    spaceSelectorIconClass: 'text-amber-600 dark:text-amber-400',
  },
  {
    id: 'eve-cli',
    title: 'Eve',
    description: 'Entity Creation System — hestia-cli monorepo, eve CLI',
    icon: Package,
    path: '/team/eve-cli',
    requireAuth: true,
    category: 'team',
    order: 16,
    spaceSelectorActiveClass:
      'border border-emerald-500/30 bg-emerald-500/14 text-fd-foreground dark:border-emerald-400/35 dark:bg-emerald-500/18',
    spaceSelectorIconClass: 'text-emerald-600 dark:text-emerald-400',
  },
  {
    id: 'technologies',
    title: 'Stack & tools',
    description: 'Docker, Ollama, Traefik, tunnels — references for self-host stacks',
    icon: Network,
    path: '/team/technologies',
    requireAuth: true,
    category: 'team',
    order: 17,
    spaceSelectorActiveClass:
      'border border-stone-500/30 bg-stone-500/14 text-fd-foreground dark:border-stone-400/35 dark:bg-stone-500/18',
    spaceSelectorIconClass: 'text-stone-600 dark:text-stone-300',
  },
  {
    id: 'intelligence',
    title: 'Intelligence',
    description: 'Agent hub, skills, IS deployment',
    icon: Brain,
    path: '/team/intelligence',
    requireAuth: true,
    category: 'team',
    order: 18,
    spaceSelectorActiveClass:
      'border border-teal-500/30 bg-teal-500/14 text-fd-foreground dark:border-teal-400/35 dark:bg-teal-500/18',
    spaceSelectorIconClass: 'text-teal-600 dark:text-teal-400',
  },
  {
    id: 'control-plane',
    title: 'Control plane',
    description: 'api.synap.live — pods, provisioning, incidents',
    icon: Server,
    path: '/team/control-plane',
    requireAuth: true,
    category: 'team',
    order: 19,
    spaceSelectorActiveClass:
      'border border-slate-500/30 bg-slate-500/14 text-fd-foreground dark:border-slate-400/35 dark:bg-slate-500/22',
    spaceSelectorIconClass: 'text-slate-600 dark:text-slate-300',
  },
  {
    id: 'platform',
    title: 'Platform',
    description: 'Data pod, Hub Protocol, channels, feeds, design system',
    icon: Layers,
    path: '/team/platform',
    requireAuth: true,
    category: 'team',
    order: 20,
    spaceSelectorActiveClass:
      'border border-blue-500/30 bg-blue-500/14 text-fd-foreground dark:border-blue-400/35 dark:bg-blue-500/18',
    spaceSelectorIconClass: 'text-blue-600 dark:text-blue-400',
  },
  {
    id: 'devops',
    title: 'DevOps',
    description: 'Onboarding, Docker, security runbooks',
    icon: Terminal,
    path: '/team/devops',
    requireAuth: true,
    category: 'team',
    order: 21,
    spaceSelectorActiveClass:
      'border border-lime-500/30 bg-lime-500/14 text-fd-foreground dark:border-lime-400/35 dark:bg-lime-500/16',
    spaceSelectorIconClass: 'text-lime-600 dark:text-lime-400',
  },
];

export const publicSpaces = spaces.filter((space) => !space.requireAuth);
export const teamSpaces = spaces.filter((space) => space.requireAuth);

export function getSpaceById(id: string): SpaceConfig | undefined {
  return spaces.find((space) => space.id === id);
}

export function getSpaceByPath(path: string): SpaceConfig | undefined {
  const sorted = [...spaces].sort((a, b) => b.path.length - a.path.length);
  return sorted.find((space) => path === space.path || path.startsWith(`${space.path}/`));
}

export function getCurrentSpace(path: string): SpaceConfig | undefined {
  return getSpaceByPath(path);
}
