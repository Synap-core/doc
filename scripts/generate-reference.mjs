#!/usr/bin/env node
// Generates the reference pages from the JSON in content/reference-data/
// (copied from the source repositories by scripts/sync-reference.mjs):
//
//   content/docs/reference/cli.mdx          <- cli.json        (Synap-core/synap-cli)
//   content/docs/reference/mcp-tools.mdx    <- mcp-tools.json  (Synap-core/backend)
//   content/docs/reference/events.mdx       <- events.json     (Synap-core/backend)
//   content/docs/reference/hub-api/*.mdx    <- hub-openapi.json (Synap-core/backend), via fumadocs-openapi
//
// Each page starts with the hand-written text in scripts/reference-templates/<page>.md; edit that, never the
// generated .mdx. Run: npm run reference:generate   (--check: fail if the committed pages are out of date)
import fs from 'node:fs';
import path from 'node:path';
import { ROOT } from './lib.mjs';

const DATA = path.join(ROOT, 'content/reference-data');
const OUT = path.join(ROOT, 'content/docs/reference');
const TEMPLATES = path.join(ROOT, 'scripts/reference-templates');
const OWNER = 'Antoinesrvt';
const check = process.argv.includes('--check');

const read = (file) => JSON.parse(fs.readFileSync(path.join(DATA, file), 'utf8'));
const template = (name) => fs.readFileSync(path.join(TEMPLATES, `${name}.md`), 'utf8').trim();
const lock = read('sources.json');

// ─── MDX-safe text ──────────────────────────────────────────────────────────

/**
 * Text from the source repositories, made safe for MDX: code spans are kept as written; outside them the characters
 * MDX or Markdown would interpret ({ } < > [ ] * \ and a leading #) are escaped. In a table cell, `|` is escaped
 * everywhere and line breaks become spaces.
 */
function mdText(text, { cell = false } = {}) {
  if (text === undefined || text === null) return '';
  let s = String(text).trim();
  if (cell) s = s.replace(/\s*\n\s*/g, ' ');
  const out = [];
  const re = /(`+)([\s\S]*?[^`])\1(?!`)/g;
  let last = 0;
  let m;
  const escape = (chunk) =>
    chunk
      .replace(/\\/g, '\\\\')
      .replace(/[{}<>[\]*`]/g, (c) => `\\${c}`)
      .replace(/(^|\n)(\s*)#/g, '$1$2\\#')
      .replace(/(^|[\s(])_|_(?=[\s.,;:)]|$)/g, (x) => x.replace('_', '\\_'));
  while ((m = re.exec(s))) {
    out.push(escape(s.slice(last, m.index)));
    out.push(m[0]);
    last = m.index + m[0].length;
  }
  out.push(escape(s.slice(last)));
  let result = out.join('');
  if (cell) result = result.replace(/\|/g, '\\|');
  return result;
}

/** A multi-line description as Markdown paragraphs (each source line is its own paragraph). */
const mdParagraphs = (text) =>
  String(text ?? '')
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => mdText(line))
    .join('\n\n');

const code = (s) => {
  const str = String(s);
  const fence = str.includes('`') ? '``' : '`';
  return `${fence}${str.includes('`') ? ' ' : ''}${str}${str.includes('`') ? ' ' : ''}${fence}`;
};
const cellCode = (s) => code(s).replace(/\|/g, '\\|');

function generatedFrom(name) {
  const src = lock[name];
  return `${src.repo}@${src.commit.slice(0, 9)} (${src.ref})`;
}

function generatedLine(name, files) {
  const src = lock[name];
  const links = files
    .map((f) => `[\`${src.files[f].path}\`](https://github.com/${src.repo}/blob/${src.commit}/${src.files[f].path})`)
    .join(', ');
  return `Generated from [${src.repo}@${src.commit.slice(0, 9)}](https://github.com/${src.repo}/tree/${src.commit}) (\`${src.ref}\`): ${links}. Do not edit this page; see \`scripts/generate-reference.mjs\`.`;
}

function frontmatter(fields) {
  const lines = ['---'];
  for (const [k, v] of Object.entries(fields)) {
    if (v === undefined) continue;
    if (Array.isArray(v)) lines.push(`${k}: [${v.join(', ')}]`);
    else lines.push(`${k}: ${JSON.stringify(v)}`);
  }
  lines.push('---', '');
  return lines.join('\n');
}

