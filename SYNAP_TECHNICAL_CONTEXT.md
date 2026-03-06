# Synap — Technical Context for Marketing Research

> Written from the CTO perspective. Intended as a complete context document for an AI
> assistant, marketing researcher, or advisor who needs to understand what we built,
> why the architecture matters, what the product enables, and where we stand today.
> No prior knowledge assumed. Technically detailed where the detail reveals product value.
>
> Last updated: March 2026

---

## 1. The Founding Architectural Decision

Every software product embeds a theory of what data is. Notion says data is a page. Airtable says
data is a row in a table. Linear says data is a ticket. HubSpot says data is a CRM record.

We made a different choice: **data is a node in a graph**.

A task, a contact, a meeting note, a CRM deal, a calendar event, a research idea — in Synap they
are all the same thing: an **entity**. Each entity has a type (determined by a schema called a
Profile), a set of typed properties, and an arbitrary number of typed bidirectional relationships
to other entities.

This decision changes everything downstream. When your data model is a graph:

- You can ask questions no single-purpose tool can answer: "show me every task assigned to someone
  I met last quarter, grouped by project, that is blocking a deadline." This query crosses what
  would be three separate databases in any other tool — it's a single join in Synap.
- You can build views that mix entity types freely: a bento dashboard with a kanban of tasks,
  a list of related contacts, and a stats block counting open deals — all querying the same
  underlying graph.
- When an AI agent works on your data, it operates on a coherent graph with relationships, not
  on isolated records with no context about how they connect.

The rest of the architecture follows from this premise: a unified entity graph needs one query
interface (not 5 separate APIs), needs a view system that renders that graph in any shape, and
needs an AI layer that understands the graph rather than being bolted on per-tool.

---

## 2. The Data Pod — Your Own Backend

A **pod** is a complete, self-contained backend instance. It runs on PostgreSQL, exposing a
tRPC API (type-safe RPC over HTTP), real-time collaboration via Socket.IO + Yjs CRDTs, and a
background job queue via pg-boss.

The key design principle: **the pod is yours**. Not "yours in spirit" — actually yours.

- The code is open-source. You can read every line.
- The database is standard PostgreSQL. There is no proprietary data format.
- Self-hosted deployment is Docker Compose. No special tooling, no cloud dependency.
- You can export everything at any time. No lock-in, no export tax.

When using Synap Cloud, we provision and operate a pod on your behalf. The pod runs identical
code to the self-hosted version. The control plane (our proprietary layer) only handles
provisioning, billing, and domain management — it is not in the hot path for any user operation.
If Synap Cloud goes down, your pod keeps running.

**Why this matters for marketing:**
The pitch is not "we promise to take care of your data." The pitch is "your data is yours,
provably, because the code is open." This is a fundamentally different trust relationship than
any closed SaaS competitor can offer. Enterprise buyers who cannot send sensitive data to a
third party can self-host and still get the full product.

---

## 3. The Entity & Profile System — What "Everything Is an Entity" Really Means

### The Entity

Every entity in the system shares the same data structure:

```
Entity
├── id (UUID)
├── type (string — resolved from Profile)
├── title
├── preview
├── properties (JSONB — typed, schema-validated)
├── documentId (optional — links to a rich-text or canvas body)
├── relationships → [Relation → other entities]
└── workspaceId
```

The `properties` field is a JSONB object. It is NOT unstructured — every property is validated
against a PropertyDefinition that specifies its value type (string, number, date, boolean,
entity reference, array, secret), constraints (enum values, min/max, regex), and UI hints
(label, icon, input type).

### Profiles — Entity Types as Configuration

An entity's type is determined by a **Profile**. A Profile is a schema definition:

```
Profile
├── slug ("task", "contact", "deal", "sprint", "campaign"...)
├── displayName
├── scope (system / workspace / shared / user)
├── defaultValues (merged at entity creation time)
├── parentProfileId (inheritance — "webinar" extends "event")
└── uiHints (icon, color, layout preferences)
```

