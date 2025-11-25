---
sidebar_position: 4
---

# Event-Driven Architecture

**Understanding the event-driven architecture of Synap**

---

## Overview

Synap uses a pure event-driven architecture where all state changes flow through events.

See [Event-Driven Architecture](../event-driven.md) for complete documentation.

---

## Key Concepts

### Event Sourcing
All state changes are recorded as immutable events in the event store.

### CQRS
Commands (writes) publish events, Queries (reads) access projections directly.

### Event Streaming
Real-time updates via WebSocket for immediate feedback.

---

**Next**: See [Event-Driven Architecture](../event-driven.md) for detailed documentation.

