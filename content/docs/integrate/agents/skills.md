---
title: Skills
description: Skill execution model and where skill definitions live in Synap backend/OpenClaw flows.
---

Skills package reusable agent capabilities into auditable execution units.

## What a skill does

- defines bounded actions and expected behavior
- maps calls to Hub Protocol/API operations
- keeps high-impact writes reviewable through governance

## Where skills are stored

Backend repository locations:

- Synap OpenClaw skill spec: [`skills/synap/SKILL.md`](https://github.com/Synap-core/backend/blob/main/skills/synap/SKILL.md)
- Companion docs: [`skills/synap/README.md`](https://github.com/Synap-core/backend/blob/main/skills/synap/README.md)

These are the concrete documents to reference when aligning agent behavior with current backend contracts.

## Invocation path

At runtime, skills typically call into Hub endpoints:

- `/api/hub/*` for structured operations
- `/v1/chat/completions` where OpenAI-compatible streaming is needed

Primary backend contracts:

- Hub router: [`packages/api/src/routers/hub-protocol-rest.ts`](https://github.com/Synap-core/backend/blob/main/packages/api/src/routers/hub-protocol-rest.ts)
- Chat-completions bridge route: [`packages/api/src/routers/channels.ts`](https://github.com/Synap-core/backend/blob/main/packages/api/src/routers/channels.ts)

## Continue

- [Build agents](/docs/integrate/development/ai/building-agents)
- [Skill invocation API flow](/docs/integrate/integrations/skill-invocation)
- [Team review skills](/team/platform/review-skills)
