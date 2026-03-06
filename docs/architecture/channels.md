---
sidebar_position: 8
title: Channels Architecture
---

# Channels Architecture

**Technical reference for the Channels subsystem (post-0038 refactor, 2026-02-26)**

---

## Overview

The Channels subsystem is the interaction layer of Synap — the backend infrastructure that handles all forms of communication: AI conversations, human comments, document reviews, direct messages, and external platform imports.

It was introduced in migration `0038_channels_refactor.sql`, which replaced the earlier `chat_threads` / `conversation_messages` / `thread_entities` / `thread_documents` tables with a unified, semantically richer model.

---

## Database Schema

### `channels` table

Replaces `chat_threads`. The container for a conversation.

```sql
channels (
  id              UUID PRIMARY KEY,
  user_id         TEXT NOT NULL,              -- Owner
  workspace_id    UUID,                       -- Workspace scope
  channel_type    channel_type NOT NULL,      -- See enum below
  status          channel_status,             -- active | merged | archived
  title           TEXT,
  parent_channel_id UUID REFERENCES channels, -- For branches
  branch_purpose  TEXT,                       -- Why this branch was created
  agent_id        TEXT,                       -- Bound agent
  agent_type      channel_agent_type,         -- default | meta | code | writing | etc.
  agent_config    JSONB,
  context_object_type TEXT,                   -- "entity" | "document" | "view"
  context_object_id   UUID,                   -- The object this channel is attached to
  external_source     TEXT,                   -- "whatsapp" | "slack" | "gmail"
  external_channel_id TEXT,                   -- The platform-side ID
  context_summary TEXT,                       -- AI-maintained running summary
  metadata        JSONB,
  created_at      TIMESTAMPTZ,
  updated_at      TIMESTAMPTZ
)
```

**`channel_type` enum:**
```typescript
enum ChannelType {
  AI_THREAD       = "ai_thread",       // Main AI conversation
  BRANCH          = "branch",          // Sub-conversation (child of another channel)
  ENTITY_COMMENTS = "entity_comments", // Comment thread on an entity
  DOCUMENT_REVIEW = "document_review", // Review thread on a document
  VIEW_DISCUSSION = "view_discussion", // Discussion on a view
  DIRECT          = "direct",          // DM between users
  EXTERNAL_IMPORT = "external_import", // Ingested from WhatsApp / Slack / Gmail
}
```

---

### `messages` table

Replaces `conversation_messages`. The atomic message unit.

```sql
messages (
  id              UUID PRIMARY KEY,
  channel_id      UUID NOT NULL REFERENCES channels,
  role            message_role NOT NULL,      -- user | assistant | system
  author_type     TEXT DEFAULT 'human',       -- human | ai_agent | external | bot
  message_category TEXT DEFAULT 'chat',       -- chat | comment | system_notification | review
  content         TEXT NOT NULL,
  user_id         TEXT NOT NULL,
  external_source TEXT,                       -- Platform origin
  inbox_item_id   UUID REFERENCES inbox_items, -- Life Feed FK
  metadata        JSONB,
  hash            TEXT NOT NULL,              -- SHA-256 of content
  previous_hash   TEXT,                       -- Hash chain for integrity
  timestamp       TIMESTAMPTZ,
  created_at      TIMESTAMPTZ
)
```

Key design choices:
- `role` is the LLM-facing role (for prompt construction)
- `author_type` is the actual origin (human vs AI vs external service)
- `message_category` drives UI rendering
- Hash chain ensures immutability and tamper detection

---

### `channel_context_items` table

Replaces `thread_entities` + `thread_documents`. A unified polymorphic context table.

```sql
channel_context_items (
  id                UUID PRIMARY KEY,
  channel_id        UUID NOT NULL REFERENCES channels,
  object_type       TEXT NOT NULL,   -- entity | document | view | proposal | inbox_item
  object_id         UUID NOT NULL,   -- Polymorphic — no FK (intentional)
  relationship_type TEXT NOT NULL,   -- used_as_context | created | updated | referenced | inherited_from_parent
  conflict_status   TEXT DEFAULT 'none',  -- none | pending | resolved
  source_message_id UUID REFERENCES messages,
  user_id           TEXT NOT NULL,
  workspace_id      UUID NOT NULL,
  created_at        TIMESTAMPTZ,
  UNIQUE (channel_id, object_id, object_type, relationship_type)
)
```

Design choice: `object_id` is a UUID but without a FK constraint. This is intentional — it enables linking to any current or future object type without schema migrations. Referential integrity is enforced at the application layer.

---

## API Layer

### tRPC Router

The `channelsRouter` in `packages/api/src/routers/channels.ts` is registered under the key `chat` in the root router (for frontend backward compatibility). Frontend code calling `trpc.chat.*` continues to work unchanged.

Key procedures:

| Procedure | Description |
|-----------|-------------|
| `createThread` | Create a new ai_thread or branch |
| `createDocumentComment` | Create entity_comments / document_review channel + first message |
| `createEntityComment` | Same for entity-attached comment channels |
| `sendMessage` | Send a message and trigger AI response |
| `getMessages` | Paginated message list |
| `listThreads` | List channels for a user/workspace |
| `getBranches` | Get child branches of a channel |
| `getBranchTree` | Recursive branch tree |
| `mergeBranch` | Merge branch back to parent |
| `getThread` | Get channel + context items + branch tree |
| `updateThread` | Update title, agent config, metadata |
| `archiveThread` | Soft-delete |
| `getThreadContext` | Get context items (optionally filtered by objectType / relationshipType) |

