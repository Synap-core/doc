import { createMDX } from 'fumadocs-mdx/next';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Old public URLs → the six-section tree (2026-10 consolidation).
 * Pages that were removed send readers to the closest current page.
 */
const moved = [
  // Start
  ['/docs/start/concepts/what-is-synap', '/docs/start/what-is-synap'],
  ['/docs/start/concepts', '/docs/start/what-is-synap'],
  ['/docs/start/getting-started/getting-started', '/docs/start'],
  ['/docs/start/getting-started/ai-agents-and-tools', '/docs/build/agents'],
  ['/docs/start/getting-started/next-steps', '/docs/start'],
  ['/docs/start/getting-started', '/docs/start'],
  // Cloud
  ['/docs/cloud/synap-cloud', '/docs/use/cloud-vs-self-hosted'],
  ['/docs/cloud/intelligence', '/docs/use/cloud-vs-self-hosted'],
  ['/docs/cloud/pod-updates', '/docs/run/upgrades'],
  ['/docs/cloud', '/docs/use/cloud-vs-self-hosted'],
  // Build
  ['/docs/integrate/integrations/api-keys', '/docs/build/api-keys'],
  ['/docs/integrate/integrations/webhooks-guide', '/docs/build/webhooks'],
  ['/docs/integrate/integrations/chat-stream', '/docs/build/chat-stream'],
  ['/docs/integrate/integrations/skill-invocation', '/docs/build/skill-invocation'],
  ['/docs/integrate/integrations/sdk-direct', '/docs/build/sdk'],
  ['/docs/integrate/development/sdk/first-query', '/docs/build/sdk'],
  ['/docs/integrate/development/sdk/overview', '/docs/build/sdk'],
  ['/docs/integrate/development/sdk/creating-an-app', '/docs/build/sdk'],
  ['/docs/integrate/agents/connect/raycast', '/docs/use/raycast'],
  ['/docs/integrate/agents/connect/:path*', '/docs/build/agents'],
  ['/docs/integrate/agents/mcp', '/docs/build/agents/mcp'],
  ['/docs/integrate/agents/skills', '/docs/build/agents/skills'],
  ['/docs/integrate/agents/:path*', '/docs/build/agents'],
  ['/docs/integrate/reference/event-catalog', '/docs/reference/events'],
  ['/docs/integrate/reference/:path*', '/docs/reference'],
  ['/docs/integrate/:path*', '/docs/build'],
  ['/docs/api', '/docs/reference/hub-rest'],
  // Architecture
  ['/docs/architecture/concepts/kind-and-facets', '/docs/build/concepts/kind-and-facets'],
  ['/docs/architecture/concepts/entity-connections', '/docs/build/concepts/entity-connections'],
  ['/docs/architecture/concepts/profile-schemas', '/docs/build/concepts/profile-schemas'],
  ['/docs/architecture/concepts/views', '/docs/build/concepts/views'],
  ['/docs/architecture/concepts/pod-replication', '/docs/build/concepts/pod-replication'],
  ['/docs/architecture/validation-policy', '/docs/build/concepts/validation-policy'],
  ['/docs/architecture/permission-model', '/docs/build/concepts/permission-model'],
  ['/docs/architecture/hub-protocol-flow', '/docs/build/concepts/hub-protocol-flow'],
  ['/docs/architecture/events/:path*', '/docs/reference/events'],
  ['/docs/architecture/deployment/data-pod/connect-control-plane', '/docs/run/connect-control-plane'],
  ['/docs/architecture/deployment/data-pod/tunnels-and-domains', '/docs/run/domains-and-tls'],
  ['/docs/architecture/deployment/:path*', '/docs/run'],
  ['/docs/architecture/:path*', '/docs/start/what-is-synap'],
  // Contributing
  ['/docs/contributing/documentation-guide', '/docs/community/docs-style-guide'],
  ['/docs/contributing/:path*', '/docs/community'],
  // Older flat URLs
  ['/docs/getting-started/:path*', '/docs/start'],
  ['/docs/concepts/:path*', '/docs/start/what-is-synap'],
  ['/docs/deployment/:path*', '/docs/run'],
  ['/docs/development/:path*', '/docs/build'],
  ['/docs/integrations/:path*', '/docs/build'],
  ['/docs/reference/api-reference', '/docs/reference/hub-rest'],
  ['/docs/open-source/:path*', '/docs/community'],
  ['/docs/overview/:path*', '/docs/start'],
  // The internal section was removed
  ['/team/:path*', '/docs/start'],
  ['/developers/:path*', '/docs/build'],
];

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  outputFileTracingRoot: __dirname,
  async redirects() {
    return [
      { source: '/docs', destination: '/docs/start', permanent: true },
      { source: '/team', destination: '/docs/start', permanent: true },
      { source: '/developers', destination: '/docs/build', permanent: true },
      ...moved.map(([source, destination]) => ({ source, destination, permanent: true })),
    ];
  },
};

const withMDX = createMDX();
export default withMDX(config);
