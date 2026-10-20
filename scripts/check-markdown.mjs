#!/usr/bin/env node
// Drift guard for the Markdown form of the docs (what agents read). Against a built site, for every page:
//  - /docs/<page>.md answers 200 as text/markdown, starts with "# <title>" and has a body;
//  - every ## / ### heading of the page's source appears in that Markdown (a page cannot silently lose content);
//    for a generated Hub REST API page, every operation it renders appears as "## METHOD /path";
//  - /docs/<page> with `Accept: text/markdown` returns the same Markdown, with `Vary: Accept`.
// And /llms.txt links every page; /llms-full.txt contains every hand-written page and links (does not inline) every
// generated reference page; the docs MCP server's get_page finds a page by its path, its .md URL and its full URL.
//
// Run after `npm run build`: npm run check:markdown
// It starts `next start` on a free port, or uses DOCS_BASE_URL when set (e.g. a preview deployment).
import { spawn } from 'node:child_process';
import net from 'node:net';
import path from 'node:path';
import { ROOT, listPages, readPage, pageUrl, stripCode, rel, report } from './lib.mjs';

async function freePort() {
  return new Promise((resolve) => {
    const srv = net.createServer();
    srv.listen(0, () => {
      const { port } = srv.address();
      srv.close(() => resolve(port));
    });
  });
}

async function startServer() {
  if (process.env.DOCS_BASE_URL) return { base: process.env.DOCS_BASE_URL.replace(/\/$/, ''), stop() {} };
  const port = await freePort();
  const child = spawn(process.execPath, [path.join(ROOT, 'node_modules/next/dist/bin/next'), 'start', '-p', String(port)], {
    cwd: ROOT,
    stdio: ['ignore', 'ignore', 'inherit'],
    env: { ...process.env, NEXT_TELEMETRY_DISABLED: '1' },
  });
  const base = `http://127.0.0.1:${port}`;
  for (let i = 0; i < 120; i++) {
    try {
      const res = await fetch(`${base}/llms.txt`);
      if (res.ok) return { base, stop: () => child.kill() };
    } catch {}
    if (child.exitCode !== null) break;
    await new Promise((r) => setTimeout(r, 500));
  }
  child.kill();
  throw new Error('next start did not come up; run `npm run build` first');
}

