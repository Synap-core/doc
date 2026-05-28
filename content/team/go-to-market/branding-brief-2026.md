# Synap — Branding & Landing Page Brief (May 2026)

> **Purpose:** Comprehensive brief for a branding specialist or AI to redesign the `synap-landing` homepage. Covers product truth, target audiences, tone, feature hierarchy, and what the current page gets wrong.

---

## 0. The One Sentence (Internal North Star)

> **Every application is a configuration. AI writes the config.**

This is the technical north star. The landing page does not need to say this verbatim — but every word on the page must be defensible from this foundation.

---

## 1. What Synap Actually Is

Synap is an **AI operating system for knowledge work**. Not a note-taking app. Not a chatbot. Not a no-code builder. An OS.

The OS metaphor is load-bearing, not decorative:

| OS concept | Synap equivalent |
|-----------|-----------------|
| Kernel | Data Pod — PostgreSQL + event log + permissions |
| Desktop / shell | Browser app (Electron) — the primary product surface |
| File system | Entity graph — every piece of data is a typed entity |
| Apps | Views, channels, workspace templates |
| Package manager | Template engine — install a full CRM or second brain from one JSON config |
| Processes | AI agents running in the Intelligence Hub |
| Authorization layer | Proposal system — AI must request permission before mutating data |

### The Product Triptych (three composable concepts)

```
  Entities          Views           Channels
┌───────────┐    ┌───────────┐    ┌───────────┐
│  The data │    │  The lens │    │  The      │
│  Typed,   │◄───│  Any view │    │  voice    │
│  related, │    │  on the   │◄───│  AI +     │
│  governed │    │  graph    │    │  human    │
└───────────┘    └───────────┘    └───────────┘
```

**Entities** — The data layer. Every task, contact, note, deal, event, idea is an entity in one shared graph. Typed by profiles (configurable schemas), related by edges (auto-detected by AI), stored in PostgreSQL. One model for everything you know.

**Views** — The lens layer. The same data, seen any way you need: table, kanban, calendar, graph, bento dashboard, timeline. Switch views without moving data. Embed views inside views. Workspace overlays let each workspace customize its own lens on shared data.

**Channels** — The interaction layer. Where humans and AI work together through the entity graph. AI threads, branched conversations, inline entity comments, external relay (Telegram, Slack), agent-to-agent communication. Every channel knows what entities it's about.

### The 4 Architectural Pillars

1. **Config-over-Code** — Entity profiles → new data type. Cell types → new UI. Typed views → new layout. Workspace templates → new app. No code changes.
2. **AI-Native Infrastructure** — Hub Protocol (`/api/hub/*`) is AI's universal write surface. OrchestratorAgent + PersonaAgent. Proactive intelligence (cron workers, morning briefing). AI can build UI through proposals.
3. **Security & Auth** — Zero-trust at every layer. Ory Kratos sessions. Drizzle ORM (no raw SQL). Migrations fail loud. Zod validation on all inputs.
4. **Predictability & Governance** — Every mutation auditable, reversible, permissioned. 13-typed event chain = audit trail. Proposals = reviewable AI mutations. RBAC + per-workspace overrides.

### The Deployment Model

Synap is **open source** at the core. Always free to self-host.

| Path | Description | Price |
|------|-------------|-------|
| Self-hosted | `docker-compose up` — your PostgreSQL, your server, your rules | Free |
| Managed cloud | Synap provisions and operates your pod (EU or US) | $12–79/mo |

This distinction is critical for the landing page: the backend is not a SaaS product. It's open infrastructure. The value proposition of the managed tier is **zero ops**, not feature gating.

### The Primary App Surface

The **Electron desktop app** (`browser/`) is the PRIMARY product surface. The web app (`synap-app`) is for standalone tools (CRM, Studio). The landing page should position the desktop app, not a generic "web dashboard."

The Browser V2 vision: a **spatial shell** — "a calm sea with useful islands." Opened things become surfaces. The shell places them. AI works beside the user without owning the screen.

