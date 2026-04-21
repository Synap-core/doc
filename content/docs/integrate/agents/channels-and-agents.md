---
title: 'Channels and agents'
description: How agents operate in channel contexts and branch workflows.
section: general
audience: users
version: 1.0+
last_updated: '2026-04-20'
tags: []
sidebar_position: null
hide_title: false
toc: true
---

Channels are the primary interaction surface for humans and agents. The canonical public channel model is `thread`, `feed`, `external`, and `agent_collab`.

- agents read channel context
- branch-style workflows are modeled as `thread` attributes (`parentChannelId`, branch metadata)
- proposal governance applies consistently across channels

## Runtime bridge details

Backend path that bridges channel events to OpenAI-compatible service calls:

- [`packages/api/src/routers/channels.ts`](https://github.com/Synap-core/backend/blob/main/packages/api/src/routers/channels.ts)

This is where channel state and external agent service invocations are connected.

See:

- [Agents overview](/docs/integrate/agents)
- [Channels concept](/docs/architecture/concepts/channels)
- [Team channel-agent flow](/team/platform/channel-agent-flow)
