---
title: Hub Protocol flow
description: Request/response model between agents and the data pod through Hub Protocol.
---

Hub Protocol is the primary bridge between agent runtimes and Synap pods.

## Request path

1. Client/agent calls Hub route with scoped credentials
2. Backend resolves actor, workspace, and authorization scope
3. Reads return directly; writes enter policy/governance flow
4. Event/executor pipeline applies side effects and downstream updates

## Why this protocol exists

- one stable surface for external intelligence and automation clients
- avoids coupling integrations to internal frontend implementation details
- keeps governance and audit behavior consistent across user and agent writes

## Typical capabilities exposed

- entity and relationship operations
- channel/message operations
- memory/fact operations
- setup and integration utility flows

See:

- [Hub Protocol integration](/docs/integrate/integrations/sdk-direct)
- [Integration fundamentals](/docs/integrate/integrate-core)
- [API reference](/docs/integrate/reference/api-reference)