---

## 2. Target Audiences (in priority order)

### Audience 1: Developers & AI builders (primary acquisition)
- **Who:** OpenClaw/Claude Code/Cursor users, AI engineers, people building with LLMs
- **Pain:** AI agents have no structured memory. MEMORY.md gets compacted. Every API call dumps the full history. No governance. No audit trail.
- **Entry point:** `npx @synap/cli init` · ClawHub skill · GitHub
- **Message:** "Your agent needs a knowledge graph, not a text file. One command. Persistent, typed, governed."
- **North star moment:** Agent queries Synap → gets structured relational results instead of a grep over a markdown file.

### Audience 2: Power users & knowledge workers (upsell target)
- **Who:** People who use Notion, Obsidian, Roam — but feel like the librarian
- **Pain:** Scattered data across 8+ apps, none connected. AI that forgets between sessions. No structure without manual effort.
- **Entry point:** Landing page · "Try free 7 days" · Desktop app download
- **Message:** "Everything you know, in one open graph. AI organizes it. You own the data."
- **North star moment:** Capture a voice note → AI creates typed entity → appears in correct view → linked to existing context.

### Audience 3: Teams & small companies
- **Who:** Small teams, startups, consultancies needing CRM + project management + knowledge base
- **Pain:** Multiple SaaS subscriptions, no shared data layer, AI adds-ons with no shared understanding
- **Entry point:** Direct, referral, `/for/teams`
- **Message:** "One workspace OS for your whole team. All data connected. AI with governance your team can audit."
- **Differentiator:** EU data sovereignty, GDPR-ready, self-hostable for compliance-sensitive sectors.

### Audience 4: French / EU market
- **Who:** French tech community, European enterprises, GDPR-sensitive sectors
- **Pain:** Data sovereignty is a legal requirement, not a preference
- **Entry point:** LinkedIn, conferences, French tech communities
- **Message:** "Souveraineté numérique. Open source. Hébergé chez vous ou chez nous en France."

---

## 3. What Synap Is NOT (avoid these framings)

| Wrong framing | Why it's wrong |
|--------------|----------------|
| "Note-taking app" | That's Notion/Obsidian. Synap is infrastructure, not a single-purpose tool. |
| "AI chatbot" | Channels are data-aware interaction, not general assistants. |
| "No-code builder" | Config-over-code is an implementation detail, not a product position. |
| "Automation platform" | Proposals are the unit of AI action, not n8n-style triggers. |
| "Sign up and get a full app" | The backend is open source. The value is the OS + governance layer, not a pre-built SaaS. |
| "Second brain" | Accurate but commoditized. Every PKM tool says this. Lead with the OS/infrastructure angle. |
| "Productivity tool" | Too generic. Undermines the infrastructure positioning. |

---

## 4. Voice & Tone

### Personality
- **Precise, not breathless.** Technical claims, not buzzwords. "Entity graph with typed relationships" beats "revolutionary knowledge management."
- **Confident, not loud.** The architecture speaks for itself. No superlatives.
- **Warm, not clinical.** The Deep Focus design philosophy: warm amber palette, Fraunces headings, DM Sans body. The writing tone matches: intelligent but human.
- **Open, not corporate.** Open source is a core value, not a marketing claim. Be honest about what's free, what's paid, what's not built yet.

### Headline formula
Lead with the architectural truth, not the use case.
- ✓ "The workspace OS where AI proposes before it acts."
- ✓ "One entity graph. Any view. Any AI."
- ✗ "Your AI-powered second brain"
- ✗ "The future of knowledge management"

### Copy rules
1. Never say "revolutionary" or "powerful" — describe the mechanism instead.
2. Every feature claim must be traceable to a shipped technical primitive.
3. "Sovereign" is accurate and resonant — use it (data sovereignty, not political sovereignty).
4. "Open source" is not a footnote — it's a trust signal. Surface it early.
5. The proposal system is the differentiator nobody else has — name it explicitly.

---

