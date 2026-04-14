---
title: Core patterns
description: Event sourcing, CQRS, projection model, and write/read separation.
---

# Core patterns

Synap combines event sourcing and CQRS to keep writes auditable and reads fast.

- immutable event chain for all mutations
- validation/execution workers for command flow
- projection-backed queries for low-latency reads

See:

- [System patterns](/docs/architecture/system-patterns)
- [Event architecture](/docs/architecture/events)
