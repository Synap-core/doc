---
sidebar_position: 7
title: 'Connection Sync Roadmap'
description: Documentation covering Connection Sync Roadmap
section: general
audience: users
version: 1.0+
last_updated: '2026-04-20'
tags: []
hide_title: false
toc: true
---

# Connection Sync — Known Limitations & Roadmap

**Open architectural work in the entity-linking layer**

This document describes a known architectural weakness in the way Synap synchronises the two entity-linking systems, and the planned work to resolve it. Contributions are welcome — the phases below are scoped so anyone familiar with the backend can tackle one.

If you are not yet familiar with the two linking systems, read [Entity Connections](../../architecture/concepts/entity-connections.md) first.

---

## The Problem in One Paragraph

Synap lets you link entities in two ways — through `entity_id` properties on a profile (structural links) and through rows in the `relations` table (semantic relations). The two are supposed to stay in sync via a background sync worker, but that sync is **fire-and-forget, only partially wired, and has no failure surface**. Under normal conditions everything works for the four system properties that are explicitly mapped (`task.projectId`, `task.assignee`, `contact.companyId`, `deal.contactId`). For custom profiles and under concurrent writes or network failures, the two systems can drift.

---

## How Sync Works Today

**Forward path — Property → Relation** (`packages/api/src/utils/property-relation-sync.ts`)

When an entity is created or updated with an `entity_id` property that has a non-null `relationDefId`:

1. The entity mutation commits.
2. `syncPropertyToRelations()` is queued as a fire-and-forget promise (`.catch()` on it, never awaited).
3. The sync compares old vs new property values and inserts / deletes rows in `relations` to match.
4. If the sync throws, it logs a warning and swallows the error. The entity mutation is **not rolled back**.

**Reverse path — Relation → Property**

When a relation is created or deleted, a symmetric `syncRelationToPropertyOnCreate` / `syncRelationToPropertyOnDelete` updates the corresponding `entity_id` property on the source entity's JSONB column — again fire-and-forget.

**Mapping coverage**

The sync only fires for property defs that have `relationDefId IS NOT NULL`. Today that mapping is seeded for exactly four system properties in `seed-property-relation-mappings.ts`:

| Profile | Property | Relation type |
|---|---|---|
| task | `projectId` | `belongs_to_project` |
| task | `assignee` | `assigned_to` |
| contact | `companyId` | `works_at` |
| deal | `contactId` | `deal_for` |

Custom profiles and any new system properties added after workspace seeding have `relationDefId: NULL` and therefore never sync.

---

## Drift Vectors

Concrete scenarios where the two systems can diverge:

1. **Sync failure after entity write.** Property written, relation never created. No retry, no DLQ, no surface — the pod looks healthy.
2. **Custom `entity_id` properties.** A template or user-created profile with a custom `entity_id` property stores the link in the property column but never creates a relation. Graph traversal and `GET /relations` miss it entirely.
3. **Dangling entity references.** Deleting an entity cascades to the `relations` table (via FK), but the other entities' JSONB `properties` column is left untouched. Property values can point to UUIDs that no longer exist. `entity_property_index` has no FK on `value_entity_id`, so dangling references are not caught there either.
4. **Duplicate relation rows under races.** The `relations` table has no `UNIQUE (source_entity_id, target_entity_id, type)` constraint. Two concurrent flows (manual `POST /relations` + a property update syncing) can each insert before the other's dedupe check runs.
5. **Property def mutation without migration.** Changing a property's `valueType` from `string` to `entity_id` does not convert existing string values. Changing `relationDefId` on a property def does not re-sync already-stored values.

Under real load the first two are the ones most likely to bite.

---

## The Unified Read Endpoint (Phase 1 — ✅ Shipped)

The `relations.getConnections` tRPC procedure reads from **both** sources in one query:

1. Explicit relations (from the `relations` table)
2. Property-derived links (reverse lookup on `entity_property_index.value_entity_id`)
3. Thread connections (via `channel_context_items`)

It has always been used internally by the `EntityRelationshipsDisplay` component, but until recently it was not exposed to external agents.

**Now exposed via Hub Protocol REST:**

```yaml

GET /api/hub/entities/{entityId}/connections?userId=...&workspaceId=...&limit=...
Scope: hub-protocol.read

```

The typed client wraps it:

```typescript
import { HubRestClient } from "@synap/hub-rest-client";

const client = new HubRestClient({ podUrl, apiKey });
const { connections, counts } = await client.getConnections(entityId);
```