## 5. Feature Hierarchy for the Landing Page

### Tier 1 — What to lead with (hook)
These are the differentiators. Nothing like this exists elsewhere.

| Feature | One-liner |
|---------|-----------|
| Entity graph | "Everything in one typed graph. AI understands relationships, not just text." |
| Proposal system | "AI proposes. You approve. Every decision is logged. No surprise overwrites." |
| Open + self-hostable | "Your PostgreSQL. Our UI. Or fully self-hosted. No lock-in at any layer." |

### Tier 2 — What to show (demonstrate)
These make the hook concrete and credible.

| Feature | How to demonstrate |
|---------|-------------------|
| Views | Show same data in table → kanban → bento without touching the data |
| Workspace templates | "Install a CRM in one click" — show the template picker |
| Desktop app (Browser V2) | Show the spatial shell — calm, premium, not a grid of settings panels |
| Hub Protocol | Show `npx @synap/cli init` for developer credibility |

### Tier 3 — What to reference (depth for interested visitors)
These belong in `/product/*` pages, not the homepage.

- Intelligence service (four-tier model routing, 90% token savings)
- Event chain (immutable audit trail)
- Pod stack (PostgreSQL + pgvector + Typesense + MinIO)
- Connectors (Nango, Google Calendar, GitHub)
- MCP server/client integration
- OpenClaw-specific comparison

---

## 6. What's Wrong With the Current Landing Page

### Problem 1: Split identity
The hero has TWO CTAs for TWO audiences: `npx @synap/cli init` (developers) and "Try free 7 days" (PKM users). This kills conversion. A visitor doesn't know who the product is for. **One primary CTA. One message.**

### Problem 2: Wrong headline
"Capture once. Remember/Find/Use forever." → Notion and Obsidian territory. This positions Synap as a personal note-taking tool with AI features. The actual product is an OS-level infrastructure platform. The headline undersells by about 10x.

### Problem 3: 11 sections, no hierarchy
Current order: Hero → Problem → OpenClaw → Surfaces → Intelligence → Infrastructure → Ecosystem → Shift → Comparison → Pricing → Final CTA.

The problem section leads with personal knowledge management pain (browser tabs, scattered notes). The OpenClaw section is a deep-dive on agent memory that belongs on `/developers`, not the homepage. The infrastructure section (sovereignty/your own pod) is buried at section 6.

### Problem 4: The desktop app is invisible
The PRIMARY product surface — the Electron browser app with spatial shell — is not showcased. The "surfaces" section shows generic screenshots, not the actual product experience.

### Problem 5: Framing is PKM-first, infrastructure-second
The strategy doc is explicit: "the visual layer IS the product for 90% of future users. But the infrastructure layer is what makes it defensible." The current landing inverts this — it's infrastructure-last.

### Problem 6: Missing the governance story
The proposal system (AI proposes → human approves → immutable log) is Synap's most distinctive and defensible feature. It appears once, in section 5 ("SectionIntelligence"), as one step in a four-step pipeline. It should be a featured differentiator.

---

## 7. Proposed Landing Page Structure

**Goal:** Single audience per visit, clear architecture, one CTA path.

### Option A: OS-first positioning (recommended)
Target: developers + power users crossing over

```
1. Hero
   Headline: "The AI OS for everything you know."
   Sub: "One entity graph. Any view. AI that proposes before it acts. 
         Open source — run it on your server or ours."
   CTA: [Download the app] + [Self-host free]
   Visual: Browser V2 spatial shell screenshot

2. The three primitives (Entities · Views · Channels)
   Show the triptych as a concrete interactive demo:
   - Same entities → switch between table, kanban, bento with one click
   - No data moved. Only the lens changed.

3. The governance differentiator
   "AI proposes. You approve. Every decision is logged."
   - Show the proposal flow in 3 steps
   - Immutable event chain callout
   - "Your data can never be silently overwritten."

4. Config-over-code
   "Describe a workspace in JSON (or ask AI).
    Get entity types, views, automations — deployed, no code."
   - Show template picker: CRM / Second Brain / Agent OS / Blank
   - Link to /developers for Hub Protocol

5. Your pod, your rules
   "Self-hosted or managed. Always your PostgreSQL."
   - Three options: Download, Self-host, Managed cloud
   - Sovereignty callout: EU hosting, open formats, full export

6. Final CTA
   [Download the app — free] [Start managed — $12/mo] [Self-host]
```

