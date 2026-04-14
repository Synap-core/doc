---
title: OpenClaw
description: Connect OpenClaw to Synap backend with Hub Protocol, the synap skill, and provisioning flows.
---

OpenClaw is an external agent runtime. Synap backend is the sovereign data/governance layer.  
The connection path is: **OpenClaw agent -> Hub Protocol (`/api/hub/*`) -> Synap backend**.

## Relationship to Synap backend

- OpenClaw does not write to the database directly.
- It calls Hub endpoints with scoped API keys.
- Backend still enforces permission/proposal policy for high-impact mutations.

Core implementation points in backend:

- Hub REST surface: [`packages/api/src/routers/hub-protocol-rest.ts`](https://github.com/Synap-core/backend/blob/main/packages/api/src/routers/hub-protocol-rest.ts)
- OpenAI-compatible endpoint used by agent runtimes: [`apps/api/src/index.ts`](https://github.com/Synap-core/backend/blob/main/apps/api/src/index.ts)
- Channel bridge using `/v1/chat/completions`: [`packages/api/src/routers/channels.ts`](https://github.com/Synap-core/backend/blob/main/packages/api/src/routers/channels.ts)

## Setup paths

### 1) Self-hosted backend script

Use backend provisioning script (creates agent user + Hub key + starts OpenClaw profile):

- [`deploy/setup-openclaw.sh`](https://github.com/Synap-core/backend/blob/main/deploy/setup-openclaw.sh)

### 2) Synap backend CLI (`synap`)

Self-hosted operators can enable and manage OpenClaw via backend CLI (`synap`) and compose profiles.

### 3) Synap CLI bootstrap

For end-to-end onboarding from user side:

```bash
npx @synap/cli init
```

CLI repo:

- [`synap-cli`](https://github.com/Synap-core/synap-cli)
- init command source: [`src/commands/init.ts`](https://github.com/Synap-core/synap-cli/blob/main/src/commands/init.ts)

## Skill wiring

OpenClaw should install Synap skill so it can call Hub endpoints coherently:

- skill definition: [`skills/synap/SKILL.md`](https://github.com/Synap-core/backend/blob/main/skills/synap/SKILL.md)
- skill notes: [`skills/synap/README.md`](https://github.com/Synap-core/backend/blob/main/skills/synap/README.md)

## Continue

- [Agents overview](/docs/integrate/agents)
- [Hub Protocol direct integration](/docs/integrate/integrations/sdk-direct)
- [Team OpenClaw docs](/team/platform/openclaw-integration)
