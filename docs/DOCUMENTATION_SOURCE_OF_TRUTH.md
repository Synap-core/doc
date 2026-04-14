# Documentation: single source of truth (audit)

**Canonical site:** `synap-team-docs` → `content/docs/` (public) + `content/team/` (internal).  
**Goal:** treat that app as the only maintained documentation surface; retire parallel markdown trees once verified.

---

## 1. Do not delete (by policy)

These are not “documentation website” substitutes — keep in each repo:

| Kind | Examples |
|------|-----------|
| Package entrypoints | `README.md`, `CHANGELOG.md` at repo / package roots |
| AI / editor rules | `CLAUDE.md`, `.cursorrules`, `AI_HANDOFF_PROMPT.md` |
| In-product technical spec | `synap-app/.../EXTENSION.md` (Chrome extension) |
| Third-party | `node_modules/**`, licenses inside deps |
| Legal | `LICENSE` |

---

## 2. Safe to remove after a quick glance (ephemeral / journal)

**Status:** Root ephemerals + `hestia-cli/` journal markdown **removed** (2026-04-13). Remaining optional root file: `RELEASE_NOTES_v1.0.md` (keep or fold into changelog / release notes when convenient).

Previously removed at **monorepo root** (`synap/`):

- ~~`TYPE_FIX_SUMMARY.md`~~
- ~~`FEED-TYPE-SYNC-IMPLEMENTATION.md`~~
- ~~`FEED-TYPE-SYNC-SUMMARY.md`~~
- ~~`analyze-usb-generate.md`~~
- ~~`VERIFICATION-REPORT.md`~~

**`hestia-cli/`** (monorepo folder; product name **Eve**) — journal `.md` at package root **removed**; **`README.md`**, **`CHANGELOG.md`**, **`docs/`**, and **`packages/*/README.md`** kept. Team orientation: **`synap-team-docs/content/team/eve-cli/`** → route `/team/eve-cli`.

---

## 3. Whole trees: duplicate public docs — **verify then delete or archive**

### `users-docs/` (removed from monorepo 2026-04-14)

- **What it was:** Older public-style docs tree (`docs/getting-started`, `docs/concepts`, `docs/integrations`, …).
- **Overlap:** High — same IA exists under `synap-team-docs/content/docs/**` (and often same filenames: `installation.md`, `quickstart.md`, concepts, integrations, deployment, etc.).
- **Unique / risky:** Top-level design brainstorms (`AI_UX_*.md`, `PROPERTY_SYSTEM.md`, `OPENCLAW_*.md`, `SELF_HOSTING_GUIDE.md`, `RUNBOOK.md`, `CONTRIBUTING.md`, …) — **spot-check** for sentences not present in team-docs; if nothing unique → delete tree or replace with a **single `README.md`** pointing to the docs site.

**Parity snapshot (2026-04-14):**

- Legacy files scanned in `users-docs`: **124** markdown files (excluding `node_modules`).
- Filename-level parity in `synap-team-docs` (`content/docs` + `content/team`): **68 matched**, **56 unmatched**.
- Unmatched clusters:
  - **Architecture deep pages (12):** `architecture/core-patterns.md`, `architecture/event-flow.md`, `architecture/validation-policy.md`, `architecture/hub-protocol-flow.md`, `architecture/events/*`, etc.
  - **Agents section (5):** `agents/synap-ai.md`, `agents/openclaw.md`, `agents/channels-and-agents.md`, `agents/mcp.md`, `agents/skills.md`.
  - **Resources comparisons (4):** `resources/comparisons/vs-*.md`.
  - **Tutorials (2):** `tutorials/5-minute-demo.md`, `tutorials/build-knowledge-graph-view.md`.
  - **Getting started (1):** `getting-started/introduction.md`.
  - **Root legacy strategy/audit docs (28):** UX/GTM/design/implementation notes (likely team-only or archival).

**Recommendation (final merge plan):**  
1. **Public docs parity first** — migrate the unmatched `agents/*`, architecture deep pages, tutorials, comparisons, and `getting-started/introduction.md` into `content/docs/**` (or explicitly fold into existing pages with anchors).  
2. **Team vs archive split for root legacy files** — for the 28 root docs, either:
   - merge durable content into `content/team/**` pages (platform/devops/home/intelligence), or
   - move to `docs-internal/archive/` (or remove if obsolete).  
