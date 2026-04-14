---
sidebar_position: 10
---

# Hub & Spoke Architecture

**The distributed intelligence model of Synap**

---

## Overview

Synap uses a **Hub & Spoke** architecture where:
- **Data Pod** = Central Hub (User's private data kernel)
- **External Services** = External Spokes (Intelligence providers, integrations)
- **Hub Protocol** = The universal language connecting them

This model ensures **Data Sovereignty** while enabling **Unlimited Extensibility**.

---

## The Hub (Data Pod)

The **Data Pod** is your personal server using the **Synap Data OS**. It is:
- **Private**: You own the infrastructure (or rent a private instance).
- **Authoritative**: It holds the "Golden Record" of your data.
- **The Gatekeeper**: No data leaves or enters without permission (via Events).

## The Spokes (Services)

Spokes are external systems that provide **capabilities** without owning data. They only access what is explicitly shared for a specific request.

Examples:
- **Intelligence Service**: A GPU-heavy cluster running Llama-3 that summarizes your notes.
- **Calendar Bridge**: An n8n workflow that syncs Google Calendar events.
- **Voice Interface**: A mobile app that captures audio and sends it to the Hub.

---

## Why This Architecture?

| Feature | Monolith (Traditional) | Hub & Spoke (Synap) |
|---------|------------------------|---------------------|
| **Privacy** | Data mixes with others | Data isolated in Hub |
| **AI** | Generic, closed models | Plug-in any model/service |
| **Scale** | Hard to scale user-specific logic | Spokes scale independently |
| **Lock-in** | High | Low (Swap spokes anytime) |

---

## Communication: The Hub Protocol

The Hub and Spokes communicate via the **Hub Protocol**, a standardized, secure bidirectional protocol.

1. **Hub requests Expertise** ("I need this note summarized")
2. **Spoke requests Data** ("I need the note content")
3. **Hub grants Access** (Temporary, read-only token)
4. **Spoke returns Insight** ("Here is the summary")

This ensures the Hub *always* controls the data flow.
