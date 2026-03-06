# Synap — GTM & Product Context

> This document is designed to be given to an advisor, investor, or AI assistant to enable
> deep strategic conversations about positioning, go-to-market, and business model without
> requiring a full technical walkthrough.
>
> Last updated: March 2026

---

## What Is Synap in Plain Language

Synap is an **AI-native operating system for knowledge work** — a workspace where every piece
of information you produce (tasks, notes, contacts, documents, events, ideas) lives in a single
shared data model, can be visualized any way you need, and can be acted on by AI that proposes
before it changes anything.

The problem Synap solves: people use 5–10 tools (Notion, Linear, HubSpot, Slack, Google Docs,
Airtable...) that each manage a slice of the same underlying graph of their work. Those tools
don't share data, don't talk to each other, and their AI features have no shared understanding
of the whole picture. Synap replaces the per-tool silos with one data layer underneath everything.

**In one sentence:** Synap is the workspace OS that gives individuals and small teams a single
sovereign data layer, any visualization they need, and AI that can write to that data under
human governance.

---

## The Three Primitives

Everything in Synap reduces to three composable concepts:

### 1. Entities — the data layer

A task, a contact, a meeting note, a CRM deal, a calendar event, a research idea — they are all
**entities** in the same graph. Typed by "profiles" (configurable schemas), related by typed
bidirectional edges, stored in PostgreSQL, owned by the user.

This is fundamentally different from:
- **Notion**: pages in a hierarchy. You can put a database in a page, but there's no relationship
  graph across pages. Cross-page queries are fragile. The model is "document with properties",
  not "object with relationships."
- **Airtable**: tables with foreign key links. You CAN build relationships, but each table is its
  own silo. A contact in the CRM table and a contact in the events table are different rows, not
  the same entity. There's no unified object model.
- **Linear / Jira**: single-purpose. Tasks exist; nothing else does. You can't make a "meeting"
  that has tasks and involves contacts from a CRM and lives inside a project — at least not in
  the same data model.

In Synap: "show me all tasks assigned to people I've met this quarter, grouped by project, filtered
to those blocking a deadline" is a single query. In any of the above tools, it requires exporting
and joining spreadsheets.

### 2. Views — the visualization layer

A view is a **lens on the entity graph, never a copy of it**. Kanban, Table, Calendar, List,
Graph, Bento dashboard — they all query the same entities. Switch view types without moving
data. Embed views inside other views (a kanban inside a bento block). Make any entity itself
a dashboard (entity bento mode).

The **Bento view** is the key differentiator here:
- Any layout you want, configured as a grid of widgets
- Widgets can be: entity details, view runners (kanban/table/calendar as a block), documents,
  browser tabs, stats, quick-capture — anything
- This is what lets you build a full CRM dashboard for a specific contact, or a command center
  for a project, not just a flat list
- Community/marketplace widgets via MCP (planned): GitHub PR status, Linear issues, Stripe
  revenue — any data source as a bento block

No competitor has this combination: a graph data model + arbitrary dashboard composition.
Notion has dashboards but no graph. Power BI has dashboards but no entity model. Coda is close
but document-first and doesn't have the channel/AI layer.

### 3. Channels — the interaction layer

A channel is where humans and agents interact with and through entities. Channel types:
- `ai_thread`: conversation with AI, grounded in entity context items
- `branch`: fork a conversation to explore alternatives (like git branch for reasoning)
- `entity_comments`: inline discussion anchored to a specific entity
- `document_review`: review thread for a document
- `external_import`: relay for messages from Telegram, Slack, WhatsApp (in progress)
- `a2ai`: agent-to-agent async communication (spec complete)
- `direct`: human-to-human messaging within the workspace

This is different from:
- **Slack/Discord**: great for human communication, no data model underneath. You can't say
  "discuss this deal" and have the AI automatically know what entities are relevant.
- **ChatGPT/Claude**: great AI, no workspace integration. You manually paste context every time.
- **Notion AI / Linear AI**: AI bolted onto a single tool. The AI only knows about what's in
  Notion or Linear — not the whole picture.

In Synap: when you open a channel, you attach entities as context items. The AI knows exactly
which task, which contact, which document you're discussing. When it proposes a change, you see
what it wants to do and approve it.

---

## The AI Governance System

This is the most defensible architectural decision in Synap, and the one most competitors
will not replicate because it requires rethinking the whole product.

**The proposal model:**
1. AI executes a tool (create entity, update property, write document)
2. The backend intercepts, creates a "proposal" row with full metadata
3. User sees proposal in inbox: accept or reject, with reason
4. Every decision is immutably logged in the event ledger
5. Power users configure `autoApproveFor[]` globs for low-risk operations

