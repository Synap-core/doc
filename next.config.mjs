import { createMDX } from 'fumadocs-mdx/next';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** Concept pages moved from Use Synap → Architecture (keep what-is-synap + index under /start/concepts). */
const MOVED_CONCEPT_SLUGS = [
  'architecture',
  'artificial-intelligence',
  'branching-conversations',
  'building-blocks',
  'channels',
  'composable-architecture',
  'contagious-layers',
  'data-sovereignty',
  'entities',
  'entity-connections',
  'event-sourcing-explained',
  'hub-and-spoke',
  'knowledge-graph',
  'multi-agent-system',
  'profile-schemas',
  'views',
  'workspace-as-a-service',
];

const movedConceptRedirects = MOVED_CONCEPT_SLUGS.flatMap((slug) => [
  { source: `/docs/start/concepts/${slug}`, destination: `/docs/architecture/concepts/${slug}`, permanent: true },
  { source: `/docs/concepts/${slug}`, destination: `/docs/architecture/concepts/${slug}`, permanent: true },
]);

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  outputFileTracingRoot: __dirname,
  async redirects() {
    return [
      // Default docs entry: Use Synap is a root folder (start/meta.json root: true)
      { source: '/docs', destination: '/docs/start', permanent: true },
      { source: '/docs/overview', destination: '/docs/start', permanent: true },
      { source: '/docs/overview/:path*', destination: '/docs/start', permanent: true },
      { source: '/team', destination: '/team/home', permanent: true },
      { source: '/team/overview', destination: '/team/home', permanent: true },

      // Legacy team paths under /docs → /team
      { source: '/docs/home/:path*', destination: '/team/home/:path*', permanent: true },
      { source: '/docs/platform/:path*', destination: '/team/platform/:path*', permanent: true },
      { source: '/docs/control-plane/:path*', destination: '/team/control-plane/:path*', permanent: true },
      { source: '/docs/relay/:path*', destination: '/team/relay/:path*', permanent: true },
      { source: '/docs/devops/:path*', destination: '/team/devops/:path*', permanent: true },

      // Old flat public URLs → journey-based IA
      { source: '/docs/getting-started/:path*', destination: '/docs/start/getting-started/:path*', permanent: true },
      { source: '/docs/getting-started', destination: '/docs/start/getting-started', permanent: true },
      {
        source: '/docs/start/getting-started/introduction',
        destination: '/docs/start/getting-started',
        permanent: true,
      },
      {
        source: '/docs/start/getting-started/why-events',
        destination: '/docs/architecture/concepts/why-events',
        permanent: true,
      },
      ...movedConceptRedirects,
      { source: '/docs/concepts/:path*', destination: '/docs/start/concepts/:path*', permanent: true },
      { source: '/docs/concepts', destination: '/docs/start/concepts', permanent: true },
      { source: '/docs/guides/:path*', destination: '/docs/start/guides/:path*', permanent: true },
      { source: '/docs/guides', destination: '/docs/start/guides', permanent: true },
      { source: '/docs/deployment/:path*', destination: '/docs/architecture/deployment/:path*', permanent: true },
      { source: '/docs/deployment', destination: '/docs/architecture/deployment', permanent: true },
      { source: '/docs/start/deployment/:path*', destination: '/docs/architecture/deployment/:path*', permanent: true },
      { source: '/docs/start/deployment', destination: '/docs/architecture/deployment', permanent: true },
      { source: '/docs/strategy/:path*', destination: '/docs/start/strategy/:path*', permanent: true },
      { source: '/docs/strategy', destination: '/docs/start/strategy', permanent: true },
      { source: '/docs/resources/:path*', destination: '/docs/start/resources/:path*', permanent: true },
      { source: '/docs/resources', destination: '/docs/start/resources', permanent: true },
      {
        source: '/docs/start/resources/comparisons/:path*',
        destination: '/docs/start/resources',
        permanent: true,
      },
      { source: '/docs/vision', destination: '/docs/start/vision', permanent: true },

      { source: '/docs/development/contributing/:path*', destination: '/docs/contributing/guides/:path*', permanent: true },
      { source: '/docs/development/contributing', destination: '/docs/contributing/guides/overview', permanent: true },

      { source: '/docs/open-source/contributing/:path*', destination: '/docs/contributing/guides/:path*', permanent: true },
      { source: '/docs/open-source/contributing', destination: '/docs/contributing/guides/overview', permanent: true },
      { source: '/docs/open-source/:path*', destination: '/docs/contributing/:path*', permanent: true },
      { source: '/docs/open-source', destination: '/docs/contributing', permanent: true },

      { source: '/docs/platform-services', destination: '/docs/cloud/synap-cloud', permanent: true },
      { source: '/docs/intelligence', destination: '/docs/cloud/intelligence', permanent: true },
      { source: '/docs/development/:path*', destination: '/docs/integrate/development/:path*', permanent: true },
      { source: '/docs/development', destination: '/docs/integrate/development', permanent: true },

      { source: '/docs/integrations/:path*', destination: '/docs/integrate/integrations/:path*', permanent: true },
      { source: '/docs/integrations', destination: '/docs/integrate/integrations', permanent: true },

      { source: '/docs/reference/:path*', destination: '/docs/integrate/reference/:path*', permanent: true },
      { source: '/docs/reference', destination: '/docs/integrate/reference', permanent: true },

      // Removed /developers app — send to integrate hub + reference
      { source: '/developers', destination: '/docs/integrate', permanent: true },
      { source: '/developers/:path*', destination: '/docs/integrate/reference', permanent: true },
    ];
  },
};

const withMDX = createMDX();
export default withMDX(config);
