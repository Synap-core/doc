# Synap — Product Overview & Vision 2026

> Canonical reference for product direction, marketing copy, and team alignment.
> Last updated: March 2026

---

## What is Synap?

Synap is an **AI operating system for knowledge work** — a self-hostable workspace where every piece of information you produce (tasks, notes, contacts, documents, ideas, data) lives in one open model, is visualized any way you need, and is understood by AI that proposes before it acts.

The core premise: the tools people use every day (task managers, note apps, CRM, spreadsheets, project trackers) each manage a slice of the same underlying graph of human work. They don't share. They don't relate. And their AI features are bolt-ons with no shared understanding of your data.

Synap is the single data layer underneath all of it. Not another SaaS app — an **OS** for your data.

**Three things that make it unusual:**

1. **You own the data.** A "pod" is a real backend running on your infrastructure (or Synap's). Standard PostgreSQL. Exportable at any time. No SaaS lock-in.
2. **AI proposes, humans approve.** No AI agent writes to your data without a proposal in an approval queue. Every decision is logged.
3. **Everything is an entity.** Tasks, contacts, events, ideas, code snippets — one model with typed relationships. Build views the original tools couldn't imagine.

---

## The Product Triptych

Every surface in Synap reduces to three composable concepts:

```
┌─────────────┐   ┌─────────────┐   ┌─────────────┐
│   Entities  │   │    Views    │   │  Channels   │
│             │   │             │   │             │
│  Your data  │◄──│  Any lens   │◄──│ Interaction │
│  One model  │   │  on data    │   │  & AI       │
└─────────────┘   └─────────────┘   └─────────────┘
```

**Entities** are the data layer. A task, a contact, a meeting note, a CRM deal — they are all entities in the same graph. Typed by profiles, related by edges, stored in PostgreSQL. The entity graph is the source of truth for everything.

**Views** are the visualization layer. A view is a lens on the entity graph — never a copy. Table, Kanban, Calendar, Bento, Graph — all query the same data. Switch views without moving anything. Embed views inside other views. Every workspace and every entity can have its own view configuration.

**Channels** are the interaction layer. A channel is where you and your AI talk about, with, and through your entities. An `ai_thread` is a conversation. A `branch` is a fork. `entity_comments` are inline notes. An `external_import` relays messages from Telegram or Slack. The channel always knows what entities it's about.

These three are independent but composable:
- A channel can be anchored to a view (discuss what you're looking at)
- A view can embed a channel (show the conversation alongside the data)
- An entity can have a bento view (the entity *becomes* a dashboard)
- A channel can reference entities as context items (AI knows what you're working on)

Everything else in Synap — documents, templates, the intelligence service, the browser — is infrastructure that enables or extends these three.

---

## The "OS" Metaphor Explained

We call it an OS because it behaves like one:

- **Kernel**: the Data Pod — storage, permissions, event log, job system
- **Desktop**: the web app and Electron browser — views, navigation, interaction
- **Apps**: Channels (AI conversations), Views (data visualization), Documents (rich text/canvas), Marketplace (plugins, planned)
- **Processes**: AI agents running in the Intelligence Hub, background workers in pg-boss
- **Package manager**: the Template Engine — install a CRM, a second brain, a content pipeline with one click
- **File system**: the Entity graph — every "file" is an entity, every "folder" is a view, every "shortcut" is a relationship

The analogy isn't cosmetic. It guides decisions: apps don't own data (they query entities), views are lenses not copies, and AI is a privileged process that still needs user authorization.

---

## The Pod Architecture

Every deployment of Synap is a **data pod** — a fully self-contained backend instance.

```
┌────────────────────────────────────────────────┐
│                   Data Pod                      │
│  ┌──────────┐  ┌──────────┐  ┌────────────┐    │
│  │ tRPC API │  │ Realtime │  │  Jobs      │    │
│  │ (tRPC11) │  │ Socket.IO│  │ (pg-boss)  │    │
│  │          │  │ + Yjs    │  │            │    │
│  └────┬─────┘  └────┬─────┘  └─────┬──────┘    │
│       │              │              │            │
│  ┌────▼──────────────▼──────────────▼─────────┐ │
│  │                 PostgreSQL                  │ │
│  │  entities · channels · views · workspaces  │ │
│  │  documents · profiles · proposals · events │ │
│  └────────────────────────────────────────────┘ │
└────────────────────────────────────────────────┘
```

Every pod runs identical open-source code. Synap Cloud provisions and operates the pod; self-hosted pods use the same Docker images.

### Cloud vs. Self-hosted

| | Synap Cloud | Self-hosted |
|--|-------------|-------------|
| Domain | `your-pod.synap.live` | `data.yourcompany.com` |
| Provisioning | One-click | Docker Compose |
| Backups | Automatic (daily, S3) | Your responsibility |
| Updates | Auto-pushed | `git pull && rebuild` |
| Intelligence service | Synap-managed (default) | Any Hub-compatible service |
| Privacy | Synap infra | 100% on your infra |
| Cost | Subscription tier | Your infra costs only |

### Control Plane

A thin coordination layer (`synap-control-plane-api`) handles cloud operations only:
- Provisions pods (DNS via Cloudflare, SSL via Let's Encrypt)
- Manages subscriptions (Stripe) and transactional emails (Resend)
- Monitors pod health

Pods function fully independently if the control plane is down. It is not in the hot path.

---

## Data Model

### Entity — the universal unit

Everything in Synap is an **Entity**.

```typescript
Entity {
  id:            UUID
  type:          string           // determined by profile
  title:         string
  preview:       string
  properties:    JSONB            // typed, schema-validated, index-friendly
  documentId:    UUID | null      // rich-text or canvas content (optional)
  relationships: Relation[]       // typed, bidirectional edges
  workspaceId:   UUID
  version:       number           // optimistic locking
}
```

A task and a contact and an event are all entities. They share the same query interface, the same relationship model, and the same view system. There is no special-casing.

### Profiles — entity types as configuration

A Profile defines an entity type:

```typescript
Profile {
  slug:          string           // "task", "contact", "project"
  displayName:   string
  scope:         "system" | "workspace" | "shared" | "user"
  defaultValues: JSONB            // property defaults at creation time
  parentProfileId: UUID | null    // inheritance
  uiHints:       JSONB            // icon, color, layout hints
}
```

- **System profiles**: `task`, `note`, `project`, `contact`, `event`, `idea`, `meeting` — built-in, available everywhere
- **Workspace profiles**: custom types created by workspace admins
- **Shared profiles**: explicitly granted to multiple workspaces (e.g., a CRM profile shared across team + personal)
- **User profiles**: personal entity types

`defaultValues` is resolved at entity creation time — the profile's defaults are merged with the caller's input, so new entities always have valid initial state.

### Property System

Properties flow through a four-step chain from definition to display:

```
Profile
  └── PropertyDef links (profile_properties)
        └── entity.properties JSONB  ← stored here at runtime
              └── Field System renders  ← @synap/entity-card
```

**PropertyDef** defines a field — its slug, value type, constraints, and UI hints. Slugs are profile-scoped, so `status` means something specific to a `task` profile and something different on a `contact` profile.

**profile_properties** links a PropertyDef to a Profile with display configuration: required, defaultValue, displayOrder.

**entity.properties** is a JSONB object on every entity row. Values are written here at runtime, validated against the linked PropertyDefs.

**Field System** (`@synap/entity-card`, `@synap/property-renderer`) is the single rendering source of truth. Every view type — table column, kanban card, bento widget, entity form — renders property values through the same field components. Auto-detection scores field importance (frequency, value density, type) so views can pick smart defaults without manual configuration.

Value types: `string`, `number`, `boolean`, `date`, `entity_id`, `array`, `object`, `secret`
Constraints: min/max, enum values, regex, format
UI hints: label, icon, input type, placeholder, display width

### Relationships (Knowledge Graph)

Entities link with typed, bidirectional edges:

```
Task "Close Q1" --[depends_on]--> Task "Board sign-off"
Contact "Sarah" --[assigned_to]--> Project "Rebrand"
Document "Spec" --[mentions]--> Task "Write tests"
```

Built-in types: `assigned_to`, `mentions`, `links_to`, `parent_of`, `relates_to`, `depends_on`, `blocks`, `created_by`. Custom types are supported.

### Documents (infrastructure layer)

Documents are **backing stores for content, not a user-facing concept**. Users don't "create documents" in Synap — they create entities (which may have a rich-text body) or open a whiteboard (which uses a canvas document). The document is the implementation detail underneath.

Two content modes:
- **Rich text** (TipTap 3 / ProseMirror): entity body, document-type entities, comments
- **Canvas** (Tldraw 2.0): whiteboard and mindmap views

Both use **Yjs CRDTs** for real-time multi-user editing with no merge conflicts. Updates stream via Socket.IO and persist to MinIO/R2, with a PostgreSQL row for metadata and versioning.

**Design constraint**: only `canvas` view types (whiteboard, mindmap) create a document backing store. Structured views (kanban, table, list), bento dashboards, and most entities have `documentId: null` — zero document overhead. The CRDT + MinIO infrastructure is only instantiated when the content actually needs it.

---

## Views — any lens on the same data

Every view type queries the same entity graph. Switching views never moves data.

| View | Best for |
|------|----------|
| **Table** | Spreadsheet-style, sortable, inline edit |
| **Kanban** | Status-based drag-and-drop boards |
| **List** | Fast linear scanning |
| **Grid** | Card grid, image-friendly |
| **Calendar** | Date-based scheduling |
| **Timeline** | Date-range based planning |
| **Graph** | Node-link relationship explorer |
| **Whiteboard** | Freeform canvas (Tldraw) |
| **Mindmap** | Hierarchical branching |
| **Bento** | Composable dashboard grid |

### Bento Dashboards

The bento grid is the flagship composition surface. Any workspace (or entity) can have a bento view as its primary display. A bento layout is a JSONB config of **blocks** arranged on a responsive grid (react-grid-layout):

```typescript
BentoViewConfig {
  blocks: BentoBlock[]
}

BentoBlock {
  id:         string
  widgetType: string          // registered widget key
  pos:        { x, y, w, h } // grid position
  config:     JSONB           // widget-specific config
}
```

**Widget registry** (`@synap/views-bento`): 14+ built-in widgets + runtime-registered widgets from feature packages:

| Widget | Description |
|--------|-------------|
| `welcome-header` | Workspace welcome, clock, quick actions |
| `entity-list` | Filterable entity list with inline creation |
| `recent-entities` | Recently modified entities |
| `quick-capture` | Single-field entity creation |
| `stats-counter` | Aggregated entity count/sum |
| `entity-header` | Entity name, type icon, status badge |
| `entity-properties` | Full property display for parent entity |
| `view-kanban` | Full KanbanAdapter embedded in a widget |
| `view-table` | Full TableAdapter in a widget |
| `view-list` | Full ListAdapter in a widget |
| `view-calendar` | CalendarAdapter in a widget |
| `view-timeline` | TimelineAdapter in a widget |
| `entity-content` | Related entities (notes, tasks) as a sub-board |

**Error boundaries**: every widget is wrapped in a `WidgetErrorBoundary`. A crashed widget shows a compact error card — the rest of the dashboard continues rendering.

**Unknown widgets**: `UnknownWidgetPlaceholder` renders for unregistered widget types, with widget key, app-detection logic, and a marketplace CTA.

### Entity Bento Mode

Any entity can have its own bento dashboard. Toggle between Document and Dashboard modes:

- **Document mode** (default): entity + attached rich-text document
- **Dashboard mode**: entity rendered as a bento grid

First switch to Dashboard → backend auto-creates a bento view with `entity-header` + `entity-properties` default blocks, linked via `entity.metadata.bentoViewId`. The toggle is in the entity header; access is write-gated.

### Field System

`@synap/entity-card` is the single rendering source of truth for property values across every view type. Auto-detection scores field importance so views pick smart defaults without configuration.

---

## Channels — interaction layer

Channels are the conversational fabric of Synap. They replaced the earlier "threads" model with a richer, multi-modal interaction system.

```typescript
Channel {
  id:          UUID
  type:        ChannelType
  workspaceId: UUID
  name:        string
  contextItems: ChannelContextItem[]   // linked entities or documents
}
```

### Channel types

| Type | Description |
|------|-------------|
| `ai_thread` | Conversation with the AI — main channel type |
| `branch` | A fork of an ai_thread exploring an alternative path |
| `entity_comments` | Inline comments on an entity (Notion-style) |
| `document_review` | Review thread anchored to a document |
| `view_discussion` | Discussion about a specific view |
| `direct` | Human-to-human direct message |
| `external_import` | Messages relayed in from external platforms |
| `a2ai` | Agent-to-agent async communication (graph topology) |

### AI triggering

Channels of type `ai_thread` or `branch` automatically invoke the Intelligence Hub when a human message is sent. All other types bypass AI. No flag required — the channel type is the discriminator.

### Streaming

The AI response is streamed via SSE:
- `chunk` — text token
- `step` — tool execution step
- `branch_decision` — AI chose to create a branch
- `complete` — run finished, may include `createdProposals[]`
- `error` — error with recovery hints

### Branch management

Creating a branch from an `ai_thread` forks the conversation at a specific message. Branches are full channels with their own history. Navigation between branches is visual (tree structure).

---

## Intelligence Hub

A separate Hono server (`synap-intelligence-service/apps/intelligence-hub/`) is the AI brain. The Data Pod has zero intelligence — it governs. The Hub thinks.

### Agent architecture — a peer network, not a hierarchy

The Intelligence Hub runs a **network of peer agents**, not a single orchestrator that delegates to sub-processes. Each agent is an autonomous reasoning unit with its own tools, context window, and decision loop. Agents route to each other based on intent — no agent has god-status.

```
User message
     │
     ▼
Intent Analyzer ──► Entity Extractor
     │
     ├──► Researcher ──► Knowledge Search
     │
     ├──► Code Agent
     │
     ├──► Writing Agent
     │
     └──► Action Agent ──► Hub Protocol (Data Pod)
```

Any agent can invoke any other agent as a tool call. An agent can also **spawn a channel** to continue reasoning asynchronously — this is the A2AI (agent-to-agent) pattern: agents send messages to each other through channels with full persistence, branching, and replay.

Current agents:

| Agent | Role |
|-------|------|
| Intent Analyzer | Extracts goals, routes to the right agent(s) |
| Entity Extractor | Auto-creates entities from conversation |
| Researcher | Deep investigation and synthesis |
| Code Agent | Generate, explain, review code |
| Writing Agent | Drafts, rewrites, summarizes |
| Action Agent | Executes approved Hub Protocol calls |
| Knowledge Search | Semantic + full-text search across entities |
| Meta Agent | Self-reflection, replanning, error recovery |

**Why no master orchestrator?** A central controller is a bottleneck and a single point of failure. In a peer model, agents compose: the Researcher can ask the Writing Agent to format its output, the Code Agent can ask Knowledge Search to find relevant entities, and none of this requires a coordinator. The Data Pod's governance layer is the control surface — not an agent.

### Agent Users

Agents are first-class citizens in the permission model. Each agent type has a corresponding **user row** (`userType: "agent"`) in the users table with a workspace membership and an RBAC role. Agents operate under the same governance rules as humans.

```
agent-{agentType}-{shortId}@synap.agent
```

### Hub Protocol (API for external AI)

Any external AI service can connect to a pod via the Hub Protocol — a standard API that gives AI controlled, scoped access:

```
External AI (OpenClaw, GPT, local model, ...)
  ↓  API key (user-granted, scoped)
POST /trpc/hubProtocol.createEntity   → propose or auto-approve
POST /trpc/hubProtocol.searchEntities → read-only search
POST /trpc/hubProtocol.createChannel  → open a channel
```

Hub Protocol API keys auto-brand every request: `source: "intelligence"`, `isHubProtocol: true`. The branding cannot be spoofed. Write routes accept an optional `agentUserId` to attribute actions to a specific agent user.

### AI Governance — the proposal model

This is the core safety primitive:

```
AI calls hubProtocol.createEntity
  → checkPermissionOrPropose(ctx)
      → if action in autoApproveFor[]:
          → execute immediately, return entity
      → else:
          → write proposal row to DB
          → return { status: "proposed", proposalId }
          → user sees proposal in inbox
          → approve → worker executes
          → deny   → proposal closed, reason logged
```

Default `autoApproveFor` whitelist: `["search.*", "memory.recall", "entity.read", "document.read", "context.*"]`. Glob patterns supported. Configurable per workspace.

Every AI decision is logged. The audit trail is immutable.

### External Connections — three kinds

External connectivity in Synap follows three distinct patterns. Understanding which is which prevents confusion:

```
┌──────────────────────────────────────────────────────────────────┐
│  1. Intelligence Services       │  What AI brain handles requests │
│  2. External Channels           │  Where conversations come from  │
│  3. Tool Protocols (MCP)        │  What tools AI can use          │
└──────────────────────────────────────────────────────────────────┘
```

**1. Intelligence Services** — swap the AI brain

Each workspace can point at a different AI backend via the Hub Protocol:

| Service | Description |
|---------|-------------|
| Synap IS (default) | Synap-managed, Claude-based, zero setup |
| ZeroClaw | One-click provisioned add-on, Hub Protocol |
| OpenClaw | Community open-source agent runtime, `synap-os` skill |
| Custom | Any HTTP service implementing Hub Protocol |

The `@synap/agent-service` package manages connected services: `useAgentServices()`, `ServiceChip`, `ServiceCard`. Users switch the active service from the intelligence settings panel.

**2. External Channels** — relay conversations

External platforms relay messages in through `external_import` channels:

| Platform | Status | Notes |
|----------|--------|-------|
| Telegram | Planned (next) | Free API, 1–3 days to wire |
| Slack | Planned | Bolt SDK, 3–7 days |
| WhatsApp | Planned | Meta approval 4–8 weeks |
| Discord | Planned | via OpenClaw channels |
| Custom webhook | Schema ready | `createExternalChannel` Hub Protocol call |

Architecture: external message → webhook receiver → normalized `Message` row → `external_import` channel → AI sees and responds → response relayed back through originating platform.

**3. Tool Protocols** — expand what AI can do

The Intelligence Hub connects to external MCP (Model Context Protocol) servers as a client — one integration unlocks the entire MCP ecosystem:

| Server | What it provides |
|--------|-----------------|
| `@playwright/mcp` | Browser automation (accessibility tree, no vision needed) |
| `server-filesystem` | Scoped file system read/write |
| `server-postgres` | Direct database queries |
| Slack MCP | Read/write Slack messages |
| `whatsapp-mcp` | WhatsApp web multi-device |
| `mcp-server-git` | Git operations |

Synap will also **expose itself as an MCP server** — Claude Desktop, Cursor, and ChatGPT will be able to query your entity graph, create entities, and open channels through the standard MCP protocol.

---

## Template Engine

The template engine provisions complete workspace configurations from a JSON definition:

```
Template JSON
  → WorkspaceProposal.layoutConfig
  → execute() creates:
      - profiles (entity types)
      - property definitions
      - views (home dashboard, main views)
      - workspace settings (layout, sidebar items)
```

### Built-in templates

| Template | Profiles | Views |
|----------|----------|-------|
| **CRM** | deal, contact, company | Pipeline (kanban), Contacts (table), Companies (table), Activity (timeline) |
| **Second Brain** | note, project, reading | Notes (list), Projects (kanban), Reading (table), Graph |
| **Content OS** | campaign, idea, asset | Calendar, Pipeline, Ideas (kanban), Campaigns (table) |
| **Project Management** | task, milestone | Board (kanban), Timeline, Tasks (table) |
| **Personal** | note, task | My Tasks, Notes |
| **Blank** | — | Empty dashboard |

Every template provisions:
1. A home bento dashboard with at least a `welcome-header` widget
2. Sidebar navigation items for the browser app
3. Workspace `settings.layout` for the Electron app's pinned apps

### Profile scoping in templates

Templates use `shared` scope profiles to avoid slug collisions when a user applies multiple templates. A shared profile is created once and granted access to each workspace — property definitions are reused, not duplicated.

---

## Browser (Electron App)

A dedicated Electron application provides the desktop OS experience:

- **Activity bar**: left-side icon nav — Dashboard, Browser (Chromium webview), Whiteboard, Documents, Data, Intelligence, Terminal
- **Workspace sidebar**: template-configured items (e.g., CRM's "Pipeline", "Contacts") rendered as nav items
- **View resolution**: sidebar items resolve to actual view IDs lazily on click via `trpc.views.list.fetch`
- **Connections**: Data Pod connection management, health indicator in header
- **Settings**: per-workspace + per-profile configuration

The browser is a full Chromium webview within the app. Users can browse the web, use web apps, and Synap's AI can interact with them (via future MCP/Playwright integration).

---

## Real-Time Collaboration

```
Frontend
  ├── Presence socket   (who's online, cursors, typing indicators)
  └── Yjs socket        (document/canvas content, CRDTs)
          ↓
  Realtime Service (Socket.IO + Yjs)
          ↓
  PostgreSQL + MinIO (persistence)
```

- **Yjs CRDTs**: structural conflict resolution — simultaneous edits always produce a valid merge
- **Presence**: live cursors, typing indicators, user avatars
- **Auto-save**: every 10s during active editing; snapshot on last user disconnect
- **Offline support**: changes queue locally, sync on reconnect

---

## Security Model

### Authentication — Ory Kratos

Registration, login, MFA, session management via Ory Kratos. The frontend proxies API calls same-origin — no CORS, no token passing across domains, cookies are first-party.

### Authorization — RBAC + Proposals

| Action | Owner | Admin | Editor | Viewer |
|--------|:-----:|:-----:|:------:|:------:|
| Read content | ✓ | ✓ | ✓ | ✓ |
| Create/edit entities | ✓ | ✓ | ✓ | — |
| Delete entities | ✓ | ✓ | — | — |
| Manage members | ✓ | ✓ | — | — |
| Delete workspace | ✓ | — | — | — |

`checkPermissionOrPropose()` is called at the top of every mutation. It grants, denies, or creates a proposal. Role overrides are configurable per workspace.

### Data isolation

Each pod is a separate database. No shared multi-tenant database. Users on different pods cannot access each other's data at any infrastructure level.

### Invite security

256-bit random tokens, 7-day expiry, single-use, revocable at any time. Pod-to-control-plane communication uses a shared secret header.

---

## Event System & Audit Log

Synap is event-sourced. Every state change emits an immutable event before any database mutation.

```
{table}.{action}.{phase}
e.g.:  entities.create.completed
       proposals.approve.completed
```

The `events` table is the audit log:
- Immutable — never updated or deleted
- Every record: userId, action, timestamp, subjectId, metadata
- Metadata captures approval chain: who approved, auto vs. manual
- Full replay available for compliance or debugging

Background workers run via **pg-boss** (PostgreSQL-backed job queue):
- No separate Redis or broker
- Workers: search indexer, relation builder, webhook dispatcher, workspace initializer, email relay

---

## Command Palette (Raycast-style)

Universal command palette (`Cmd+K`) with a scope system:

| Prefix | Scope |
|--------|-------|
| `e:` | Search entities |
| `v:` | Switch view |
| `cmd:` | Run command |
| `t:` | Jump to template |
| `d:` | Search documents |
| `/`, `>` | Slash commands |

Feature packages register panels via `registerPalettePanel()`. The palette is extensible without touching core code.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16.1 (App Router), React 19 |
| UI system | Tamagui 1.141 (Amber/Cyan design system) |
| API | tRPC 11 (end-to-end type safety) |
| State | Zustand 5 + TanStack Query 5 |
| Real-time | Socket.IO 4.8 + Yjs 13.6 |
| Rich text | TipTap 3 (ProseMirror) |
| Whiteboard | Tldraw 2.0 |
| Auth | Ory Kratos 1.3 |
| Database | PostgreSQL 15+ |
| ORM | Drizzle ORM 0.45 |
| Jobs | pg-boss 10 |
| Storage | MinIO (S3-compatible) / Cloudflare R2 |
| Build | pnpm monorepo, Turborepo |
| Language | TypeScript 5.9 throughout |
| Desktop | Electron (via electron-vite) |
| AI | Claude (Anthropic), extensible via Hub Protocol |
| Protocol | MCP (Model Context Protocol) — client + server |

---

## Tiers & Pricing

| Tier | Users | Storage | AI | Price |
|------|-------|---------|-----|-------|
| **Solo** | 1 | 5 GB | Synap IS | $12/mo |
| **Pro** | 5 | 25 GB | Synap IS | $29/mo |
| **Team** | 25 | 100 GB | Synap IS | $79/mo |
| **Enterprise** | Unlimited | Custom | Custom | Custom |

Self-hosted is free. You pay only for Synap-managed infrastructure.

---

## Marketing Copy

### Hero

> **Your AI OS. Your rules.**
>
> Synap is the workspace where everything you know — tasks, contacts, documents, ideas — lives in one open model. AI surfaces patterns and proposes actions. You approve. Your data, your infrastructure, your call.

### Sub-headline

> Run it on your server or let us host it. Either way, you own the database.

### Feature pillars

---

**One model for everything you know**

Tasks, notes, projects, contacts, meetings — in Synap they're all entities in the same graph. A task can mention a contact, depend on another task, and link to a document. View them as a table, a kanban board, a timeline, or a bento dashboard. The data never moves. Only the lens changes.

---

**Dashboards, not just lists**

The bento grid turns any workspace or entity into a composable dashboard. Embed kanban boards, calendars, entity tables, stats counters, and AI chat panels in a single view. Drag to resize. No code.

---

**AI that works with you, not around you**

Connect any AI service — Synap's built-in agents, a local model, an open-source agent runner, or a custom service. Every AI-suggested change goes through a proposal queue. You review it, approve or deny it, and every decision is logged. No surprise overwrites. No black boxes.

---

**Conversations as first-class objects**

Channels aren't just chat boxes. Branch a conversation to explore an alternative without losing the main thread. Attach entity context to a channel. Review document changes inline. Relay messages from Telegram, Slack, or WhatsApp — all with the same AI understanding your data.

---

**Open and self-hostable from day one**

The data pod is open source. Deploy with Docker Compose. Your data lives in a plain PostgreSQL database you can inspect, export, and back up yourself. No vendor lock-in. No data held hostage.

---

### One-liners

- *"Your data. Your AI. Your rules."*
- *"The workspace OS where AI asks before it acts."*
- *"All your data. One model. Any AI."*
- *"Everything you know, in one open graph."*
- *"From spreadsheet replacement to workspace OS."*
