---
sidebar_position: 4
title: 'Branching Conversations'
description: Documentation covering Branching Conversations
section: general
audience: users
version: 1.0+
last_updated: '2026-04-20'
tags: []
hide_title: false
toc: true
---

# Branching Conversations

Branching is modeled as **`thread` + attributes**, not a separate channel type.

## Canonical framing

- Parent conversation: a `thread`
- Branch conversation: another `thread` with `parentChannelId`
- Branch intent: metadata such as `branchPurpose`
- Merge/summarize behavior: lifecycle metadata and message-level actions

This keeps taxonomy simple while preserving powerful branch workflows.

## Why this matters

- Main conversation stays focused
- Deep dives run in parallel
- Agent-specialized work can happen in child threads
- Results can be summarized back into the parent thread

## Typical flow

1. User or agent creates a child thread from a parent thread
2. Child thread runs focused exploration (often with a specialized agent)
3. Outcome is merged/summarized back to the parent thread
4. Child thread remains in history for traceability

## Relationship to channel architecture

Branching behavior is part of the channel model described in:

- [Channels](./channels) (canonical taxonomy and attributes)
- [Multi-Agent System](./multi-agent-system)

Use those pages as source of truth for channel typing and routing behavior.