3. **Add redirects/pointers** — ensure any still-linked `users-docs` URLs point to new routes in `synap-team-docs`.  
4. **Delete `users-docs/docs/**` content** once parity checklist is complete; keep only a minimal `README.md` pointer (or remove repo/folder entirely).

**Public merge progress (2026-04-14, pass 1):**

- Added canonical consolidated pages in `synap-team-docs/content/docs/**`:
  - `integrate/agents/index.mdx`
  - `architecture/system-patterns.mdx`
  - `architecture/events/index.mdx`
  - `start/getting-started/introduction.md`
  - `start/tutorials/index.mdx`
  - `start/resources/comparisons.mdx`
- Wired these into docs navigation (`meta.json`) under **Use Synap**, **Build & integrate**, and **Architecture**.
- Remaining `users-docs` unmatched set is now primarily:
  - root-level legacy strategy/audit docs
  - detailed one-page-per-topic variants now intentionally represented by consolidated pages above
  - UX implementation journals that should migrate (if needed) to `content/team/**` or be archived.

**Public merge progress (2026-04-14, pass 2):**

- Added compatibility pages for legacy public routes/topics:
  - `integrate/agents/{synap-ai,openclaw,mcp,skills,channels-and-agents}`
  - `architecture/{core-patterns,event-flow,validation-policy,permission-model,hub-protocol-flow,ai-architecture}`
  - `architecture/events/{event-architecture,automation-system,event-metadata}`
  - `architecture/components/{data-pod,client-sdk}`
  - `architecture/security/data-confidentiality`
  - `start/tutorials/{5-minute-demo,build-knowledge-graph-view}`
  - `start/resources/{vs-notion,vs-obsidian,vs-saas,vs-opensource}`
- Updated all relevant `meta.json` files so pages are visible in the new IA.
- Legacy unmatched count (filename parity heuristic) reduced from **56 → 32**, and now consists almost entirely of root-level strategy/audit notes plus UX implementation journals.

### `docs-internal/`

- **What it is:** Internal product/engineering notes.
- **Overlap:** Many themes already have team pages, e.g.  
  - `AUTH-ARCHITECTURE.md` ↔ `content/team/platform/auth-architecture.mdx`  
  - `SIGNAL-FEED-ARCHITECTURE.md` ↔ `content/team/platform/signal-feed-architecture.mdx`  
  - `PROPERTY-DEF-SCOPING.md` ↔ `content/team/platform/property-def-scoping.mdx`  
  - `TEAMDOC_*` ↔ `teamdoc-guidelines.mdx` + refactor plans (may be historical only)  
  - Relay / browser / platform-review → multiple `content/team/**` pages  
- **Unique / verify:** `GITHUB-SECRETS.md`, `RUNBOOK.md`, `INFRASTRUCTURE-ARCHITECTURE.md`, `north-star/*`, `platform-review/*` — confirm each section exists in team-docs or CP runbooks; then **delete or zip archive** `docs-internal/`.

**Recommendation:** Use team-docs as master; keep `docs-internal` only until each file is either merged or explicitly marked obsolete.

---

## 4. Verify / port (technical depth not obviously on the site)

| Location | Why verify |
|----------|------------|
| `synap-backend/docs/**` | **Hub:** `docs/README.md` — what stays vs team docs. Operator feeds (**RSS-SETUP**, **FEED-API**), DeliveryService refs, and files wired by **`import-all.sh`** remain in-repo; one-off audits / duplicate strategy / **NEXT_STEPS** / **n8n_docker_setup** removed (2026-04-13). Prefer editing **`content/team/platform/*`** and **`content/team/devops/*`** for narrative; keep backend `.md` in sync until imports source from team MDX only. |
| `synap-backend/docs/development/*` | Overlaps `team/devops/*` — **frontend ↔ intelligence** guide moved to **`content/team/synap-app/frontend-intelligence-integration.mdx`**. |
| `relay-app/FEED_UI_IMPLEMENTATION.md` | Check vs `content/team/relay/*`. |
| `synap-app/.../EXTENSION.md` | **Keep** in repo; optionally add a short **public doc** page that links to this file for contributors. |
| `synap-backend/packages/feed-service/README.md` | Keep short package README; deep ops in team-docs or `synap-backend/docs`. |

---

## 5. Already aligned (reference only)

- **`synap-team-docs/content/docs/*`** — public journeys (Use Synap, Integrate, Architecture, Contributing, Cloud).  
- **`synap-team-docs/content/team/*`** — internal runbooks and product notes.  
- **`synap-team-docs/docs/THEME_AND_TAILWIND.md`** — tooling note for this app.