### Hub Protocol REST

The REST adapter at `packages/api/src/routers/hub-protocol-rest.ts` exposes channel operations for the Intelligence Service:
- `GET /threads` — list channels
- `POST /threads` — create channel
- `GET /threads/:id/messages` — get messages
- `POST /threads/:id/messages` — inject a message (used by sub-agents to report back)
- `GET /threads/:id/context` — delegates to tRPC `context.getThreadContext`

### Hub Protocol tRPC (scoped)

`packages/api/src/routers/hub-protocol/` contains the tRPC procedures used by the intelligence service:
- `context.getThreadContext` — full context bundle (thread + messages + linked entities/documents)
- `context.getUserContext` — user's recent activity
- `context.updateThreadContext` — update AI-maintained summary
- `linking.linkEntity` — add entity to channel context items
- `linking.linkDocument` — add document to channel context items
- `branches.createBranch` — create a branch channel
- `branches.mergeBranch` — merge branch

---

## Search Indexing

Channels are indexed in Typesense under the collection name `"channels"` (was `"chat_threads"`). The `ChannelIndexer` in `packages/search/src/indexers/channel-indexer.ts` handles serialisation. The `IndexingService` processes channels through the same queue-based bulk import pipeline as entities and documents.

---

## Workers

### Cross-Channel Notifier

`packages/jobs/src/workers/cross-channel-notifier.ts` (registered on queue `"cross-thread-notify"` for backward compatibility):

When an entity or document is updated, this worker queries `channel_context_items` for all channels that reference the same object (excluding the originating channel) and injects a `system` message notifying them of the update. This keeps AI agents in parallel branches aware of changes to shared objects.

---

## Key Design Decisions

### Why one table for all channel types?

A single `channels` table with a `channel_type` discriminator was chosen over separate tables (e.g. `comment_threads`, `dm_threads`) because:
1. It enables a unified query interface — `trpc.chat.listThreads` returns everything
2. Cross-type context linking (a comment thread can reference an entity that is also in an AI thread) is trivial
3. The schema differences between types are handled via nullable columns and JSONB `metadata`, not separate tables

Trade-off: Some query patterns that are type-specific require a `WHERE channel_type = ...` filter. Consider adding a GIN partial index if a specific type grows very large.

### Why no FK on `channel_context_items.object_id`?

The polymorphic design (`object_type` + `object_id`) sacrifices FK enforcement for extensibility. New object types can be tracked without schema changes. Orphaned rows are acceptable — they don't cause errors and the UI can gracefully handle missing objects. A periodic cleanup job can prune them if needed.

### Why `message_role` AND `author_type`?

`role` (user/assistant/system) is the LLM's vocabulary for prompt construction — it must remain stable and match the OpenAI/Anthropic API spec. `author_type` (human/ai_agent/external/bot) is the application's vocabulary for rendering and attribution. These are orthogonal concerns.

### Why preserve the `chat` tRPC key?

Frontend compatibility. All frontend code uses `trpc.chat.*`. Renaming the key would require a coordinated frontend refactor across dozens of call sites. The internal naming (`channelsRouter`) is correct; the tRPC registration key is an alias.

---

## Indexes

```sql
-- Channels
channels_user_id_idx         ON channels(user_id)
channels_workspace_id_idx    ON channels(workspace_id)
channels_parent_channel_id_idx ON channels(parent_channel_id)
channels_status_idx          ON channels(status)
channels_context_idx         ON channels(context_object_type, context_object_id)
  WHERE context_object_id IS NOT NULL

-- Messages
messages_channel_id_idx      ON messages(channel_id)
messages_inbox_item_idx      ON messages(inbox_item_id)
  WHERE inbox_item_id IS NOT NULL
messages_ext_source_idx      ON messages(external_source)
  WHERE external_source IS NOT NULL

-- Channel context items
channel_context_channel_idx  ON channel_context_items(channel_id)
channel_context_object_idx   ON channel_context_items(object_type, object_id)
channel_context_user_idx     ON channel_context_items(user_id)
channel_context_workspace_idx ON channel_context_items(workspace_id)
channel_context_conflict_idx ON channel_context_items(conflict_status)
  WHERE conflict_status != 'none'
```

---

## Migration History

| Migration | Description |
|-----------|-------------|
| `0038_channels_refactor.sql` | Renamed `chat_threads`→`channels`, `conversation_messages`→`messages`; merged `thread_entities`+`thread_documents`→`channel_context_items`; added `author_type`, `message_category`, `external_source`, `inbox_item_id`, `context_object_type/id`, `external_source/channel_id` |

---

## Related Files

| File | Role |
|------|------|
| `packages/database/src/schema/channels.ts` | Schema + enums |
| `packages/database/src/schema/messages.ts` | Schema + enums |
| `packages/database/src/schema/channel-context-items.ts` | Schema + enums |
| `packages/database/src/repositories/channel-repository.ts` | CRUD + event emission |
| `packages/database/src/repositories/message-repository.ts` | Message creation + hash chaining |
| `packages/api/src/routers/channels.ts` | Main tRPC router |
| `packages/api/src/routers/hub-protocol/linking.ts` | Context item linking via Hub Protocol |
| `packages/api/src/routers/hub-protocol/context.ts` | Context bundle queries |
| `packages/api/src/routers/hub-protocol-rest.ts` | REST adapter for Intelligence Service |
| `packages/jobs/src/workers/cross-channel-notifier.ts` | Cross-channel entity update notifications |
| `packages/search/src/indexers/channel-indexer.ts` | Typesense indexing |
