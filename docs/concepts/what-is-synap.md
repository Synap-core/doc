# What is Synap?

**Synap is an AI operating system for knowledge work.**

Unlike traditional apps that each own a slice of your data (Notion for notes, Asana for tasks, Salesforce for CRM), Synap is built on a single open model that unifies all of it — and lets any AI work with it under your governance rules.

---

## The Triptych

Everything in Synap reduces to three composable concepts:

**Entities** — the data layer. Every piece of information is an entity in the same graph. Typed by profiles, related by edges, governed by permissions. One model for tasks, contacts, events, ideas, documents, and anything custom.

**Views** — the visualization layer. A view is a lens on the entity graph — never a copy. Switch between Table, Kanban, Calendar, Timeline, Graph, Whiteboard, and Bento dashboard with one click. The data never moves.

**Channels** — the interaction layer. Where you and AI talk about, with, and through your entities. An `ai_thread` is a conversation. A `branch` is a fork. `entity_comments` are inline notes. An `external_import` relays messages from Telegram or Slack.

These three compose freely:
- A channel can be anchored to a view
- A view can be embedded in a bento block
- An entity can become a dashboard (bento mode)

---

## Key Capabilities

### 🧱 [Building Blocks](./building-blocks) — your data, your schema
Profiles define entity types. PropertyDefs give each type typed, constrained fields. The field system renders properties consistently across every view. Build a CRM, a second brain, a content pipeline — from configuration, not code.

### 🌳 [Branching Conversations](./branching-conversations) — Git for thought
Fork a conversation at any point. Explore alternatives in parallel without polluting the main thread. Branch history is full and replayable.

### 🧠 [Knowledge Graph](./knowledge-graph) — typed, bidirectional edges
Entities link with typed relationships (`assigned_to`, `mentions`, `depends_on`, `parent_of`). AI can suggest connections. Query across domains: "all tasks assigned to contacts I met this quarter."

### 🤖 [Multi-Agent System](./multi-agent-system) — peer network, not hierarchy
A network of specialized agents (Researcher, Code Agent, Writing Agent, Action Agent) that route to each other based on intent. Any agent can invoke any other. No central orchestrator.

### 🔒 [Data Sovereignty](./data-sovereignty) — you own the kernel
A pod is a dedicated private server — PostgreSQL + pgvector, Typesense search, MinIO file storage, and the Synap backend — running on your infrastructure. Open formats (SQL, Markdown, S3). Self-hostable. Exportable at any time.

### 📡 [Hub & Spoke](./hub-and-spoke) — pluggable intelligence
Swap AI services per workspace. Connect external agents via Hub Protocol. MCP client unlocks 10,000+ community tools.

---

## What You Can Build

Because Synap is a platform with an open entity graph, the same infrastructure powers radically different use cases:

**Personal**: second brain, daily journal with AI insights, personal CRM, research assistant, habit tracker

**Team**: collaborative workspace, project management, knowledge base, meeting notes with summaries, team wiki

**Specialized**: CRM pipeline, legal case management, academic paper organizer, investment analysis, sales pipeline with AI

---

## How It Differs

| | Traditional SaaS | Synap |
|--|-----------------|-------|
| Data ownership | Vendor-owned | Your dedicated server (PostgreSQL + Markdown + S3) |
| AI | Bolt-on, single model | Pluggable, governed |
| View types | Fixed per app | 10+ on same data |
| History | Limited undo | Full event log |
| Entity model | Siloed per app | Unified graph |

---

**Start here**: [Quickstart](../getting-started/quickstart) — running in 10 minutes

---

:::info Learn more on the website
- [Synap homepage](https://www.synap.live) — discover the product at a glance
- [About Synap](https://www.synap.live/about) — the team, vision, and mission
:::