/** Heading lines (## and ###) of a page's source, outside code blocks. */
function sourceHeadings(body) {
  // stripCode keeps line lengths, so its lines say which raw lines are headings outside code blocks.
  const raw = body.split('\n');
  return stripCode(body)
    .split('\n')
    .map((line, i) => (/^#{2,3}\s+\S/.test(line) ? raw[i].trim() : null))
    .filter(Boolean);
}

/** Call a tool on the docs MCP server (stateless Streamable HTTP; the answer is JSON or one SSE event). */
async function callMcpTool(base, name, args) {
  const res = await fetch(`${base}/api/mcp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json, text/event-stream' },
    body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'tools/call', params: { name, arguments: args } }),
  });
  const raw = await res.text();
  const json = raw.trimStart().startsWith('{')
    ? raw
    : raw
        .split('\n')
        .filter((line) => line.startsWith('data:'))
        .map((line) => line.slice(5).trim())
        .pop();
  const message = JSON.parse(json ?? '{}');
  if (message.error) throw new Error(`${name}: ${message.error.message}`);
  return { isError: Boolean(message.result?.isError), text: message.result?.content?.[0]?.text ?? '' };
}

/** Operations a generated <OpenAPIPage /> page renders. */
function openapiOperations(body) {
  const m = body.match(/operations=\{(\[[\s\S]*?\])\}/);
  return m ? JSON.parse(m[1]).map((o) => `## ${o.method.toUpperCase()} ${o.path}`) : [];
}

const server = await startServer();
const problems = [];
try {
  const pages = listPages();
  const urls = [];
  const written = [];
  const generated = [];
  for (const file of pages) {
    const where = rel(file);
    const { frontmatter, body } = readPage(file);
    const url = pageUrl(file);
    urls.push(url);
    (frontmatter.generated_from ? generated : written).push({ url, title: frontmatter.title });

    const res = await fetch(`${server.base}${url}.md`);
    const md = await res.text();
    if (res.status !== 200) {
      problems.push(`${where}: ${url}.md answered ${res.status}`);
      continue;
    }
    if (!(res.headers.get('content-type') ?? '').startsWith('text/markdown'))
      problems.push(`${where}: ${url}.md is ${res.headers.get('content-type')}, not text/markdown`);
    if (!md.startsWith(`# ${frontmatter.title}\n`)) problems.push(`${where}: ${url}.md does not start with "# ${frontmatter.title}"`);

    // The body: everything after the header block (title, description, the facts line).
    const content = md.split('\n').slice(5).join('\n').trim();
    if (content.length < 40) problems.push(`${where}: ${url}.md has no content after its header`);

    const expected = frontmatter._openapi ? openapiOperations(body) : sourceHeadings(body);
    const lines = new Set(md.split('\n').map((l) => l.trim()));
    const missing = expected.filter((h) => !lines.has(h));
    if (missing.length)
      problems.push(`${where}: ${url}.md is missing ${missing.length} heading(s), e.g. "${missing.slice(0, 3).join('", "')}"`);

    const negotiated = await fetch(`${server.base}${url}`, { headers: { Accept: 'text/markdown' } });
    if (!(negotiated.headers.get('content-type') ?? '').startsWith('text/markdown'))
      problems.push(`${where}: ${url} with Accept: text/markdown did not return Markdown`);
    else if ((await negotiated.text()) !== md) problems.push(`${where}: ${url} with Accept: text/markdown differs from ${url}.md`);
    if (!/(^|,\s*)accept(\s*,|$)/i.test(negotiated.headers.get('vary') ?? ''))
      problems.push(`${where}: ${url} with Accept: text/markdown has no "Vary: Accept"`);
  }

  const llms = await (await fetch(`${server.base}/llms.txt`)).text();
  for (const url of urls) if (!llms.includes(`${url})`)) problems.push(`/llms.txt: no link to ${url}`);
  const full = await (await fetch(`${server.base}/llms-full.txt`)).text();
  for (const { title } of written) if (!full.includes(`# ${title}\n`)) problems.push(`/llms-full.txt: no page titled "${title}"`);
  for (const { url } of generated) {
    if (!full.includes(`${url}.md)`)) problems.push(`/llms-full.txt: no link to the generated page ${url}.md`);
    if (full.includes(`${url} · Generated from`)) problems.push(`/llms-full.txt: inlines the generated page ${url}`);
  }

  // get_page must accept every way an agent writes a page reference.
  const sample = written.find((p) => p.url === '/docs/run/backups') ?? written[0];
  const forms = [sample.url, `${sample.url}.md`, `https://docs.synap.live${sample.url}`, `https://docs.synap.live${sample.url}.md#x`];
  for (const form of forms) {
    try {
      const { isError, text } = await callMcpTool(server.base, 'get_page', { url: form });
      if (isError || !text.startsWith(`# ${sample.title}\n`)) problems.push(`/api/mcp get_page("${form}"): ${text.slice(0, 80)}`);
    } catch (err) {
      problems.push(`/api/mcp get_page("${form}"): ${err.message}`);
    }
  }
  try {
    const missing = await callMcpTool(server.base, 'get_page', { url: '/docs/no-such-page' });
    if (!missing.isError) problems.push('/api/mcp get_page("/docs/no-such-page") did not answer an error');
  } catch (err) {
    problems.push(`/api/mcp get_page("/docs/no-such-page"): ${err.message}`);
  }
  console.log(`  checked ${pages.length} pages against ${server.base}`);
} finally {
  server.stop();
}

process.exit(report('markdown pages, llms.txt, llms-full.txt', problems));
