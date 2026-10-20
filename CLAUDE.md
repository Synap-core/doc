# CLAUDE.md

Guidance for Claude Code and any other coding agent working in this repository. `AGENTS.md` points here; keep one
source of truth.

## What this repository is

The **public** Synap documentation site (Synap-core/doc), built with Fumadocs 16 (fumadocs-mdx 15) on Next.js 16 and
Tailwind CSS 4. Everything here is public: anyone can read the repository on GitHub.

| Knowledge | Where it goes |
|---|---|
| How to use, self-host, build on or contribute to Synap | Here, under `content/docs/` |
| Company plans, strategy, research, GTM, internal notes | Never here. They belong in the Synap pod. |
| How one repository's code works (architecture, invariants, decisions) | That repository's `docs/` folder, reviewed with its code |
| Reference that can be generated (CLI, MCP tools, REST API, events) | Generated from the source repositories (see "Generated reference"); never by hand |

Do not add an internal or sign-in-gated section.

## Structure

```
content/docs/
  start/       what Synap is, quickstarts, glossary
  use/         the apps (Browser, Relay, Raycast, Eve), Cloud vs self-hosted
  build/       SDK, API keys, webhooks, chat stream, agents (connect, MCP, skills), concepts
  run/         self-hosting: install, configuration, domains, backups, upgrades, operations
  reference/   CLI, MCP tools, events, Hub REST API (generated, except index.mdx)
  community/   contributing, code of conduct, security, marketplace policy, docs style guide
content/reference-data/   JSON copied from the source repositories (scripts/sync-reference.mjs)
app/           Next.js routes: home, /docs, /api/search, /api/mcp, /llms.txt, /llms-full.txt, /llms.mdx (Markdown)
proxy.ts       /docs/<page>.md and `Accept: text/markdown` -> the Markdown route
lib/           page-meta.ts (frontmatter vocabulary), source.ts, markdown.ts, openapi.ts, mdx-components.tsx
scripts/       the checks (check-*.mjs), sync/generate-reference.mjs, reference-templates/, retired-names.json
docs/          notes for people working on this site (not published)
```

Each folder has a `meta.json` whose `pages` list sets the navigation. A page not listed there fails `npm run check`.

## Frontmatter (required on every page)

```yaml
title: …
description: One sentence.
type: tutorial | how-to | reference | explanation
audience: user | self-host | builder | contributor
availability: [pod-oss, cloud, browser, relay, raycast, eve, cli, sdk]   # one or more
status: current | beta | deprecated
owner: Antoinesrvt                 # GitHub handle
last_reviewed: YYYY-MM-DD          # ONLY if you verified the page against the code that day
```

The vocabulary lives in `lib/page-meta.ts`. `source.config.ts` turns it into a strict schema that fumadocs-mdx
applies to every page when it compiles it, so `npm run build` and `npm run dev` fail on a bad or unknown value.
`scripts/check-frontmatter.mjs` checks the same rules without a build (CI runs it first) and adds the six-month
`last_reviewed` limit. Quote a description that contains `: `.

## The verification rule

Every command, flag, port, path, environment variable, package name and count on a page must be checked against the
code (the backend, synap-cli and app repositories) before it is written. Wrong is worse than missing: if you cannot
verify something, leave it out or keep the page `status: beta` without `last_reviewed`. Never copy commands from
another document, including a repository's README, without checking them in the code. Cite your sources in the pull
request, not in the page.

Known traps: the CLI package is `@synap-core/cli`; the pod API listens on port 4000 behind Caddy; self-hosting uses
`install.sh` from the backend's GitHub releases; the backend `deploy/README.md` lists installer flags that do not
exist.

## Generated reference

`content/docs/reference/{cli,mcp-tools,events}.mdx` and `content/docs/reference/hub-api/` are generated. Do not edit
them: edit the intro text in `scripts/reference-templates/<page>.md`, or fix the data at its source.

| Page | Source repository | File |
|---|---|---|
| CLI | Synap-core/synap-cli | `docs/reference/cli.json` |
| MCP tools | Synap-core/backend | `docs/reference/mcp-tools.json` |
| Events | Synap-core/backend | `docs/reference/events.json` |
| Hub REST API | Synap-core/backend | `docs/reference/hub-openapi.json` (rendered with fumadocs-openapi, one page per tag) |

```bash
npm run reference:sync           # copy the JSON from GitHub at each repo's main (SYNAP_CLI_REF / SYNAP_BACKEND_REF
                                 # pick another branch, tag or commit; `-- --from local` reads ../synap-cli and
                                 # ../synap-backend instead)
npm run reference:generate       # rebuild the pages from content/reference-data/
```

Commit both the JSON and the pages. `content/reference-data/sources.json` records the repository, ref and commit each
file came from. CI checks that the data matches those commits (`npm run reference:check`) and that the pages match
the data (`npm run check:generated`); a weekly workflow (`reference-drift.yml`) reports when a source ref has moved.

## Markdown for agents

Every page is served as Markdown from the same compiled MDX: `/docs/<page>.md`, or `/docs/<page>` with
`Accept: text/markdown` (proxy.ts). `/llms.txt` is curated in `app/llms.txt/route.ts` (keep it short and verified;
its section index and "do not use" list are generated). `/llms-full.txt` has every page, and `/api/mcp` is a docs MCP
server (list_pages, get_page, search). `npm run check:markdown` checks all of it against a build.

Next.js drops `Vary` on App Router page responses, so the HTML answer at `/docs/<page>` goes out without
`Vary: Accept` (the Markdown answer has it). If a shared cache sits in front of the site, configure it to vary
`/docs/*` on `Accept`.

## Links

Link between pages with absolute paths (`/docs/run/backups`), never relative ones. Link to repositories, not to files
that may not exist yet.

## Commands

```bash
npm ci                # install (Node >= 22.18; the checks import lib/page-meta.ts directly)
npm run dev           # local site on http://localhost:3000
npm run check         # frontmatter, internal links + navigation, retired names, generated pages up to date
npm run build         # production build (fails on invalid frontmatter)
npm run check:markdown  # after a build: every page's Markdown, llms.txt, llms-full.txt
npm run reference:check # content/reference-data matches its source commits (network)
```

CI (`.github/workflows/docs-ci.yml`) runs all of them on every pull request and push to main.

`scripts/retired-names.json` vendors the retired package list from Synap-core/app-bases
(`scripts/architecture/removed-packages.json`); refresh it from there when it changes.

## Writing

Plain, specific prose. No marketing language, no emoji. Use the glossary's terms. The full guide is
`content/docs/community/docs-style-guide.mdx`.
