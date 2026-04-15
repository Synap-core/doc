---
title: Validation policy
description: Policy checks and approval behavior for mutation requests.
---

Validation policy determines whether a requested mutation can execute directly or must become a proposal.

## Decision dimensions

- **Actor/source**: user, AI, system, or external connector
- **Action sensitivity**: low-risk read/update vs high-impact structural mutation
- **Scope and ownership**: workspace and resource-level authorization context

## Typical outcomes

- **Direct execution** for allowed low-risk operations
- **Proposal required** when policy demands human confirmation
- **Denied** when actor lacks the required permission scope

## Why this matters

- keeps AI and automation productive without bypassing governance
- preserves auditability for who changed what and why
- enables human-in-the-loop approval for high-impact operations

See:

- [Permission model](/docs/architecture/permission-model)
- [Event flow and governance](/docs/architecture/system-patterns)
- [Agents integration model](/docs/integrate/agents)