System profiles (task, note, contact, event, project, idea, meeting) are built-in. Workspace
admins can create custom profiles. The critical detail: **profiles are configuration, not code**.
You don't need a developer to define a new entity type. You configure a profile, add property
definitions, and that type is available system-wide — queryable in any view, referenceable
in relationships, accessible to AI agents.

Profile inheritance means "webinar" (inherits from "event") automatically gets all event
properties plus its own. This allows templates to specialize without duplicating schemas.

### The Relationship Graph

Entities link with typed, bidirectional edges. Built-in relationship types: `assigned_to`,
`mentions`, `parent_of`, `depends_on`, `blocks`, `relates_to`, `links_to`, `created_by`.
Custom types are supported.

When you link a Contact to a Project via `assigned_to`, the relationship is queryable from both
ends: "which projects is Sarah assigned to?" and "who is assigned to the Rebrand project?"
are the same query in different directions.

This is what enables the graph view — a force-directed network of entities and their
relationships — and what enables AI agents to traverse the knowledge graph when answering
questions: "what does the onboarding project depend on?" yields a traversal across tasks,
contacts, documents, and deadlines.

---

## 4. The View System — Any Lens on the Same Data

A view is a **lens on the entity graph**. It is never a copy. Switch view types and you are
re-querying the same graph with different rendering.

| View | What it is |
|------|-----------|
| Table | Spreadsheet-style with sortable, filterable columns, inline edit |
| Kanban | Drag-and-drop board grouped by any status/property |
| List | Fast linear scan, compact |
| Grid | Card grid, image and preview friendly |
| Calendar | Entities plotted on date properties |
| Timeline | Date-range bars (Gantt-style) |
| Graph | Force-directed relationship network — nodes are entities, edges are relationships |
| Whiteboard | Freeform Tldraw canvas — the only view that creates a document backing store |
| Bento | Composable dashboard grid (described below) |

Every view has a `config` object (JSONB) that stores its query parameters (which entity types,
which workspace, which filters, which sort), its display configuration (visible columns, grouping),
and layout state. Views are stored in the database — they are persistent, shareable, and can be
embedded in other surfaces.

**What this means in practice:** A marketing team's workspace has a Pipeline view (kanban of deals
by stage), a Contacts view (table of contacts with company and deal count), and a Calendar view
(meetings and follow-ups). These are not three databases — they are three lenses on the same
graph of entities. Update a deal status in the Kanban and the Calendar updates automatically.
There is no sync problem because there is no copy.

---

## 5. The Bento Dashboard — The Primary Product Surface

The **Bento view** is the flagship composition surface and the most technically distinctive
element of the product.

A bento is a responsive grid (powered by react-grid-layout) where each cell is a **widget** —
a registered, independently-erroring UI block. The layout is stored as a JSONB config:

```
BentoViewConfig {
  blocks: [
    { widgetType: "view-kanban", pos: {x:0, y:0, w:8, h:6}, config: { profileSlugs: ["task"] } },
    { widgetType: "stats-counter", pos: {x:8, y:0, w:4, h:3}, config: { label: "Open Deals" } },
    { widgetType: "entity-list", pos: {x:8, y:3, w:4, h:3}, config: { profileSlugs: ["contact"] } }
  ]
}
```

Built-in widgets include: welcome header, entity list, recent entities, quick capture, stats
counter, entity header, entity properties, full kanban adapter, full table adapter, full list
adapter, full calendar adapter, entity content board.

**Three places a bento view appears:**

1. **Workspace home**: every workspace has a bento as its home dashboard. Templates provision
   this automatically — when you install the CRM template, you get a sales command center
   pre-configured.

2. **Profile bento**: each entity type (profile) can have a profile-level bento that serves as
   the default view for all entities of that type. The CRM template's Company profile bento
   shows: company header, related contacts (table), related deals (kanban), activity feed,
   and open tasks — automatically, for any Company entity you open.