### Option B: Developer-first positioning
If primary audience is OpenClaw/agent builders:
- Lead with: "Your agent's memory, structured."
- Show: `npx @synap/cli init` → Hub Protocol → entity graph
- Then upsell to visual layer

### Sections to REMOVE from homepage (move to `/developers` or `/product/*`):
- SectionOpenClaw (deep dive) → `/developers`
- SectionComparison table → `/compare/*` (already exists)
- SectionPricing → keep a simplified version, remove full matrix
- SectionEcosystem detail → `/product/workspace`

---

## 8. Visual Language Guidance

### Colors
- Primary: amber/warm gold (`$primary`) — intelligent, warm, not cold-tech
- AI accent: emerald (`$ai / $aiLight`) — specifically for AI-related features
- Background: dark, warm (#0a0a0a-adjacent) — premium, focused
- No shadows. Subtle borders for depth (`$borderColor`).

### Typography
- Headlines: **Fraunces** (editorial, premium, distinctive)
- Body: **DM Sans** (clean, readable)
- Code: JetBrains Mono

### Design principle (Browser V2)
> "A calm sea with useful islands."
- Empty space is a feature, not a bug.
- Atmospheric restraint — no decorative blobs, no loud gradients.
- Floating islands (not hard-bordered containers) for header elements.
- Everything that opens is a surface. The OS places it.

### Anti-patterns to avoid
- No "feature grid with icons" sections (generic SaaS look)
- No "trusted by X companies" social proof until you have it
- No comparison tables on the homepage (exists at `/compare/*`)
- No pricing matrix on homepage (link to `/pricing`)

---

## 9. Key Messages by Audience (Copywriting Reference)

### For developer audiences
- "One command connects your agent to a structured knowledge graph."
- "Hub Protocol: 50+ endpoints. Any AI model. Governed writes, auditable history."
- "Replaces MEMORY.md with typed entities, vector search, and a proposal system."
- "Self-hosted in 5 minutes. `docker-compose up`."

### For power users
- "Everything you know in one open graph — tasks, contacts, notes, events, deals."
- "AI auto-classifies what you capture. You never touch a tag again."
- "Switch between table, kanban, and calendar on the same data. Nothing moves."
- "AI suggests connections. You approve. Your data is never quietly overwritten."

### For sovereignty-minded users
- "Standard PostgreSQL. Export everything, anytime. We disappear, your server doesn't."
- "EU or US hosting. Your data never crosses borders without your decision."
- "Open source core. MIT license. Inspect the code."

### For teams
- "One workspace OS for your whole team. All data connected. AI with an audit trail."
- "Every AI action is a proposal. Review it, approve it, log it. GDPR-ready."

---

## 10. What to Build vs. What to Defer

### Build now (homepage redesign)
- [ ] New hero: OS-first headline + Browser V2 screenshot
- [ ] Triptych section: Entities/Views/Channels as interactive demo
- [ ] Governance section: proposal flow as the differentiator
- [ ] Config-over-code section: template picker visual
- [ ] Simplified CTA footer: 3 paths (download / self-host / managed)
- [ ] Remove SectionOpenClaw from homepage (move to `/developers`)
- [ ] Remove full comparison table (keep link to `/compare/*`)

### Defer
- Full `/developers` page redesign
- `/for/teams` waitlist wire-up (TODO in code)
- Changelog, status page
- Video demo (record after visual layer is polished)

---

## 11. Open Questions for the Founder

These are strategic questions that will change the copy significantly:

1. **Primary CTA:** Download the desktop app, or sign up for managed cloud? These are fundamentally different funnels. The current page tries to do both.

2. **Product name:** Is "Synap" the permanent name? Any rebranding (e.g. "Globaly") should be decided before the landing page is redesigned, since it affects all copy, OG images, metadata, etc.

3. **Developer vs. power user:** Which audience is the homepage optimized for in Q3 2026? The GTM doc says OpenClaw is the primary funnel — does that mean developers see the homepage, or do they arrive via ClawHub/Discord and skip it?

4. **Desktop app maturity:** The Browser V2 spatial shell is a north star doc (not yet shipped). Can we show it on the landing, or should we show the current V1 shell?

5. **Pricing public vs. gated:** Should pricing be on the homepage or behind `/pricing`? The current page has it. The strategy doc suggests the homepage should focus on adoption, not conversion.

---

---

## 12. Competitor Landing Page Analysis

*Researched May 2026. Verbatim copy where available.*

### Linear (linear.app) — the gold standard
- **Hero headline:** "The product development system for teams and agents"
- **Sub:** "Purpose-built for planning and building products. Designed for the AI era."
- **CTA:** A link-button styled as a provocation: "Issue tracking is dead — linear.app/next"
- **Structure:** 5 sections numbered 1.0–5.0, mirroring the actual product workflow (Intake → Plan → Build → Diffs → Monitor). The page IS a product demo in structure.
- **Visuals:** Animated dashboard screenshots, live agent interaction demo, code diff comparisons.
- **Key lesson:** The page refuses to be generic. Every section earns its place. The numbering signals intentionality.

### Vercel (vercel.com)
- **Hero headline:** "Build and deploy on the AI Cloud."
- **Sub:** "Vercel provides the developer tools and cloud infrastructure to build, scale, and secure a faster, more personalized web."
- **CTAs:** "Start Deploying" (self-serve) + "Get a Demo" (enterprise) — dual audience handled explicitly.
- **Structure:** 11+ sections with a use-case selector mid-page (AI Apps / Web Apps / Ecommerce / Marketing / Platforms).
- **Key lesson:** Use-case selector mid-page lets one homepage speak to four audiences without forcing a choice at the top.

### Raycast (raycast.com)
- **Hero headline:** "Your shortcut to everything."
- **Sub:** "A collection of powerful productivity tools all within an extendable launcher. Fast, ergonomic and reliable."
- **CTA:** "Download for Mac" — no friction, no email required, high in the hero.
- **Key lesson:** "It's not about saving time. It's about feeling like you're never wasting it." — leads with identity/emotion, not functionality. The keyboard metaphor is woven into every visual. This is how you sell a tool that resists bullet-point explanation.

### Notion (notion.com) — recent pivot to agents
- **Hero headline:** "Meet the night shift."
- **Sub:** "Notion agents keep work moving 24/7. They capture knowledge, answer questions, and push projects forward — all while you sleep."
- **Key lesson:** A metaphor ("night shift") personalizes AI in a way technical specs can't. Mid-page cost comparison calculator converts doubters at the exact evaluation moment.

### Arc Browser (arc.net)
- **Hero:** Third-party press quote as the hero headline ("Arc is the Chrome replacement I've been waiting for" — The Verge).
- **Key lesson:** When you can lead with external validation instead of self-description, do it. It transfers credibility instantly.

### Supabase (supabase.com) — closest structural analog to Synap
- **Hero headline:** "Build in a weekend. Scale to millions."
- **Sub:** "Supabase is an open source Firebase alternative built on Postgres."
- **Structure:** 5 tight sections, no fluff.
- **Key lesson:** Six words answer both "how hard is it to start?" and "will I outgrow it?". The "Firebase alternative" framing is deliberate competitive anchoring — it tells visitors exactly what category to put it in. Synap needs an equivalent anchor.

### Neon (neon.com) — developer infrastructure, closest to Synap's dev audience
- **Hero headline:** "Fast Postgres Databases for Teams and Agents"
- **Notable:** Terminal snippet (`npx neonctl init`) as a third implicit CTA in the hero. Specific falsifiable numbers: "120ms provisioning", "54,210 degradations prevented daily".
- **Key lesson:** A terminal command in the hero is a trust signal for developer audiences. It says "we know you'd rather just try it."

### 7 Patterns the Best Landing Pages Share

1. **The headline stakes a claim, not a description.** Not "a knowledge management platform" but "the product development system." It names what is enabled, not what it is.
2. **The subheadline resolves the provocation.** It doesn't restate — it answers the follow-up question the headline raised.
3. **Social proof arrives before the first scroll ends.** Interest (hero) → credibility (proof) → education (features). Not the reverse.
4. **Use-case segmentation replaces generic feature lists.** Tabs, cards, or selectors let visitors self-identify without separate landing pages.
5. **Specific falsifiable numbers outperform vague benefit claims.** "120ms provisioning" cannot be ignored or dismissed. "Fast" can.
6. **The page structure mirrors the user's journey, not a feature checklist.** It's an argument, not a catalog.
7. **The primary CTA is frictionless and repeated twice.** Once in the hero, once at the bottom. No pricing in the hero.

### What the Best Pages Avoid
- Jargon-first openers — even Neon (most technical) opens with a benefit, not an architecture
- Feature-list bullets in the hero
- Vague social proof ("loved by developers")
- Single-audience assumption without segmentation
- Hedging copy — "can help you" vs. "you ship"

---

## 13. Landing Page Best Practices (2025–2026)

### Hero section
**Ideal structure:** One bold headline (6–10 words) + one clarifying subheadline (1–2 sentences, max 30 words) + one primary CTA above the fold + a product visual that makes the abstract concrete instantly.

**Headline formulas that work for infrastructure/AI products:**
- `"Do X without Y"` — removes the pain ("Deploy globally without managing infra.")
- `"Your [noun] for [outcome]"` — positions the category
- `"[Verb] [thing] in [time/constraint]"` — specific + urgent ("Build in a weekend. Scale to millions.")
- `"The [noun] that [does specific thing]"` — avoids vague category claims

The subheadline must NOT restate the headline. It answers the follow-up question.

### Copy and tone
- **Outcome-led over feature-led.** "Always in sync, even offline. No conflicts." beats "real-time sync via CRDTs."
- **Concrete vs. abstract.** "Handles 10k events/sec" beats "scales with your needs."
- **Second person ("You ship, we handle X")** is most conversion-effective.
- **Technical specificity signals credibility** — real numbers, real stack names, real constraints.

**Words to eliminate from all landing copy:**
- "Revolutionary", "transformative", "game-changing"
- "Powerful", "robust", "seamless", "cutting-edge"
- "AI-powered" as a standalone claim (needs specificity)
- "The future of X" (dates instantly)
- "All-in-one" (signals bloat)
- "Supercharge your workflow" (used by every B2B tool since 2019)

### Scroll narrative — ideal section order

```
1. Hero             — What is it? Who is it for?
2. Social proof     — Who else uses it? (arrive before first scroll)
3. Core value prop  — 3-column feature grid or 3-step "how it works"
4. Product deep-dive — Screenshots/demo with feature callouts
5. Differentiator   — Why not the alternative?
6. Social proof++   — Testimonials, metrics, case studies
7. Integrations     — Stack logos, ecosystem
8. Pricing overview — Brief, links to /pricing
9. Final CTA        — Repeat primary CTA, lower-friction option
```

**Ideal length:** 6–9 sections. Under 5 feels thin. Over 10 loses focus. Each section must answer one specific objection in the visitor's mind: "What is it?" → "Who uses it?" → "How does it work?" → "Why is it better?" → "Can I trust it?" → "How much?" → "Okay, I'll try."

### Animations and interactions
**Sweet spot:** Scroll-triggered opacity/translate reveals (200–400ms, 40–60ms delay per element). Animated product UI flows showing actual feature activating. Code snippet typewriter animations for CLI products.

**Overdone/avoid:**
- Heavy parallax on backgrounds
- Particle/blob animations not tied to product
- Full-screen video heroes (kills performance, usually skipped)
- Scroll-jacking
- Lottie animations that take 3+ seconds

**2025–2026 reference:** Linear and Resend — sparse, fast, every animation tied to product UI.

### Product visuals — what converts (ranked)
1. **Animated UI walkthroughs** (CSS/Lottie, real product flow) — highest engagement
2. **Static product screenshot with callout annotations** — reliable
3. **Interactive in-page demo** (embedded sandbox) — highest intent signal, high build cost
4. **Short looping video** (autoplay muted, 15–30s) — works mid-page, not hero
5. **Generic illustrations/3D renders** — lowest conversion

**The rule:** show actual product UI. "Browser chrome" mockups showing real UI are the 2025–2026 standard (Vercel, Neon, Railway all use this).

### Social proof for early-stage products
With few customers, quality over quantity:
- One precise metric from a real user beats five vague endorsements
- Named individuals with title + company
- GitHub stars / open-source signals — highly credible to technical audiences
- Integration logos (PostgreSQL, Stripe, etc.) — implies production-ready
- Founder credibility and relevant domain experience

### CTA strategy for free + paid + self-hosted
- **One primary CTA in the hero** — "Start free" or "Download" — cloud/hosted default
- **Secondary options below the fold** — ghost button or text link for "Self-host" or "Read docs"
- **Never three co-equal CTAs in the hero** — paralysis-inducing
- Pricing section handles the free/paid split; self-hosted in the infra section

### Design system — premium in 2025–2026
- **Dark mode as default** for developer/infra products — Resend, Neon, Railway, Raycast, Clerk all dark-first
- **Typography-led hierarchy** — large confident variable fonts (Fraunces, Geist, Inter Display)
- **Heading + mono pairing** — the current signature look for technical products
- **Subtle glassmorphism** — used sparingly for cards/modals only, never backgrounds
- **Spatial/depth UI** (visionOS-influenced) — layered surfaces with translucency + 1px borders, NOT box shadows
- **Neutral palette + one accent** — monochrome base + single brand color. No rainbow gradients.
- **Monospace accents** — code snippets, version numbers, and metrics in mono font add technical credibility as a design element
- **"Editorial" moments** — pull quotes, large isolated statistics, full-bleed code blocks as visual elements

**Dated (avoid):** Blurred gradient blobs, heavy neumorphism, colorful hero illustrations, stock-photo teams, full-width dividers between every section.

**Current reference tier:** Vercel, Linear, Resend, Neon, Railway, Raycast, Clerk, Turso.

### Mobile considerations
- Hero headline: 28–32px; never truncate
- CTA button: full-width on mobile, min 48px touch target
- Product screenshots stack vertically; hide complex animations on mobile
- Never hide the primary CTA in the hamburger menu
- Feature grids collapse from 3-col to single-col with accordion

---

## 14. Design Tools — Comparison & Recommended Workflow

The goal: brief (markdown) → validated layout → production code in Next.js + Tamagui.

### Tool comparison

| Tool | Best for | Output | Quality ceiling | Tamagui fit |
|------|----------|--------|----------------|-------------|
| **v0 by Vercel** | Layout exploration + React code from prompt | React + Next.js (shadcn/Tailwind) | Linear/Vercel tier on first gen | ⚠️ Needs Tamagui swap post-gen |
| **Lovable** | Full-stack interactive prototypes | Hosted React app | Good, not Linear-tier | ⚠️ Not Tamagui-aware |
| **Figma + AI** | Design file for stakeholder review | Figma frames | Highest fidelity with designer polish | ❌ Figma-to-React conversion is brittle |
| **Framer** | Visually polished hosted marketing sites | Hosted Framer site | Best-looking AI output | ❌ No clean Next.js export |
| **Bolt.new** | Framework-flexible full-stack prototypes | WebContainer (any framework) | Below v0 for UI quality | ⚠️ No Tamagui awareness |
| **Cursor / Claude Code** | Production code inside existing repo | Code in your codebase | Bounded by brief quality + design tokens | ✅ Knows Synap tokens + rules |
| **Google Stitch / Uizard** | Rapid wireframe layout exploration | Figma file or HTML | Medium — wireframe quality | ❌ Not production-ready |

### Recommended workflow

**Step 1 — Section structure (15 min): v0.app**

Paste the full branding brief as a single prompt into v0.app. Ask for a complete landing page with all named sections. Use the first generation to validate layout hierarchy and content flow — iterate 2–3 times by describing adjustments. This is the **visual north star**, not production code. Export the confirmed section structure and component breakdown as an implementation spec.

v0 is used here specifically because it reaches Linear/Vercel-quality aesthetics on a first generation, runs in the browser with no setup, and produces a reviewable visual in under 15 minutes from a markdown brief.

**Step 2 — Production code (30–60 min): Claude Code in the repo**

Take the confirmed section structure from Step 1 and implement directly in `synap-landing/packages/landing/` using Claude Code. Prompt section-by-section, using:
- Tamagui primitives (`YStack`, `XStack`, `SizableText`, `Button`)
- Synap design tokens (`$primary`, `$background`, `$ai`, `$1`–`$24`, `$borderColor`)
- Framer Motion for scroll-triggered reveals (already in `package.json`)
- The existing `LandingButton`, `SectionReveal`, `SectionHeader` component patterns

Claude Code knows the full codebase context — architecture, tokens, rules — so output fits without refactoring.

**Why not Framer:** No clean export to Next.js. Beautiful output, trapped there.

**Why not Figma-first:** Adds a design review step the brief already eliminates. Figma-to-React conversion is unreliable.

**Why not Lovable or Bolt:** Neither knows Tamagui or Synap's design system. Adaptation cost exceeds build-from-scratch cost.

**Use Stitch/Uizard only if:** Stakeholders need to approve section layout before any code is written, and a Figma wireframe is required as a deliverable.

**Total time from brief to reviewable first implementation:** 45–90 minutes.

### Prompting v0 effectively (for this brief)

The highest-quality v0 output comes from a structured prompt. When you paste the brief, frame it as:

```
Build a dark-mode landing page for [product name], a [one-line description].
Use the following section structure: [list sections].
Design language: Fraunces for headings, monospace for code/numbers,
warm amber as primary accent, dark background (#0a0a0a), 
subtle 1px borders for depth (no shadows), 
editorial moments with large pull quotes and isolated statistics.
Reference aesthetic: Linear, Vercel, Neon, Resend.
Use scroll-triggered opacity/translate reveals on section entry.
Show actual product UI (not illustrations) in screenshot containers.
Primary CTA: [one action]. Secondary CTA: [one action].
```

Then iterate with specific corrections per section.

---

## Appendix: Current Landing Sections (for reference)

| Current Section | What it says | Verdict |
|----------------|-------------|---------|
| HeroSection | "Capture once. Remember forever." Dual CTA: CLI + trial | Replace entirely |
| SectionProblem | PKM pain (browser tabs, scattered notes) | Reframe or remove |
| SectionOpenClaw | MEMORY.md vs Synap for agents | Move to /developers |
| SectionSurfaces | Three surfaces (desktop, Telegram, API) | Keep concept, update to browser-first |
| SectionIntelligence | Capture → Classify → Connect → Govern pipeline | Keep, rename "How it works" |
| SectionInfrastructure | Your own pod, open formats, sovereignty | Promote — this is a differentiator |
| SectionEcosystem | Connectors, integrations | Simplify, move depth to /product |
| SectionShift | Positioning shift (vague) | Remove |
| SectionComparison | vs Notion/Obsidian table | Move to /compare (already exists) |
| SectionPricing | Full pricing tiers | Simplify to 3-option CTA |
| SectionFinalCTA | Download + CLI | Keep, simplify |
