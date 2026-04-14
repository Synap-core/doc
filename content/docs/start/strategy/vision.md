---
sidebar_position: 1
---

> **What this page is:** Synap's **official product vision**—mission, core beliefs, strategic priorities, and long-term direction. For a shorter, narrative **philosophy** read, see [Vision & Philosophy](../vision.md).

# Vision

**The mission and long-term direction for Synap**

---

## Mission

**Build the operating system for human knowledge work.**

Synap gives people and organizations a single, open, self-hostable layer where all their information lives — tasks, contacts, documents, ideas, events — linked into a graph, visualized any way they need, and understood by AI that proposes before it acts.

The world doesn't need another SaaS tool that owns your data. It needs an OS where you own the kernel.

---

## Core Beliefs

### Data sovereignty is non-negotiable

Every deployment of Synap is a real backend — a data pod — running on your infrastructure or Synap's. The underlying database is standard PostgreSQL. You can inspect it, export it, and migrate away from Synap without losing anything. There is no proprietary data format, no import/export tax, no lock-in.

### Everything is an entity

Tasks and notes and contacts and events are not different products. They are different lenses on the same underlying graph. Unifying them unlocks queries the original tools never imagined: "show me all tasks assigned to people I've met this quarter, grouped by project, filtered to those blocking a deadline."

### AI proposes, humans approve

AI is powerful and getting more so. The governance model must scale with the capability. Every AI write action — create, update, delete — goes through a proposal queue. The user reviews, approves or denies, and every decision is immutably logged. Auto-approval whitelists let power users move fast while keeping the guarantee intact.

### Intelligence is a pluggable service

No single AI model will be best forever. No organization will trust a single provider with all their data. The Hub Protocol is an open contract: any AI service can connect to a pod and operate under the same governance rules. Synap-managed, self-hosted, open-source agents, or enterprise custom — all the same API.

### The OS metaphor is load-bearing

OS thinking means: apps don't own data (they query entities), views are lenses not copies, AI is a privileged process that still needs authorization, and the package manager (template engine) installs complete workspace configurations from a single definition.

---

## The Product Triptych

The entire product surface is organized around three composable concepts. We call this the triptych:

```
     Entities          Views           Channels
  ┌───────────┐    ┌───────────┐    ┌───────────┐
  │  The data │    │  The lens │    │  The      │
  │  Typed,   │◄───│  Any view │    │  voice    │
  │  related, │    │  on the   │◄───│  AI +     │
  │  governed │    │  graph    │    │  human    │
  └───────────┘    └───────────┘    └───────────┘
```

**Entities** are the data layer. Every piece of information — task, contact, event, idea, deal — is an entity in a shared graph. Typed by profiles, related by edges, governed by permissions. The entity graph is the source of truth.

**Views** are the visualization layer. A view is a lens on the entity graph — never a copy. Switch between Table, Kanban, Calendar, Bento, and Graph without moving data. Views are composable: embed a kanban inside a bento, anchor a view to an entity, create per-entity dashboards.

**Channels** are the interaction layer. A channel is where humans and agents interact with and through entities. An `ai_thread` is a conversation. A `branch` is a fork. `entity_comments` are inline notes. An `a2ai` channel is agents talking to each other. Channels know what entities they're about.

These three layers are independent but compose freely:
- A channel can be anchored to a view (discuss what you're looking at)
- A view can be embedded inside a channel (data alongside conversation)
- An entity can become a dashboard (bento mode — entity as a view)

Everything else — documents, templates, the intelligence service, the browser app, the event system — is infrastructure that **enables or extends** these three.

---

## Strategic Priorities (2026)

### 1. Intelligence ecosystem maturity

The hub-and-spoke model is defined. The next work:
- MCP client in Intelligence Hub → one integration unlocks 10,000+ community tools
- MCP server exposure → Claude Desktop, Cursor, ChatGPT can query Synap data
- OpenClaw integration → 5,700+ community skills, 13+ messaging channels
- Background agents via the proposal queue (propose while you sleep, approve in the morning)

### 2. Bento as the primary workspace surface

Bento dashboards are the right abstraction for compound views. The gap to close:
- View-runner widgets (kanban, table, calendar inside a bento block) are built
- Entity bento mode (entity as a dashboard, not just a document) is built
- Next: marketplace widget discovery, AI-generated widgets, MCP-backed widgets

### 3. External channel relay

The external_import channel type has its DB schema. The missing piece is the relay infrastructure:
- Inbound: webhook receiver normalizes messages from external platforms
- Outbound: Synap AI responses relayed back via the originating platform
- Priority: Telegram (1–3 days, free API) → Slack → WhatsApp (longer, Meta approval)

### 4. The browser as a workspace

The Electron app is a full Chromium browser inside the Synap workspace. The vision:
- Playwright/MCP integration lets AI interact with any web page the user is viewing
- Browser history becomes entities (context for AI)
- Web-based tools render inside Synap without leaving the workspace

---

## What Synap Is Not

- Not a general-purpose chat interface (channels are data-aware, not general assistants)
- Not a documents-first tool (documents are one content type, not the primary model)
- Not a no-code platform (profiles and views are configured, not coded, but this is an implementation detail not a product position)
- Not an automation platform (proposals are the unit of AI action, not n8n-style triggers)

---

## Long-Term Vision

In five years: every knowledge worker has a data pod. It's as normal as having an email server. AI agents from different providers compete to give you the best proposals. Your data travels with you between tools via open protocols (MCP, Hub Protocol). The workspace OS is the neutral party that no one vendor controls.

That's the mission. The tech stack today (open source, self-hostable, Hub Protocol, MCP) is built to make that world possible.

---

**Next**: See [Roadmap](./roadmap.md) for what's built and what's next.
