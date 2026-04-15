---
title: Permission model
description: Workspace-scoped access and policy enforcement for users and agents.
---

Permissions are enforced at the pod and workspace layers.

## Access layers

- **User session access**: human users authenticate and operate with workspace membership context.
- **Workspace authorization**: actions are constrained by workspace-level role and membership.
- **Agent/API-key access**: external and automated actors use scoped keys rather than full user sessions.

## Enforcement model

Permission checks are not only UI checks. They are applied at backend procedure/route level and again across event-driven execution paths.

- reads require valid identity + scope
- writes require identity + action-level permission
- sensitive or policy-gated writes can be converted to proposals

## Why this exists

- prevents accidental cross-workspace data access
- keeps external integrations least-privilege by default
- ensures AI/automation writes are governable, not silent side effects

See:

- [Validation policy](/docs/architecture/validation-policy)
- [API keys](/docs/integrate/integrations/api-keys)
- [Integration fundamentals](/docs/integrate/integrate-core)