3. **Entity bento mode**: any individual entity can be toggled into "dashboard mode." This
   converts that specific entity into its own bento, customizable per instance. A sales
   opportunity entity becomes a dedicated deal command center with its own widgets.

**The architectural significance:** most tools have dashboards at one level (the workspace).
Synap has bento at three levels (workspace, type, instance) and each level is independently
configurable. This is what allows Synap to generate "a full CRM for any contact" or "a project
dashboard for any project" automatically — not through templating tricks but through the
structural fact that any entity can be a dashboard.

**Widget error isolation:** each widget is wrapped in an error boundary. A broken widget shows
a compact error card; the rest of the dashboard continues rendering. This is an operational
guarantee, not a feature — it means a buggy third-party widget cannot crash the user's
workspace.

**The widget marketplace vision:** unregistered widget types render a marketplace CTA
placeholder. The planned widget marketplace allows community-built widgets (verified, 30%
revenue share) to be installed to any bento. MCP-backed widgets (where any MCP server can
expose a widget) are on the roadmap — this means GitHub PR status, Linear issues, Stripe
revenue, or any data source becomes a bento block through a standard protocol.

---

## 6. The Channel System — AI-Native Communication

A **channel** is not just a chat thread. It is a structured communication surface that knows
what it is about.

```
Channel
├── type (ai_thread | branch | entity_comments | document_review | external_import | a2ai | direct)
├── contextItems → [entities or documents]
├── messages → [human and AI messages with metadata]
└── workspaceId
```

### Channel types and what they enable

**`ai_thread`**: A conversation with the AI grounded in your workspace data. When you attach
entities as context items (the `@` mention system in the chat input), the AI receives those
entities' full data including their properties, relationships, and documents as context. It does
not hallucinate about what's in your CRM — it reads the actual entities.

**`branch`**: A fork of an ai_thread. Like git branching applied to reasoning — you explore
an alternative approach without losing the original. A visual branch tree shows the tree of
reasoning forks. This is unique in the market; no other AI workspace tool has structured
conversation branching with a visual history.

**`entity_comments`**: Inline discussion anchored to a specific entity. Every entity has an
implicit comment channel. This replaces the "leave a comment in Notion" pattern with a
properly typed channel that can surface comments in any view.

**`document_review`**: A structured review thread for a document. Tied to document position,
shows resolved/open status.

**`external_import`**: A relay channel for messages from external platforms (Telegram, Slack,
WhatsApp, Discord). The schema is built; the relay infrastructure is in progress. When complete:
a WhatsApp message from a client becomes an entity in your CRM's "incoming messages" view,
automatically associated with the contact entity via relationship.

**`a2ai`**: Agent-to-agent async communication. This is the technical foundation for multi-agent
workflows that are not linear pipelines. Instead of Agent A calling Agent B (brittle, synchronous),
Agent A posts a message to an A2AI channel; Agent B reads it and responds; both have the full
channel history as context. The graph topology of an agent network is modeled as a graph of A2AI
channels — not a call tree.

### The AI streaming pipeline

When a message is sent to an `ai_thread` or `branch`, the backend:
1. Routes to the workspace's configured intelligence service (default: Synap Intelligence Hub)
2. Opens a streaming SSE connection
3. Receives events: `chunk` (text delta), `step` (tool use), `branch_decision`, `complete`, `error`
4. Streams chunks to the frontend in real-time
5. On `complete`: persists the assistant message with embedded step metadata and proposal IDs

The `step` event carries tool-use data (tool name, input, output) which is rendered in the UI
as "thinking steps" — the user sees the AI's reasoning and tool calls, not just the final answer.
This is a transparency feature that becomes a governance feature: you can see every tool call
before approving its effects.

---

## 7. The Proposal System — AI Governance Built Into the Protocol