**Why this matters:**
- Most AI tools treat "AI writes to your data" as a feature. It becomes a liability at scale.
- As AI agents get more capable, the damage from unsupervised writes grows
- Enterprise buyers specifically ask for audit trails and human-in-the-loop guarantees
- The proposal system is built in from the start — it's the protocol, not a checkbox

**Agents are first-class users:**
- Every AI agent is a row in the `users` table with workspace RBAC roles
- Agents can be workspace members — same permission system as humans
- Multi-agent: an orchestrator AI can spawn specialist agents (research, writing, data analysis)
  that each operate within their permissions

---

## The Open-Core Model

Synap is built as an **open-core product**. This is a deliberate strategic choice.

### What is open source (the Data Pod)
- The backend: `synap-backend` — entity model, channel model, Hub Protocol, permission system,
  event sourcing, proposal queue, all tRPC API routes
- Core PostgreSQL schema: entities, channels, views, proposals, profiles, events
- The Hub Protocol spec: the open API contract any intelligence service can implement
- Self-deployable via Docker Compose

### What is proprietary (the product layer)
- The Electron browser app (the "OS desktop")
- The template marketplace and built-in templates
- The control plane: provisioning, subscriptions, billing, domain management
- The Intelligence Hub (the managed AI service)
- The Bento widget marketplace (planned)

### Why open-source the backend
1. **Trust**: Enterprise and technical users won't send sensitive data to a fully closed system.
   Open source means they can audit the code before connecting it to their data.
2. **Community adoption**: Self-hosters become advocates. They build integrations, report bugs,
   and push the ecosystem forward.
3. **The Hub Protocol moat**: If the backend becomes a standard, other AI services compete to
   connect to it. That creates a defensible ecosystem, not just a product.
4. **Against the large players**: Notion, Airtable, Linear will never open-source their core.
   That's a permanent trust advantage for Synap.

### The moat
The moat is not the code — the code is open. The moat is:
1. **The data network**: once your entities live in a pod, everything connects to them. Switching
   cost is very high.
2. **The governance guarantee**: the proposal system with immutable audit log is hard to add
   retroactively to an existing product.
3. **The ecosystem**: Hub Protocol + MCP client = any AI service can connect, but Synap managed
   the data governance. This is like how AWS S3 became the standard — not by being proprietary,
   but by being the default connection point.

---

## Go-To-Market: Three Beachheads

### Beachhead 1: The Technical Founder / Solo Operator

**Profile**: Solopreneur, indie hacker, or technical founder managing their whole business
from one tool. Currently using Notion + Linear + Airtable + some CRM + random AI tools.

**Pain**: Tool sprawl. Data lives in 5 places. AI in each tool only knows about that tool.
Building automations across tools is brittle (Zapier, n8n). Monthly SaaS spend is $200–500.

**Why Synap wins**: Self-hostable (no SaaS fees after setup), one data model for everything,
AI governance built in (no "the AI deleted my stuff" horror stories), Bento dashboards let
them build the exact view they need without hiring a developer.

**Template**: "Second Brain" (personal knowledge management) or "Project Management OS" or
"CRM" — all one-click install.

**Pricing angle**: Free tier (self-hosted) or $15/mo (Synap Cloud, no per-seat overhead).
Compare to $50+/mo for a CRM + $10/mo for Notion + $8/mo for Linear = $68+/mo for less.

---

### Beachhead 2: The Small Sales or Consulting Team (5–20 people)

**Profile**: Small B2B company, agency, or consulting firm. Currently using HubSpot or
Pipedrive for CRM, Notion or Confluence for knowledge, some combination of tools for
project tracking.

**Pain**: CRM data and project data are siloed. When a deal closes, the project lives in
a different tool with no connection to the client entity. AI in HubSpot knows HubSpot data.
AI in Notion knows Notion data. Nobody has the full picture.

**Why Synap wins**: The CRM template provisions contacts, companies, deals, activities, pipeline
as entities that are automatically related. When a deal closes and you create a project, it's
linked to the same contact and company. Your AI assistant can ask "what did we promise the
client in the last 3 meetings" and actually find the answer because meetings, notes, and the
deal are all entities in the same graph.

**Pricing angle**: $25–40/user/mo for the team plan. This is less than HubSpot Starter
($50/user) while being broader (CRM + project + knowledge + AI).

---

### Beachhead 3: The AI-Native Power User / Agent OS

**Profile**: Developer, researcher, or AI enthusiast managing their own fleet of AI agents.
Currently using OpenClaw, n8n, or custom scripts. Wants structured output from agents, not
just chat logs.

**Pain**: Agents produce text and logs. There's no structured data store that agents write
to with governance. Running 10 background agents means 10 random side effects with no
audit trail.

**Why Synap wins**: Agents are workspace members. They write to entities, not to flat files.
Every write goes through the proposal queue — you review what they did. The bento dashboard
gives you a real-time view of agent activity. A2AI channels let agents hand off to each other
with structured context.

