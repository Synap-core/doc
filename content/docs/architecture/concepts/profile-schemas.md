---
sidebar_position: 3
title: Profile Schemas
---

> **One entity. Many spaces. Different lenses.**
>
> A Person in your Relay space looks different from the same Person in your Knowledge space — not because the data changed, but because each space attaches its own schema overlay on top of a shared base.

This is the foundation that lets Synap host radically different workflows on the same underlying data without collisions or leaks between them.

## The three layers

Every property definition in Synap lives in one of three layers:

| Layer | Who defines it | Who sees it | Example |
|---|---|---|---|
| **Global** | System | Everyone | `name`, `email`, `phone` on the built-in `person` profile |
| **Profile base** | System or the workspace that owns the profile | Every workspace that uses this profile | `status`, `priority` on the built-in `task` profile |
| **Workspace overlay** | A workspace extending a profile it doesn't own | Only that workspace | Relay adds `investmentThesis` to the pod-wide `person` profile |

When you open an entity, Synap composes its fields from the layers that apply to your current workspace:

```
                 base fields (always rendered)
┌────────────────────────────────────────────────┐
│  name, email, phone, company                   │
├────────────────────────────────────────────────┤
│  your workspace's overlay fields               │
│  investmentThesis, lastPitchedAt, …            │
└────────────────────────────────────────────────┘
                 what you actually see
```

Another workspace looking at the **same entity** sees a different bottom half:

```
┌────────────────────────────────────────────────┐
│  name, email, phone, company         ← shared  │
├────────────────────────────────────────────────┤
│  notesCount, topicsDiscussed         ← private │
│                                                │
│  (no trace of investmentThesis here)           │
└────────────────────────────────────────────────┘
```

## Why this matters

### Same data, different jobs
A freelancer running both a Relay space (client pipeline) and a Studio space (content production) can track `Alice` as both a prospect and an audience member. Relay sees her pipeline status and deal size. Studio sees which hooks resonated with her. Neither workflow fights the other for schema space.

### No coupling between spaces
Adding a field to your Relay space is guaranteed never to affect Studio. No migrations, no schema conflicts, no surprise renames. Extension is local.

### Templates compose cleanly
Install a new space template and its overlay fields slot in alongside existing data. Your Person entities grow new capabilities in that space without losing identity anywhere else.

## How it works under the hood

### Storage

Property definitions are stored in a single `property_defs` table with three columns that define scope:

```
property_defs
├── slug                 (what the field is called)
├── profile_id           (which profile it belongs to — NULL for globals)
└── workspace_id         (which workspace owns it — NULL for base fields)
```

The scope matrix:

| profile_id | workspace_id | Layer |
|---|---|---|
| NULL | NULL | Global |
| SET | NULL | Profile base |
| SET | SET | Workspace overlay |

Three partial unique indexes ensure that the same slug can coexist across scopes without collisions — e.g. a workspace's `notesCount` overlay on `person` doesn't clash with another workspace's `notesCount` overlay on the same profile.

### Reading

When your workspace reads an entity, the backend walks the profile hierarchy (following `extends`), gathers all effective property defs, and **filters by workspace** at the SQL level. You only ever see:

- Global defs
- Profile-base defs
- Your own workspace's overlay defs

Other workspaces' overlays are dropped before they reach the rendering layer. This happens in one query (`getManyByIds` with a `WHERE workspace_id IS NULL OR workspace_id = :me` clause), not in a post-filter pass — so reads stay fast regardless of how many spaces your pod hosts.

### Writing

When you write a property on an entity, validation also runs through your workspace's lens. Writing to a key that belongs to another space's overlay is treated as an **unknown property**: the value lands in the raw JSONB bag (so nothing is lost), but it isn't validated against a schema and doesn't show up in filtered views. The alternative would be to expose other workspaces' schema in your error messages — and we don't want that.

### Creating overlays

When you install a space template that extends a profile it doesn't own — for example, Relay extending the pod-wide `person` profile with `investmentThesis` — the new property defs are tagged with the installing workspace's ID. They become overlays automatically. You don't need to think about it.

When you install a space template that creates its **own** profile — for example, a custom `campaign` profile unique to Relay — the property defs are tagged as **profile base** (workspace_id = NULL), because the profile row itself already carries the workspace scope via `profiles.workspace_id`.

## A worked example

Imagine you run three spaces on one pod:

1. **Relay** (CRM) — uses the built-in `person` profile.
2. **Knowledge** (PKM) — also uses `person`.
3. **Studio** (content creation) — also uses `person`, plus its own `content-piece` profile.

You create a Person: `Alice Chen`. She lives once on your pod.

Then:

- In Relay you add a custom field `investmentThesis` on Person.
  - A new property def is created: `slug=investmentThesis, profile_id=person, workspace_id=<Relay>`.
- In Knowledge you add `notesCount` on Person.
  - Another def: `slug=notesCount, profile_id=person, workspace_id=<Knowledge>`.
- In Studio you define a `content-piece` profile with `format`, `status`, `script`.
  - These defs get `profile_id=<Studio's content-piece>, workspace_id=NULL` because Studio owns the profile.

When you open Alice in Relay you see: `name, email, phone, company, investmentThesis`.
When you open the same Alice in Knowledge you see: `name, email, phone, company, notesCount`.
When you open her in Studio you see: `name, email, phone, company` (no overlays because Studio didn't add any to `person`).

One Alice. Three lenses. No leaks.

## What this doesn't do

- **It isn't row-level permissions.** The layered schema model controls **what fields are visible**, not which entities a workspace can access. Pod-wide entities are visible to every workspace that has access to the pod; workspace-scoped entities are visible only to their owning workspace. Those are separate mechanisms.
- **It isn't per-field ACLs.** Every field in your own workspace's lens is visible and editable by anyone with access to that workspace. We don't slice visibility below the workspace boundary — yet.
- **It isn't schema inheritance between overlays.** Two workspaces each defining `status` on `person` will each have their own independent `status` field. If you want a shared convention, use a profile-base def (no workspace scope).

## Cross-references

- [Universal Entity Model →](./entities) — the broader "everything is an entity" foundation.
- [Workspace as a Service →](./workspace-as-a-service) — how spaces are deployed as self-contained apps on your pod.
- [Entity Connections →](./entity-connections) — how entities link to each other (orthogonal to schema layers).