This is the most architecturally significant decision in Synap and the one with the greatest
long-term strategic value.

### The problem it solves

Every AI tool with write access has the same implicit architecture: user asks → AI decides →
AI acts. The action happens at AI speed with no human checkpoint. As AI capabilities increase,
the blast radius of an unsupervised mistake increases proportionally. The industry's response
has been UX: "confirm?" dialogs. This is not governance. It is a speed bump.

### Our architecture

The proposal model is baked into the Hub Protocol — the API contract between any intelligence
service and the data pod. The flow:

1. AI agent calls a write tool (create entity, update property, archive document, link entities)
2. The backend's `checkPermissionOrPropose` function intercepts
3. If the operation is in the agent's `autoApproveFor[]` whitelist → execute immediately
4. If not → create a `Proposal` row with full operation metadata and return `{ status: "proposed", proposalId }`
5. AI informs user: "I've proposed X — review in your inbox"
6. User sees proposal in inbox: action type, target entity, diff of changes, AI's reasoning
7. User accepts or rejects with optional comment
8. Decision is written to the immutable event ledger

**The `autoApproveFor[]` whitelist** uses glob patterns. Default whitelist: read operations,
search, memory recall — safe, reversible, or informational. A power user can add `"entity.create.*"`
to auto-approve all entity creation. An enterprise admin can set the whitelist to empty for
full human review of every AI action.

**Agents are workspace members.** Every AI agent is a row in the `users` table with a workspace
role. The same RBAC system that governs what a human member can do governs what an AI agent can
do. A "research agent" can be given read-only access; an "office manager agent" can be given
write access to tasks but not financial records.

**The event ledger.** Every proposal (accepted or rejected), every approval, every agent action
is an immutable event. The ledger is append-only. You can reconstruct the full history of every
AI decision that affected your data, including who approved it and what they said.

### What this enables for marketing

- **Enterprise compliance**: "can your AI be audited?" is answered with a yes backed by
  cryptographic event logs, not a policy statement.
- **Trust-based onboarding**: users who are afraid of AI overwriting their data can start with
  a full whitelist (nothing auto-approved) and relax it as they build confidence.
- **Background agents**: agents that run overnight, making proposals, which the user reviews
  in the morning. This is not "AI that runs unsupervised" — it is "AI that works while you sleep
  and presents a to-do list of approvals." The governance model enables async AI work that would
  otherwise be too risky to trust.
- **Multi-agent safety**: when multiple agents collaborate, their proposals are interleaved in
  the same inbox. Conflict detection (when two agents propose changes to the same entity) is
  a near-term roadmap item powered by this existing infrastructure.

---

## 8. The Hub Protocol — Pluggable Intelligence

The Hub Protocol is the open API contract between the data pod and any intelligence service.

```
POST {pod}/trpc/hubProtocol.*
Authorization: Bearer {hub_api_key}
```

Any service that implements the Hub Protocol can connect to any pod and operate under the same
governance rules. This is not a plugin system — it is a protocol. The distinction matters:

- A plugin is a dependency. It runs inside the host's process, shares its security boundary.
- A protocol is a contract. The intelligence service runs in its own process, on its own
  infrastructure, with no access to the pod except through the API.

**What the Hub Protocol enables:**
- Synap's managed intelligence service is the default — works out of the box
- Users can switch to a self-hosted open-source intelligence service
- Enterprise users can connect their own fine-tuned models
- Third-party AI providers can build Hub Protocol-compatible services and list them in the
  Synap ecosystem (planned marketplace)
- OpenClaw (an open-source agent runtime with 13+ messaging channels and 5,700+ community skills)
  can connect via Hub Protocol — the architecture for this is validated and documented

**The "AIOS" implication:** Synap does not need to build AI capabilities. It needs to govern
AI capabilities. Any AI service that wants access to a user's entity graph must go through
Hub Protocol, which means it must go through the proposal system. The data pod is the neutral
party. This is the OS metaphor made real: in an operating system, processes request resources
from the kernel. In Synap, intelligence services request data access from the pod.

