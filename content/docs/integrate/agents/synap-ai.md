---
title: Synap AI
description: Built-in orchestrator and specialist agents inside your pod.
---

Synap ships with built-in intelligence that can reason over your data, operate in channels, and create governed proposals.

- orchestrator coordinates tasks and context
- specialists handle domain-specific work
- proactive behaviors can publish insights and nudges

## Where this lives in backend

- Hub Protocol router and agent-facing endpoints: [`packages/api/src/routers/hub-protocol-rest.ts`](https://github.com/Synap-core/backend/blob/main/packages/api/src/routers/hub-protocol-rest.ts)
- Intelligence control routes: [`packages/api/src/routers/intelligence.ts`](https://github.com/Synap-core/backend/blob/main/packages/api/src/routers/intelligence.ts)

See:

- [Agents overview](/docs/integrate/agents)
- [Build agents](/docs/integrate/development/ai/building-agents)
- [Team intelligence architecture](/team/intelligence/architecture)
