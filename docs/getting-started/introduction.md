---
sidebar_position: 1
---

# Introduction

Welcome to Synap — an **AI operating system for knowledge work**.

Synap gives you a single open data layer for everything you know: tasks, contacts, notes, events, documents, ideas. Visualize it any way you need. Let AI work with it under your governance rules. Own the infrastructure.

---

## The three concepts that make it work

| Concept | What it is |
|---------|-----------|
| **Entities** | Your data — typed, related, governed. Tasks, contacts, events: one model, one graph. |
| **Views** | Any lens on that data. Table, Kanban, Calendar, Graph, Bento dashboard — never a copy. |
| **Channels** | Where you and AI interact with and through entities. Conversations, branches, comments, external relays. |

Everything else — documents, templates, the intelligence service, the browser app — enables or extends these three.

---

## Three things that make it unusual

1. **You own the data.** A pod is a dedicated private server — PostgreSQL + pgvector, Typesense search, MinIO file storage — on your infrastructure or Synap's. Open formats (SQL, Markdown, S3). Exportable. No lock-in.
2. **Every write is on the event chain.** AI mutations go through proposals — you approve, reject, or edit. Every write from any source is recorded in an immutable event chain. Full audit trail, time-travel, rollback.
3. **The intelligence is pluggable.** Swap AI models per workspace (Claude, GPT-4, Gemini, local). Connect external agents via Hub Protocol. One wire adds 10,000+ MCP tools.

---

## Next steps

1. **[Quickstart](./quickstart)** — Running instance in under 10 minutes
2. **[What is Synap](../concepts/what-is-synap)** — The triptych in depth
3. **[Architecture Overview](../architecture/overview)** — Technical deep dive

---

:::info Learn more on the website
- [All guides](https://www.synap.live/guides) — practical walkthroughs for every Synap feature
- [Download Synap](https://www.synap.live/download) — get started with the desktop app
:::