---

## 9. The Template Engine — Complete Workspace Instantiation

A **template** is a complete workspace definition in a single JSON document.

```
Template definition
├── Profiles (entity types to create)
│   └── PropertyDefinitions per profile
├── Views (kanban, table, list, bento configurations)
├── Home bento layout (the workspace dashboard)
├── Sidebar items (what appears in the browser app navigation)
├── Profile-level bento layouts (default view per entity type)
└── Agent OS configuration (optional)
```

When a user installs a template, the engine executes the definition:
1. Creates workspace-scoped profiles with all property definitions
2. Creates views with correct configurations and query parameters
3. Creates a home bento view and links it to the workspace
4. Stores sidebar items and layout configuration
5. Sets profile-level bentos for all configured entity types

The result: a fully configured workspace in one action. A user who installs the CRM template
gets a workspace indistinguishable from one that a Synap engineer configured by hand — with
a Pipeline kanban, a Contacts table, a Companies view, a home dashboard showing deal stats
and recent contacts, and a sidebar linking to all of them.

**Templates ship with intelligence:** the "ZeroClaw Agent OS" template creates an agent-aware
workspace where agents are entities with skills, tasks, and provider relationships. A user
managing AI agents gets a structured workspace instead of daemon logs and JSON configs.

**Templates as market entry points:** we can create a "world-class CRM" template, a
"second brain" template, and a "content pipeline" template — each of which competes directly
with a category leader (HubSpot, Roam, Buffer) but operates on the unified entity graph.
Each template is a beachhead into a market segment without building a separate product.

---

## 10. The Browser App — A Workspace You Browse With

The **browser app** is an Electron application — a full Chromium browser embedded inside the
Synap workspace.

This is not a web view wrapper. It is a real browser (same engine as Chrome) rendered inside
the Electron shell, side-by-side with the workspace panels. The user does not switch between
a browser and their workspace — they have both in the same window, with bidirectional
connection.

**Current capabilities:**
- Multiple browser tabs inside the workspace
- Activity bar with workspace-defined navigation (sidebar items from templates)
- Bento dashboard as the home view (the workspace dashboard is the new tab page)
- Data pod connection management (connect any pod, see connection health)
- Profile-based workspace switching (multiple workspaces, one app)

**Near-term roadmap capabilities:**
- Playwright/MCP integration: the AI can interact with any web page the user is looking at
  (click, fill, extract), using the same accessibility-tree approach as Microsoft's Playwright
  MCP server — no computer-vision model required
- Browser history becomes entities: pages visited become entities in the graph, giving the AI
  context about what the user was researching
- Web-based tools render inside Synap: a Linear issue or a Figma file opens in the browser
  pane, not in a separate window

**The strategic implication:** the browser app turns Synap into the primary application on a
user's computer, not a tab in a browser. When Synap is the browser, everything the user does
online can be connected to their entity graph — with their permission, with governance, with
the proposal system applying to any AI action that writes from a web page back to their data.

---

## 11. The Event System — An Immutable Audit Ledger

Every significant action in Synap — entity creation, property update, relationship creation,
message sent, proposal accepted, agent action — is written as an immutable event to the
`events` table.

```
Event
├── type (string — "entity.created", "proposal.accepted", "agent.tool.called"...)
├── payload (JSONB — full context of the event)
├── actorId (UUID — the user or agent who caused it)
├── actorType ("user" | "agent" | "system")
├── workspaceId
└── timestamp
```

The event log is the source of truth for anything that has happened. It powers:
- **Audit trails**: every enterprise compliance requirement ("who changed this and when?")
  is answered by the event log
- **Side effects**: background workers (pg-boss) consume events to trigger side effects —
  notifications, cache invalidation, webhooks, background agent schedules