**Pricing angle**: Same solo plan + ZeroClaw/OpenClaw integration (one-click provision).
This is the "Agent OS" template use case.

---

## Revenue Model

### Synap Cloud (primary)

| Tier | Price | Target |
|------|-------|--------|
| Solo | $0/mo free trial → $15/mo | Individual, technical users |
| Pro | $25/user/mo | Small teams, 2–10 seats |
| Team | $35/user/mo | Growing teams, 10–50 seats |
| Enterprise | Custom | Large orgs, self-hosted + support |

### Self-Hosted (community / enterprise)

- Free forever for personal use (the code is open-source)
- Enterprise support contract: $2,000–10,000/year for SLA, priority bug fixes, custom training
- Enterprise single-tenant cloud: dedicated infrastructure on Synap (not shared cloud)

### Marketplace (future)

- Widget marketplace: 30% revenue share on paid widgets
- Template marketplace: 30% revenue share on paid templates
- Intelligence service marketplace: Hub Protocol certified services pay a listing fee

---

## Current State: What Works Today (March 2026)

**Fully working:**
- Entity model with profiles, property definitions, typed relationships
- 8 view types: Table, Kanban, List, Grid, Calendar, Timeline, Graph, Whiteboard
- Bento dashboard with 14+ widgets + view-runner widgets (kanban/table/calendar as blocks)
- Entity bento mode: any entity can become a dashboard
- All channel types: ai_thread, branch, entity_comments, document_review
- AI streaming with SSE (chunk, step, branch_decision, complete events)
- Proposal system: full governance loop (propose → review → approve/reject → log)
- Agent users: agents as workspace members with RBAC
- Template engine: 6 templates (CRM, Second Brain, Content OS, PM OS, Personal, Agent OS)
- Electron browser app with template-driven workspace sidebar
- Control plane: account management, pod provisioning, billing (Solo tier)
- ZeroClaw integration: one-click provision and Hub Protocol connect

**In progress (3–6 months):**
- MCP client in Intelligence Hub (unlocks 10,000+ community tools)
- External channel relay (Telegram inbound/outbound — 1–3 weeks)
- Background agents (run overnight, propose in the morning)

**Not yet built:**
- Widget marketplace
- MCP-backed widgets
- Native mobile app
- AI-generated widgets
- Enterprise SSO / SAML

---

## Key Competitive Comparison

| Capability | Synap | Notion | Airtable | Linear | HubSpot |
|-----------|-------|--------|----------|--------|---------|
| Unified entity graph | ✅ | ❌ pages | ❌ tables | ❌ tasks only | ❌ CRM only |
| Any view type | ✅ 8 types | ✅ several | ✅ several | ✅ few | ❌ |
| Bento dashboard composition | ✅ | ❌ | ❌ | ❌ | ✅ (limited) |
| AI with governance (proposals) | ✅ | ❌ AI writes directly | ❌ | ❌ | ❌ |
| Channels / AI conversations | ✅ typed + context | ❌ inline AI | ❌ | ❌ | ❌ |
| Agent-to-agent communication | ✅ A2AI channels | ❌ | ❌ | ❌ | ❌ |
| External messaging (Telegram etc.) | 🚧 | ❌ | ❌ | ❌ | ✅ (email only) |
| Self-hostable | ✅ Docker Compose | ❌ | ❌ | ❌ | ❌ |
| Open source backend | ✅ | ❌ | ❌ | ❌ | ❌ |
| MCP client (tool integration) | 🚧 | ❌ | ❌ | ❌ | ❌ |
| Per-seat pricing | No for solo | Yes | Yes | Yes | Yes |

---

## The Pitch in Three Bullets

1. **The data problem**: every tool you use manages a slice of your work. They don't share.
   Synap is the single data layer that unifies everything — not another SaaS, an OS.

2. **The AI problem**: AI is powerful but dangerous when it has write access. Synap's proposal
   system means AI proposes, you approve, everything is logged. The only system built this way
   from the ground up.

3. **The sovereignty problem**: you shouldn't have to bet your business on a SaaS vendor's
   pricing decisions. Synap runs on your infrastructure. Standard PostgreSQL. Export everything
   at any time. No lock-in.

---

## What To Ask an Advisor / AI When Using This Document

After providing this context, useful questions:

- "Given these three beachheads, which should we focus on first for initial revenue?"
- "What's the strongest one-sentence comparison to make against Notion for a non-technical audience?"
- "What's the shortest path to $10k MRR from zero, given what's built today?"
- "What should the content strategy be for the open-source backend vs. the proprietary app?"
- "What enterprise objections will we face and how does the proposal system answer them?"
- "How do we price the Bento widget marketplace to maximize ecosystem growth vs. revenue?"
- "Which conference or community would be the best first 100-user acquisition channel?"