This closes the immediate problem for **reads** — external agents, Raycast, OpenClaw skills, and any future integration can now fetch the complete picture of an entity's links in one call, regardless of whether the underlying storage is properties or relations.

What this does **not** fix: the data itself may still drift. Reads that merge both sources will always return something sensible, but the relations table and the property index are not guaranteed to agree.

---

## Phase 2 — Write-path correctness (planned)

These are the fixes that make the drift visible and cap the damage. Each is independent — you can pick up any of them as a standalone contribution.

### 2.1 Add a uniqueness constraint on `relations`

Add a partial unique index on `(source_entity_id, target_entity_id, type, workspace_id)` where `deleted_at IS NULL`. Today duplicates can accumulate silently under concurrent writes.

**Files**: `packages/database/src/schema/relations.ts`, new migration in `packages/database/migrations/`, defensive dedupe at insert sites.

**Considerations**: may require a backfill to remove existing duplicates before the constraint can be applied.

### 2.2 Clean up dangling entity_id references on entity delete

Today `DELETE /entities/:id` cascades to `relations` rows (via FK) but does not touch JSONB `entity_id` property values on other entities that were pointing to the deleted entity. Those become dangling references.

Two ways to address:
- A pg trigger on `entities` delete that scans `entity_property_index` for matching `value_entity_id` and nulls the corresponding JSONB property on the owning entity. Cost: runs on every delete.
- A periodic cleanup worker (nightly cron) that scans `entity_property_index` for rows whose `value_entity_id` no longer exists and nulls them. Cost: eventual consistency but cheaper.

**Files**: `packages/jobs/src/workers/` (new worker), or a migration adding the trigger.

**Recommendation**: start with the worker — it's isolated and easy to revert if it misbehaves.

### 2.3 Make sync failures observable

`syncPropertyToRelations` and its siblings currently `logger.warn` on failure and move on. Add:
- A counter metric (`sync.property_to_relation.failed`) exposed on the pod's metrics endpoint.
- A row in a small `sync_failures` table (entity id, property slug, error, timestamp) so admins can see drift accumulating.

**Files**: `packages/api/src/utils/property-relation-sync.ts`, new schema `packages/database/src/schema/sync-failures.ts`.

### 2.4 Expose the relation backfill worker via Hub Protocol

A manual backfill worker already exists (`packages/jobs/src/workers/relation-backfill.ts`). Today it's only triggerable from the tRPC admin router. Exposing it as `POST /api/hub/maintenance/backfill-relations` (admin-only scope) lets operators reconcile drift without shell access.

**Files**: `packages/api/src/routers/hub-protocol-rest.ts`, scope check on the admin role.

---

## Phase 3 — Consolidate at the source (future)

The long-term fix is to eliminate the possibility of drift by making one of the two systems the canonical store. Two options:

### Option A — Always materialise: every `entity_id` property has a relation

Make the dual-write mandatory by construction:

- Schema-level: enforce `property_defs.relation_def_id NOT NULL` when `value_type = 'entity_id'`.
- On profile creation: auto-create a `relation_def` for each `entity_id` property (conventional slug derivation, e.g. `{property_slug}_link`).
- Move the sync **inside** the entity mutation transaction. If the relation write fails, the entity mutation rolls back.
- Backfill every existing workspace's custom profiles.

Entity_id properties remain the fast filter path (`WHERE properties->>'projectId' = X` still works, still indexed), but the relations table is guaranteed to be complete.

**Estimated cost**: 3–5 weeks. Schema migration, sync refactor, repo de-coupling, per-workspace backfill.

### Option B — Drop the relations table for property-originated links

Treat the relations table as purely for ad-hoc semantic edges (user-drawn, AI-discovered). Property-originated links live only in properties; the `getConnections` endpoint is the only path for unified reads.

**Estimated cost**: Lower, but it gives up graph traversal for property links and breaks graph-based queries for system profiles. Probably not the right trade.

### Recommendation

**Option A when it's worth the investment**, probably when the next major profile-schema change forces a migration anyway. Until then, Phase 2 fixes the bleeding and keeps the status quo safe.

---

## How to Contribute

1. Pick a task in Phase 2 (they are independent).
2. Open a GitHub issue in the backend repo tagged `connection-sync` linking to this page.
3. Follow the standard contribution workflow ([Contributing overview](./overview.md)).
4. Every change must include:
   - A test reproducing the drift vector it closes.
   - A note in this document's changelog below.

---

## Changelog

- **2026-04-16** — Document created. Phase 1 (expose `getConnections` via Hub Protocol REST) shipped.
