# CLAUDE.md

Guidance for Claude Code and any other coding agent working in this repository. `AGENTS.md` points here; keep one
source of truth.

## What this repository is

The **public** Synap documentation site (Synap-core/doc), built with Fumadocs 14 on Next.js 15. Everything here is
public: anyone can read the repository on GitHub.

| Knowledge | Where it goes |
|---|---|
| How to use, self-host, build on or contribute to Synap | Here, under `content/docs/` |
| Company plans, strategy, research, GTM, internal notes | Never here. They belong in the Synap pod. |
| How one repository's code works (architecture, invariants, decisions) | That repository's `docs/` folder, reviewed with its code |
| Reference that can be generated (CLI, MCP tools, REST API, events) | Generated from source; a hand page here only until then, marked `status: beta` |

Do not add an internal or sign-in-gated section.

## Structure

```
content/docs/
  start/       what Synap is, quickstarts, glossary
  use/         the apps (Browser, Relay, Raycast, Eve), Cloud vs self-hosted
  build/       SDK, API keys, webhooks, chat stream, agents (connect, MCP, skills), concepts
  run/         self-hosting: install, configuration, domains, backups, upgrades, operations
  reference/   CLI, events, Hub REST API, MCP tools
  community/   contributing, code of conduct, security, marketplace policy, docs style guide
app/           Next.js routes (home page, /docs, /api/search)
lib/           page-meta.ts (frontmatter vocabulary), source.ts, mdx-components.tsx
scripts/       the checks (check-*.mjs) and retired-names.json
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

The vocabulary lives in `lib/page-meta.ts`. `scripts/check-frontmatter.mjs` enforces it, and `npm run build` runs
that check first. `source.config.ts` declares the same schema for typing, but fumadocs-mdx 11.10.1 skips its
validation (see the comment there), so the script is what actually fails a bad page. Quote a description that
contains `: `.

## The verification rule

Every command, flag, port, path, environment variable, package name and count on a page must be checked against the
code (the backend, synap-cli and app repositories) before it is written. Wrong is worse than missing: if you cannot
verify something, leave it out or keep the page `status: beta` without `last_reviewed`. Never copy commands from
another document, including a repository's README, without checking them in the code. Cite your sources in the pull
request, not in the page.

Known traps: the CLI package is `@synap-core/cli`; the pod API listens on port 4000 behind Caddy; self-hosting uses
`install.sh` from the backend's GitHub releases; the backend `deploy/README.md` lists installer flags that do not
exist.

## Links

Link between pages with absolute paths (`/docs/run/backups`), never relative ones. Link to repositories, not to files
that may not exist yet.

## Commands

```bash
npm ci                # install (Node >= 22.18; the checks import lib/page-meta.ts directly)
npm run dev           # local site on http://localhost:3000
npm run check         # frontmatter, internal links + navigation, retired names
npm run build         # frontmatter check, then the production build
```

CI (`.github/workflows/docs-ci.yml`) runs the three checks and the build on every pull request and push to main.

`scripts/retired-names.json` vendors the retired package list from Synap-core/app-bases
(`scripts/architecture/removed-packages.json`); refresh it from there when it changes.

## Writing

Plain, specific prose. No marketing language, no emoji. Use the glossary's terms. The full guide is
`content/docs/community/docs-style-guide.mdx`.