- **View subscriptions** (planned): subscribe to a view's query and get notified when matching
  entities appear ("notify me when a deal moves to Closed Won")
- **Replay**: in principle, the entire system state can be reconstructed by replaying events
  (event sourcing)

The event system is why "background agents" are possible with existing infrastructure: agents
run, create proposals, emit events; the event system routes notifications to the user who
then reviews in the morning. No new infrastructure required.

---

## 12. Current State — What Works and What Doesn't

### Fully operational today

| System | Status | Notes |
|--------|--------|-------|
| Entity model + profiles + property defs | ✅ Production | 6 system profiles, custom workspace profiles |
| Knowledge graph (typed relationships) | ✅ Production | 8 built-in types + custom |
| 8 view types | ✅ Production | Table, Kanban, List, Grid, Calendar, Timeline, Graph, Whiteboard |
| Bento dashboard | ✅ Production | 14+ widgets, view-runner widgets, react-grid-layout |
| Entity bento mode | ✅ Production | Auto-creates default layout on first toggle |
| Profile-level bento | ✅ Production | Per-type default view |
| AI streaming (SSE) | ✅ Production | chunk, step, branch_decision, complete, error |
| Conversation branching | ✅ Production | Visual branch tree, fork/merge |
| Channel context items (@ mentions) | ✅ Production | Entities/docs attached to channels |
| Proposal system | ✅ Production | Full governance loop, inbox, event log |
| Agent users (RBAC) | ✅ Production | Agents as workspace members |
| autoApproveFor[] whitelist | ✅ Production | Glob patterns, per-agent config |
| Template engine | ✅ Production | 6 templates: CRM, Second Brain, Content OS, PM OS, Personal, Agent OS |
| Hub Protocol v1 | ✅ Production | Open API contract for intelligence services |
| ZeroClaw integration | ✅ Production | One-click provision, Hub Protocol connect |
| Electron browser app | ✅ Production | Multi-tab browser, workspace sidebar, pod connection |
| Real-time collaboration (Yjs) | ✅ Production | Documents, whiteboards |
| Event system + pg-boss workers | ✅ Production | 23 active workers |
| Control plane + billing | ✅ Production | Solo tier (Stripe) |

### In progress (weeks, not months)

| System | Status | ETA |
|--------|--------|-----|
| MCP client in Intelligence Hub | 🚧 In progress | Weeks — unlocks 10,000+ community tools |
| External channel relay (Telegram first) | 🚧 In progress | 1–3 weeks |
| Background agents (async, overnight) | 🚧 In progress | Depends on MCP completion |

### Planned next

| System | Notes |
|--------|-------|
| Widget marketplace | Community widgets, 30% revenue share, MCP-backed widget type |
| OpenClaw full integration | 5,700+ community skills, 13+ external messaging channels |
| AI-generated widgets | "Describe a widget → AI generates it" |
| View subscriptions / notifications | Subscribe to queries, get notified on match |
| Enterprise SSO / SAML | Required for enterprise go-to-market |

### Explicitly not building (with reason)

| Item | Why not |
|------|---------|
| Native mobile app | Electron browser covers desktop; mobile is a separate investment |
| Built-in WhatsApp | Meta verification takes 4–8 weeks; Telegram comes first |
| LangGraph orchestration | Our multi-agent + A2AI channel system is sufficient; LangGraph adds complexity |
| Custom code plugins (marketplace) | MCP covers the use case more cleanly and with better security |

---

## 13. What This Platform Enables — The "So What"

This section is explicitly for the marketing researcher: given the architecture above,
here is what is technically possible and why it matters.

### "One tool to rule them all" is actually achievable

Most "all-in-one" tools (Notion, ClickUp, Monday) are many separate databases with a shared UI.
They feel all-in-one but their data models are still siloed. The entity graph in Synap is
genuinely unified — a task and a contact and a deal are the same kind of object with relationships
between them. The "all-in-one" pitch is technically true here in a way it is not for competitors.

