---
sidebar_position: 1
title: 'Overview'
description: Documentation covering Overview
section: general
audience: users
version: 1.0+
last_updated: '2026-04-20'
tags: []
hide_title: false
toc: true
---

# Connect AI to your data pod

**Give any AI — Claude Code, custom agents, LLM pipelines — direct access to your Synap data.**

---

## Who this is for

- **Developers** building custom apps or automations on top of Synap data
- **Power users** connecting Claude Code or other AI tools to their personal knowledge base
- **AI builders** wiring Synap as a memory + action layer for LLM pipelines

Your data pod exposes three distinct integration surfaces. Choose based on how much control you need versus how much you want to set up.

---

## The three options

| Option | Endpoint | Best for | Pros | Cons |
|--------|----------|----------|------|------|
| **C — Skill invocation** | `POST /api/external/skills/:id/invoke` | Calling specific named operations | Deterministic, composable, fast | Must know skill ID; no natural language |
| **D — Chat stream** | `POST /api/external/chat/stream` | Conversational AI with full pod context | Natural language, persistent history, full IS capabilities | Less predictable output; higher latency |
| **E — SDK + direct API** | tRPC / Hub Protocol REST | Custom apps and LLM pipelines | Full control, type-safe with `@synap/sdk` | Most setup required; you manage context yourself |

---

## Option C — Skill invocation

Skills are named operations that run in a secure sandbox with full access to your pod data. Invoking them via HTTP lets any external tool — a shell script, a Claude Code tool, a cron job — trigger precise, repeatable operations.

Best when you want **deterministic behavior**: "extract entities from this text", "summarize overdue tasks", "create a note from these meeting notes".

[Read the skill invocation guide →](./skill-invocation)

---

## Option D — Chat stream

A single endpoint backed by your pod's AI system. The AI has access to your entities, documents, skill library, and conversation history. You send a natural language query; the pod streams back a response.

Best when you want the AI to **figure out what to do**: "what's on my plate this week?", "draft a follow-up email based on my notes from yesterday".

[Read the chat stream guide →](./chat-stream)

---

## Option E — SDK and direct API

For building real apps. `@synap/sdk` gives you typed tRPC access to every procedure on the pod. Hub Protocol REST gives you the same access surface the pod's own AI uses internally.

Best when you are **building something**: a custom UI, an LLM pipeline where you manage context yourself, a sync integration, or a script that reads Synap data and feeds it into a separate model.

[Read the SDK and direct API guide →](./sdk-direct)

---

## Feed templates for Relay

For mobile onboarding, Synap Relay uses a template-first feed flow (curated sources + goal + cadence), then pushes configuration to the pod feed worker.

[Read feed templates guide →](./feed-templates)

---

## API keys

All three options require an API key with the appropriate scopes.

[API keys reference →](./api-keys)

---

## Quick orientation

```
Your pod URL:  https://YOUR_POD.synap.live

Option C:  POST /api/external/skills/:id/invoke
Option D:  POST /api/external/chat/stream
Option E:  https://YOUR_POD.synap.live/trpc  (tRPC)
           https://YOUR_POD.synap.live/api/hub-protocol  (REST)
```

All endpoints accept `Authorization: Bearer YOUR_API_KEY`. No OAuth flow required for personal access tokens.