**Consolidated away from app repos (2026-04-13):**

| Removed / relocated | Now |
|---------------------|-----|
| `browser/doc/`, `browser/docs/`, `browser/electron/renderer/docs/` | **`content/team/browser/index.mdx`** (product, flows, architecture, ops) |
| `synap-control-plane-api/docs/*.md` (except `docs/README.md` pointer) | **`content/team/control-plane/*.mdx`** |
| `synap-intelligence-service/docs/*.md` (except `docs/README.md` pointer) | **`content/team/intelligence/*.mdx`** + repo-root `ARCHITECTURE.md` / `deploy/*` |
| `synap-intelligence-service/apps/monitor/src/docs/` | **`apps/monitor/src/inline-help/*.md`** (bundled monitor copy, not “docs site”) |
| `synap-backend/docs/` (partial, 2026-04-13) | **`docs/README.md`** hub; platform/devops/control-plane **markdown sources removed** after parity with **`content/team/**`**; keep **RSS**, **FEED**, **DeliveryService**, **n8n** |
| `synap-app/docs/` (2026-04-13) | **87 audit `.md` deleted**; pointer **`synap-app/docs/README.md`** → **[`/team/synap-packages`](/team/synap-packages)** |

---

## 6. Suggested completion order

1. ~~Delete root ephemeral files (section 2).~~ **Done.**  
2. ~~Prune `hestia-cli` journal markdown (keep README / CHANGELOG / `docs/` as needed).~~ **Done.**  
3. ~~**users-docs:**~~ **Removed** from the `synap/` workspace copy — canonical content lives in **`synap-team-docs`**. The GitHub repo **`Synap-core/doc`** was **force-pushed** with a clean history (no tracked `.next` / `node_modules`) to match this app.  
4. **docs-internal:** file-by-file vs `content/team/**` → merge gaps → remove or archive; **README** at folder root points to team-docs.  
5. **synap-backend/docs:** ~~add hub + trim ephemerals~~ **Partial (2026-04-13)** — next: migrate remaining `import-all.sh` sources to team MDX-only, then drop duplicate `.md` from backend.

---

## 7. Single source of truth (rule)

| Audience | Where to edit |
|----------|----------------|
| Public product & developer docs | `synap-team-docs/content/docs/` |
| Internal team / platform | `synap-team-docs/content/team/` |
| Package consumers | Minimal `README.md` + link to docs site |
| AI / workflow | Keep `CLAUDE.md` / rules in repos as today |

*Generated as a consolidation audit; update this file as trees are removed.*

---

## 8. GitHub push failures (HTTP 400 on `git push`)

If `git push` fails with **`RPC failed; HTTP 400`** while uploading **hundreds of MiB**, the pack almost always contains **build artifacts** that were accidentally committed (for example `.next/cache/**` webpack packs, `node_modules/**`).

**Fix applied for `Synap-core/doc` (2026-04-14):**

1. Ensure `.gitignore` excludes `.next/`, `node_modules/`, `*.tsbuildinfo`, archives (`*.tar.gz`).
2. Replace history with a **clean root commit** (orphan branch + single commit) so unreachable blobs are dropped.
3. Run `git reflog expire --expire=now --all` then `git gc --prune=now --aggressive`.
4. `git push --force origin main` — pack should be **~1 MiB** for docs-only trees.

Optional: `git config http.postBuffer 524288000` helps some proxies, but it does **not** fix committed multi-hundred-MiB blobs.

---

## 9. Vercel deployment (“No Output Directory named `build`”)

This app is **Next.js** (`next build` → `.next/`, not a `build/` folder). If the Vercel project still has **Output Directory = `build`** from the old Docusaurus site, the deploy fails after a successful build.

**Fix (do both):**

1. **Project → Settings → General → Build & Development Settings**  
   - **Framework Preset:** Next.js  
   - **Output Directory:** leave **empty** (remove `build`). Vercel must not look for a static `build` folder.
2. **Root Directory:** if the Git repo is only this app, leave empty; if the repo is a monorepo, set it to the folder that contains `package.json` (e.g. `synap-team-docs`).

The repo includes `vercel.json` with `"framework": "nextjs"` so new projects detect Next.js correctly; an **existing** project may still need the dashboard Output Directory cleared once.