const pageHead = (source, fields) =>
  frontmatter({
    ...fields,
    type: 'reference',
    audience: 'builder',
    status: 'current',
    owner: OWNER,
    generated_from: generatedFrom(source),
  });

// ─── CLI ────────────────────────────────────────────────────────────────────

function cliPage() {
  const cli = read('cli.json');
  const visible = (c) => !c.hidden;
  let shown = 0;
  let hiddenSkipped = 0;
  const countHidden = (c) => {
    hiddenSkipped++;
    (c.subcommands ?? []).forEach(countHidden);
  };

  function commandBlock(cmd, depth) {
    shown++;
    const lines = [];
    const hashes = '#'.repeat(depth);
    lines.push(`${hashes} ${cmd.path}`, '');
    if (cmd.description) lines.push(mdParagraphs(cmd.description), '');
    lines.push('```bash', `${cmd.path} ${cmd.usage}`.trim(), '```', '');
    if (cmd.aliases?.length) lines.push(`Aliases: ${cmd.aliases.map(code).join(', ')}`, '');
    const options = cmd.options.filter((o) => !o.hidden);
    if (options.length) {
      lines.push('| Option | Description |', '|---|---|');
      for (const o of options) {
        let desc = mdText(o.description, { cell: true });
        if (o.default !== undefined) desc += `${desc ? ' ' : ''}Default: ${cellCode(JSON.stringify(o.default))}.`;
        if (o.mandatory) desc += ' Required.';
        lines.push(`| ${cellCode(o.flags)} | ${desc} |`);
      }
      lines.push('');
    }
    if (cmd.helpAfter) lines.push('```text', cmd.helpAfter.replace(/```/g, "'''").trim(), '```', '');
    for (const sub of cmd.subcommands ?? []) {
      if (visible(sub)) lines.push(...commandBlock(sub, Math.min(depth + 1, 4)));
      else countHidden(sub);
    }
    return lines;
  }

  const body = [];
  const top = cli.program.subcommands;
  for (const cmd of top) {
    if (visible(cmd)) body.push(...commandBlock(cmd, 2));
    else countHidden(cmd);
  }

  const globalOptions = cli.program.options
    .filter((o) => !o.hidden)
    .map((o) => `| ${cellCode(o.flags)} | ${mdText(o.description, { cell: true })} |`);

  const head = pageHead('cli', {
    title: 'CLI',
    description: `Every command of ${cli.package}, generated from its command definitions.`,
    availability: ['cli'],
  });
  const text = [
    head,
    generatedLine('cli', ['cli.json']),
    '',
    template('cli'),
    '',
    '## Commands',
    '',
    `${shown} commands, grouped by top-level command. ${hiddenSkipped} hidden commands (internal or deprecated) are not listed.`,
    '',
    '| Global option | Description |',
    '|---|---|',
    ...globalOptions,
    '',
    ...body,
  ].join('\n');
  return { file: 'cli.mdx', text, stats: `${shown} commands (${hiddenSkipped} hidden excluded, of ${cli.commandCount})` };
}

// ─── MCP tools ──────────────────────────────────────────────────────────────

function mcpToolsPage() {
  const data = read('mcp-tools.json');
  const byName = new Map(data.tools.map((t) => [t.name, t]));
  const groups = [['entry', data.entryTools], ...Object.entries(data.groups)];
  const listed = new Set(groups.flatMap(([, names]) => names));
  const unlisted = data.tools.filter((t) => !listed.has(t.name)).map((t) => t.name);
  if (unlisted.length) throw new Error(`mcp-tools.json: tools in no group: ${unlisted.join(', ')}`);

  const toc = ['| Group | Tools |', '|---|---|'];
  const body = [];
  for (const [group, names] of groups) {
    toc.push(`| [${group}](#${group}) | ${names.length} |`);
    body.push(`## ${group}`, '');
    if (group === 'entry') body.push('Listed to every key.', '');
    else body.push(`Listed after \`synap_load_skill('tools:${group}')\`.`, '');
    for (const name of names) {
      const tool = byName.get(name);
      if (!tool) throw new Error(`mcp-tools.json: group ${group} names unknown tool ${name}`);
      body.push(`### ${tool.name}`, '');
      const facts = [];
      if (tool.title) facts.push(`**${mdText(tool.title)}**`);
      if (tool.annotations?.readOnlyHint) facts.push('Read-only');
      if (tool.annotations?.destructiveHint) facts.push('Destructive');
      if (facts.length) body.push(facts.join(' · '), '');
      body.push(mdParagraphs(tool.description), '');
      if (tool.parameters.length) {
        body.push('| Parameter | Type | Required | Description |', '|---|---|---|---|');
        for (const p of tool.parameters) {
          let desc = mdText(p.description, { cell: true });
          if (p.enum?.length) desc += `${desc ? ' ' : ''}One of: ${p.enum.map(cellCode).join(', ')}.`;
          body.push(`| ${code(p.name)} | ${cellCode(p.type)} | ${p.required ? 'yes' : ''} | ${desc} |`);
        }
        body.push('');
      } else {
        body.push('No parameters.', '');
      }
    }
  }

  const head = pageHead('backend', {
    title: 'MCP tools',
    description: 'Every tool a pod exposes over MCP, with its parameters, generated from the tool definitions.',
    availability: ['pod-oss', 'cloud'],
  });
  const text = [
    head,
    generatedLine('backend', ['mcp-tools.json']),
    '',
    template('mcp-tools'),
    '',
    `${data.tools.length} tools in ${groups.length} listing groups:`,
    '',
    ...toc,
    '',
    ...body,
  ].join('\n');
  return { file: 'mcp-tools.mdx', text, stats: `${data.tools.length} tools in ${groups.length} groups` };
}

// ─── Events ─────────────────────────────────────────────────────────────────

function eventsPage() {
  const data = read('events.json');
  const domains = new Map();
  for (const e of data.events) {
    if (!domains.has(e.domain)) domains.set(e.domain, []);
    domains.get(e.domain).push(e);
  }
  const body = ['## Catalog', ''];
  for (const [domain, events] of domains) {
    body.push(`### ${mdText(domain)}`, '', '| Event type | Name | Description | Filter keys |', '|---|---|---|---|');
    for (const e of events) {
      body.push(
        `| ${cellCode(e.type)} | ${mdText(e.label, { cell: true })} | ${mdText(e.description, { cell: true })} | ${(e.filterKeys ?? []).map(cellCode).join(', ')} |`,
      );
    }
    body.push('');
  }
  body.push(
    '## System events',
    '',
    'Internal events that are not automation triggers.',
    '',
    ...data.systemEvents.map((e) => `- ${code(e.type)}`),
    '',
  );
  const g = data.grammar;
  body.push(
    '## Naming grammar',
    '',
    `Event types follow ${code(g.pattern)}.`,
    '',
    `- Subjects (record changes): ${g.subjectTypes.map(code).join(', ')}`,
    `- Actions: ${g.actions.map(code).join(', ')}`,
    `- Phases: ${g.phases.map(code).join(', ')}`,
    `- Subjects whose action is a domain verb: ${g.domainVerbSubjectTypes.map(code).join(', ')}`,
    `- Connector and system families: ${g.connectorSubjectTypes.map(code).join(', ')}`,
    `- Message alias patterns: ${g.messageAliasPatterns.map(code).join(', ')}`,
    `- Observation namespaces: ${g.observationNamespaces.map(code).join(', ')}`,
    '',
  );
  const head = pageHead('backend', {
    title: 'Event catalog',
    description: 'The event types automations can trigger on and webhooks deliver, generated from the event definitions.',
    availability: ['pod-oss', 'cloud'],
  });
  const text = [
    head,
    generatedLine('backend', ['events.json']),
    '',
    template('events'),
    '',
    `${data.events.length} event types in ${domains.size} domains.`,
    '',
    ...body,
  ].join('\n');
  return { file: 'events.mdx', text, stats: `${data.events.length} events in ${domains.size} domains` };
}

// ─── Hub REST API (fumadocs-openapi) ────────────────────────────────────────

async function hubApiPages() {
  const { generateFilesOnly } = await import('fumadocs-openapi');
  const { createOpenAPI } = await import('fumadocs-openapi/server');
  const { splitByTag, slugifyTag, METHODS } = await import('../lib/hub-openapi-split.mjs');
  const spec = read('hub-openapi.json');
  const split = splitByTag(spec);
  const tags = new Map([...split].map(([tag, v]) => [tag, v.operations]));
  const bySchemaId = new Map([...split].map(([tag, v]) => [v.schemaId, { tag, ...v }]));
  const opCount = [...tags.values()].reduce((n, ops) => n + ops.length, 0);
  const uniqueOps = Object.values(spec.paths).reduce((n, item) => n + METHODS.filter((m) => item[m]).length, 0);

  // Same documents as lib/openapi.ts renders from: one per tag, one page per document.
  const openapi = createOpenAPI({
    input: Object.fromEntries([...bySchemaId].map(([id, v]) => [id, v.document])),
  });
  const files = await generateFilesOnly({
    input: openapi,
    per: 'file',
    name: (output) => bySchemaId.get(output.schemaId).slug,
    addGeneratedComment: false,
    frontmatter: (title) => {
      const ops = tags.get(title) ?? [];
      return {
        description: `The ${title} operations of the Hub REST API (${ops.length} ${ops.length === 1 ? 'operation' : 'operations'}).`,
        type: 'reference',
        audience: 'builder',
        availability: ['pod-oss', 'cloud'],
        status: 'current',
        owner: OWNER,
        generated_from: generatedFrom('backend'),
      };
    },
  });

  const out = files.map((f) => ({ file: `hub-api/${f.path}`, text: f.content }));
  const pages = files.map((f) => f.path.replace(/\.mdx$/, '')).sort();

  const omitted = spec['x-synap-generated']?.omittedOperations ?? [];
  const tagRows = [...tags.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([tag, ops]) => `| [${tag}](/docs/reference/hub-api/${slugifyTag(tag)}) | ${ops.length} |`);
  const index = [
    pageHead('backend', {
      title: 'Hub REST API',
      description: 'The pod\'s HTTP API for agents, scripts and integrations, rendered from its OpenAPI description.',
      availability: ['pod-oss', 'cloud'],
    }),
    generatedLine('backend', ['hub-openapi.json']),
    '',
    template('hub-api'),
    '',
    '## Operations by tag',
    '',
    `${uniqueOps} operations on ${Object.keys(spec.paths).length} paths, in ${tags.size} tags (an operation with two tags is listed under both, ${opCount} entries). Paths are relative to ${code(spec.servers?.[0]?.url ?? '/api/hub')}.`,
    '',
    '| Tag | Operations |',
    '|---|---|',
    ...tagRows,
    '',
  ];
  if (omitted.length) {
    index.push(
      '## Not in this description yet',
      '',
      'The pod serves these operations, but the generator could not describe them, so they are missing from the pages here and from `/api/hub/openapi.json`:',
      '',
      ...omitted.map((o) => `- ${code(`${o.method.toUpperCase()} ${o.path}`)}`),
      '',
    );
  }
  out.push({ file: 'hub-api/index.mdx', text: index.join('\n') });
  out.push({
    file: 'hub-api/meta.json',
    text:
      JSON.stringify(
        { title: 'Hub REST API', pages: ['index', ...pages.filter((p) => p !== 'index')] },
        null,
        2,
      ) + '\n',
  });
  return {
    files: out,
    stats: `${uniqueOps} operations, ${tags.size} tag pages${omitted.length ? `, ${omitted.length} omitted operations listed` : ''}`,
  };
}

// ─── write ──────────────────────────────────────────────────────────────────

const outputs = [cliPage(), mcpToolsPage(), eventsPage()];
const hub = await hubApiPages();
const all = [...outputs.map(({ file, text }) => ({ file, text })), ...hub.files];

const hubDir = path.join(OUT, 'hub-api');
const stale = fs.existsSync(hubDir)
  ? fs
      .readdirSync(hubDir)
      .map((f) => `hub-api/${f}`)
      .filter((f) => !all.some((o) => o.file === f))
  : [];

if (check) {
  const problems = [];
  for (const { file, text } of all) {
    const target = path.join(OUT, file);
    if (!fs.existsSync(target) || fs.readFileSync(target, 'utf8') !== text)
      problems.push(`content/docs/reference/${file} is out of date`);
  }
  for (const f of stale) problems.push(`content/docs/reference/${f} is no longer generated`);
  if (problems.length) {
    console.error(`✗ generated reference: ${problems.length} problem(s); run npm run reference:generate`);
    for (const p of problems) console.error(`  ${p}`);
    process.exit(1);
  }
  console.log('✓ generated reference pages are up to date');
} else {
  fs.mkdirSync(hubDir, { recursive: true });
  for (const f of stale) fs.rmSync(path.join(OUT, f));
  for (const { file, text } of all) fs.writeFileSync(path.join(OUT, file), text);
  for (const o of outputs) console.log(`✓ reference/${o.file}: ${o.stats}`);
  console.log(`✓ reference/hub-api: ${hub.stats}`);
}
