---
title: Event flow
description: Requested, validated, and completed event lifecycle.
---

# Event flow

Every mutation follows a deterministic event lifecycle:

1. intent event (`*.requested`)
2. validation/permission processing
3. execution and completion events

This flow powers governance, observability, and replayability.

See:

- [Event architecture](/docs/architecture/events)
- [System patterns](/docs/architecture/system-patterns)