### You can build any vertical product as a template + bento

Because profiles are configuration and bento layouts are JSONB, building a specialized product
(a CRM, a project tracker, a content pipeline, an agent OS) means writing a template JSON file,
not building a new application. The marketing implication: we can publish "Synap for sales teams,"
"Synap for content creators," "Synap for researchers" as distinct products that share zero
infrastructure — they are just templates layered on top of the same platform.

### AI governance is a feature that becomes a market position

Most AI tools ship fast and trust the user to manage risk. Synap ships with governance built in
and makes it configurable. This is not a limitation — it is a selling point. As AI agents
become more capable (and the risks of unsupervised AI write access become more visible), the
proposal model becomes more valuable. We are building toward that future, not patching governance
in after the fact.

### The browser integration is an OS-level play

When the Synap Electron app is the user's browser, AI can interact with any web page the user
visits, and that interaction is governed by the same proposal system as everything else. This
means: browse to a LinkedIn profile, AI proposes adding that contact to your CRM (with their
data pre-filled from the page). Browse to a job posting, AI proposes creating a task to apply.
None of this requires third-party integrations — the AI just has access to the browser DOM via
Playwright/MCP and the entity graph via Hub Protocol.

### The external channel relay closes the "last mile" problem

Most knowledge work involves messages from outside your workspace — clients emailing, Slack
messages from contractors, WhatsApp from vendors. Every other tool requires you to manually
copy-paste that content into your system. When the external channel relay ships, a WhatsApp
message from a client automatically creates a message entity in your CRM, linked to the contact
entity, visible in the workspace, actionable by your AI assistant. The workflow stays in Synap.

### The Hub Protocol moat compounds over time

Every intelligence service that connects via Hub Protocol creates a node in the ecosystem.
Each connection makes the ecosystem more valuable. An enterprise that connects their own fine-tuned
model via Hub Protocol is now invested in the Synap ecosystem — they won't switch because
switching means re-implementing their model integration. This is the same dynamic that makes
AWS S3 sticky: not the data itself, but the integrations built on top of the API.

---

## 14. Competitive Technical Position

| Capability | Synap | Notion | Airtable | Linear | Obsidian | ClickUp |
|-----------|-------|--------|----------|--------|----------|---------|
| Unified entity graph (not tables/pages) | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| AI with write governance (proposals) | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Pluggable AI (open protocol) | ✅ | ❌ | ❌ | ❌ | ✅ plugins | ❌ |
| Bento dashboard composition | ✅ | ❌ | ❌ | ❌ | ❌ | Partial |
| Entity as dashboard (instance-level bento) | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Conversation branching | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Agent-to-agent channels (A2AI) | ✅ spec | ❌ | ❌ | ❌ | ❌ | ❌ |
| External messaging relay | 🚧 | ❌ | ❌ | ❌ | ❌ | ❌ |
| Self-hostable (open source backend) | ✅ | ❌ | ❌ | ❌ | ✅ local-only | ❌ |
| Immutable event ledger | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Template engine (full workspace install) | ✅ | Partial | Partial | ❌ | ❌ | Partial |
| Electron browser integration | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| MCP client (10,000+ tools) | 🚧 | ❌ | ❌ | ❌ | ✅ plugins | ❌ |

The unique combination is: **entity graph + bento composition + AI governance + open protocol**.
No competitor has all four. Notion has views but no graph. Obsidian has graph but no AI
governance. Coda has composition but no open protocol. Linear has great AI but single-purpose.

The defensible position is not any single feature — it is the architecture. Adding AI governance
to Notion requires rethinking their entire AI product. Adding entity graphs to Airtable requires
rethinking their data model. Synap has both from the ground up.

---

*For technical deep dives: see `docs/product-overview.md` (689 lines), `synap-backend/PRODUCT.md`
(410 lines), and `docs/docs/strategy/` for vision and roadmap.*
