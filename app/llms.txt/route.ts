import { docsLlms, docsSource } from '@/lib/source';
import { siteUrl } from '@/lib/shared';
import retired from '@/scripts/retired-names.json';

export const revalidate = false;

/**
 * /llms.txt: a curated entry point for agents (https://llmstxt.org).
 * The hand-written part names the key pages and the interfaces to prefer; the section
 * index is generated from the page tree, and the "do not use" list from
 * scripts/retired-names.json, so neither can drift from the site.
 * Every fact here must already be on a reviewed page.
 */
const intro = `# Synap Documentation

> Synap is an open-source data pod: a server that holds a person's records and lets the AI agents they connect work
> on them. Agent writes go through the pod's governance, so most of them reach the data as proposals a person
> approves. These are the public docs for users, self-hosters, builders and contributors.

## How to read these docs

- Every page is also Markdown: add \`.md\` to its URL (${siteUrl}/docs/build/agents/mcp.md), or request the page
  with \`Accept: text/markdown\`. The Markdown is built from the same source as the HTML.
- [All hand-written pages in one file](${siteUrl}/llms-full.txt). The generated reference is not in it; it links
  to each reference page's Markdown.
- Docs MCP server: \`${siteUrl}/api/mcp\` (Streamable HTTP, no auth) with the tools \`list_pages\`, \`get_page\`
  (a page path, its \`.md\` URL or its full URL) and \`search\`. It serves these docs only; it is not a pod.
- Reference pages (CLI, MCP tools, events, Hub REST API) are generated from the source repositories. Prefer them
  over prose for names, flags and parameters.
- [Coding with agents](${siteUrl}/docs/build/coding-with-agents): how to point Claude Code, Cursor and other agents
  at these docs and at a pod.

## Key pages

- [What is Synap?](${siteUrl}/docs/start/what-is-synap): the model (pod, agents, proposals)
- [Cloud quickstart](${siteUrl}/docs/start/cloud-quickstart) and [self-host quickstart](${siteUrl}/docs/start/self-host-quickstart)
- [Build on your pod](${siteUrl}/docs/build): which door (SDK, Hub REST, MCP, webhooks) to use for what
- [Connect an agent](${siteUrl}/docs/build/agents) and [MCP](${siteUrl}/docs/build/agents/mcp)
- [API keys](${siteUrl}/docs/build/api-keys): scopes and grants
- [Glossary](${siteUrl}/docs/start/glossary)

## Preferred interfaces

- TypeScript and React apps that act as a signed-in person: \`@synap-core/sdk\` (typed tRPC client) and
  \`@synap-core/react\`. They authenticate with a sign-in session (cookie or session token), never an API key.
- Scripts, agents and integrations in any language, with an API key: the Hub REST API under \`/api/hub\` on the pod.
  Its OpenAPI description is served at \`/api/hub/openapi.json\`; \`@synap-core/hub-rest-client\` is a
  zero-dependency TypeScript client.
- AI clients: the pod's MCP endpoint at \`/mcp\`. Connect with \`npx @synap-core/cli init\` or
  \`synap connect <client>\`; do not hand-write MCP configuration.
- Being told about changes: webhooks, or \`@synap-core/sdk-realtime\`.
- Working with a pod through MCP: call \`synap_orient\` first in a session (the briefing), then \`synap_ask\` to
  recall anything from the pod in natural language.
- Writes: expect a proposal rather than an applied change. An agent's key can never approve a proposal.
- The CLI package is \`@synap-core/cli\` (command \`synap\`). Self-hosting starts from \`install.sh\` in the
  backend's GitHub releases.
`;

function doNotUse(): string {
  const lines = ['## Do not use', '', 'These names are retired or never existed. Use the replacement.', ''];
  for (const [name, to] of Object.entries(retired.extra)) lines.push(`- \`${name}\`: ${to}`);
  lines.push('', 'Package names retired by the 2026-10 frontend consolidation (old name: where the code lives now):', '');
  for (const [name, to] of Object.entries(retired.packages as Record<string, string[] | string>)) {
    lines.push(`- \`${name}\`: ${Array.isArray(to) ? to.join(', ') : to}`);
  }
  return lines.join('\n');
}

export async function GET() {
  const tree = docsSource.getPageTree();
  const sections = tree.children.map((node) => docsLlms.indexNode(node)).join('\n\n');
  const body = [intro, '## Sections', '', absolutize(sections), '', doNotUse(), ''].join('\n');
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}

/** The generated index links pages by path; llms.txt readers expect absolute URLs. */
function absolutize(markdown: string): string {
  return markdown.replace(/\]\((\/[^)]*)\)/g, (_m, path: string) => `](${siteUrl}${path})`);
}
