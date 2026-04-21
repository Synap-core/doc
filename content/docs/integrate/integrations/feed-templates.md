---
sidebar_position: 9
title: 'Feed Templates'
description: Documentation covering Feed Templates
section: general
audience: users
version: 1.0+
last_updated: '2026-04-20'
tags: []
hide_title: false
toc: true
---

# Feed templates (Relay-first)

Relay uses a **template-first** feed setup model. Instead of asking users to paste raw RSS URLs, the app proposes curated source templates and then asks intent questions.

## Default user flow

1. Choose template sources (ex: X/Twitter trends, Reddit, LinkedIn)
2. Select goal (startup leads, market intelligence, competitor watch, etc.)
3. Select cadence (realtime, hourly, daily, weekly)
4. Feed worker fetches and IS filters by relevance before posting

## Why template-first

- less setup friction on mobile
- safer defaults (known-good routes/providers)
- better downstream filtering because intent is explicit

## Delivery pipeline

```text
Relay templates/preferences
  -> Pod feed config (`feeds.updateFeedConfig`)
  -> Feed execution worker (`feed-rss-executor`)
  -> Provider fetch (managed: CP RSS proxy, self-hosted: local RSSHub/direct)
  -> IS classification (topics + relevance)
  -> Feed channel messages
```

## Managed vs self-hosted provider path

- **Managed pods (default):** use Control Plane RSS proxy/provider registry
- **Self-hosted pods:** can point to local RSSHub and keep transport local

## Notes

- Browser can expose advanced/manual source controls for power users
- Relay should keep template-first UX as default behavior
