---
sidebar_position: 2
---

# Event Types & Automations Catalog

**Complete reference of all 55 event types and their automations**

---

## Overview

This catalog documents:
- **54 Generated Events** (from 9 database tables)
- **1 System Event** (webhooks)
- Default worker/automation for each event
- Data schemas and payloads

---

## How to Read This Catalog

Each event entry shows:

```
event_type
  Trigger: What causes this event
  Automation: What happens automatically
  Output: What gets created/updated
  Schema: Expected data structure
```

**Note**: The catalog focuses on WHAT happens, not implementation details about which worker processes each event.

---

## Generated Events

### Entities (9 events)

**Purpose**: Core knowledge graph nodes (notes, tasks, projects)

#### entities.create.requested

- **Trigger**: User or AI creates an entity
- **Automation**: Entities Worker
- **Automation**: Validate → upload content to storage → create DB record
- **Output**: `entities.create.validated` + entity in DB + content file
- **Schema**:
```typescript
{
  type: string,           // 'note' | 'task' | 'project'
  title?: string,
  content?: string,
  tags?: string[],
  metadata?: Record<string, unknown>
}
```

#### entities.create.validated

- **Trigger**: After entity created successfully
- **Automation**: AI Analyzer + Embedding Worker
- **Automation**: Generate embeddings + extract metadata + detect insights
- **Output**: Vector in `entity_vectors` + AI suggestions
  
#### entities.update.requested

- **Trigger**: User or AI updates entity
- **Automation**: Entities Worker
- **Automation**: Validate → update DB → upload new content (if changed)
- **Output**: `entities.update.validated`
- **Schema**:
```typescript
{
  entityId: string,
  changes?: Record<string, unknown>,
  content?: string,
  title?: string
}
```

#### entities.update.validated

- **Trigger**: After entity updated
- **Automation**: AI Analyzer (if content changed)
- **Automation**: Regenerate embeddings
- **Output**: Updated vectors

#### entities.delete.requested

- **Trigger**: User deletes entity
- **Automation**: Entities Worker
- **Automation**: Soft delete (set `deleted_at`)
- **Output**: `entities.delete.validated`

#### entities.delete.validated

- **Trigger**: After entity deleted
- **Automation**: None (no post-processing)
- **Automation**: N/A

---

### Documents (9 events)

**Purpose**: User-uploaded documents with automatic versioning

#### documents.create.requested

- **Trigger**: User uploads document
- **Automation**: Documents Worker
- **Automation**: Upload to storage + create DB record + generate preview
- **Output**: `documents.create.validated` + document metadata
- **Schema**:
```typescript
{
  title: string,
  type: 'text' | 'markdown' | 'code' | 'pdf' | 'docx',
  content: Buffer | string,
  language?: string,  // for code files
  projectId?: string
}
```

#### documents.create.validated

- **Trigger**: After document created
- **Automation**: AI Analyzer
- **Automation**: Generate embeddings for search
- **Output**: Searchable document

#### documents.update.requested

- **Trigger**: User edits document
- **Automation**: Documents Worker
- **Automation**: **Create new version** + store delta + update DB
- **Output**: `documents.update.validated` + new `documentVersion` record
- **Schema**:
```typescript
{
  documentId: string,
  content: string,
  delta?: object,  // Operational Transform delta
  message?: string  // Commit message
}
```

**🎯 Default Automation**: **Automatic Versioning**
- Every update creates a new version
- Stores delta (diff) for efficient storage
- Enables time-travel (view any past version)

#### documents.update.validated

- **Trigger**: After document updated + version created
- **Automation**: AI Analyzer
- **Automation**: Regenerate embeddings (if content changed)

#### documents.delete.requested

- **Trigger**: User deletes document
- **Automation**: Documents Worker
- **Automation**: Soft delete + preserve all versions
- **Output**: `documents.delete.validated`

#### documents.delete.validated

- **Trigger**: After document deleted
- **Automation**: None

---

### Document Versions (9 events)

**Purpose**: Document revision history

#### documentVersions.create.requested

- **Trigger**: Automatically when document updated (internal)
- **Automation**: Documents Worker
- **Automation**: Create version snapshot
- **Output**: `documentVersions.create.validated`

#### documentVersions.create.validated

- **Trigger**: Version created
- **Automation**: None (read-only history)

*(update/delete not used - versions are immutable)*

---

### Chat Threads (9 events)

**Purpose**: Conversation containers

#### chatThreads.create.requested

- **Trigger**: User starts new conversation
- **Automation**: Chat Worker
- **Automation**: Create thread + assign first message
- **Output**: `chatThreads.create.validated`
- **Schema**:
```typescript
{
  title?: string,
  participants?: string[],  // user IDs
  metadata?: Record<string, unknown>
}
```

#### chatThreads.create.validated

- **Trigger**: Thread created
- **Automation**: None

#### chatThreads.update.requested

- **Trigger**: Update thread metadata (title, participants)
- **Automation**: Chat Worker
- **Automation**: Update thread record
- **Output**: `chatThreads.update.validated`

#### chatThreads.delete.requested

- **Trigger**: User deletes conversation
- **Automation**: Chat Worker
- **Automation**: Soft delete thread + all messages
- **Output**: `chatThreads.delete.validated`

---

### Conversation Messages (9 events)

**Purpose**: Individual chat messages

#### conversationMessages.create.requested

- **Trigger**: User or AI sends message
- **Automation**: Messages Worker
- **Automation**: Assign to thread + store + trigger AI (if enabled)
- **Output**: `conversationMessages.create.validated` + message in DB
- **Schema**:
```typescript
{
  threadId: string,
  content: string,
  role: 'user' | 'assistant' | 'system',
  metadata?: {
    model?: string,
    tokens?: number,
    reasoning?: object
  }
}
```

**🎯 Default Automation**: **Message Threading**
- Automatically assigns message to thread
- Creates new thread if threadId not provided
- Maintains conversation context

#### conversationMessages.create.validated

- **Trigger**: After message created
- **Automation**: Insight Detector
- **Automation**: Detect action items + entities mentioned
- **Output**: AI suggestions

#### conversationMessages.update.requested

- **Trigger**: User edits message
- **Automation**: Messages Worker
- **Automation**: Update + create edit history
- **Output**: `conversationMessages.update.validated`

---

### Webhook Subscriptions (9 events)

**Purpose**: External integrations configuration

#### webhookSubscriptions.create.requested

- **Trigger**: User/API creates webhook
- **Automation**: Webhooks Worker
- **Automation**: Validate URL + store subscription + generate secret
- **Output**: `webhookSubscriptions.create.validated`
- **Schema**:
```typescript
{
  name: string,
  url: string,
  eventTypes: string[],  // Event types to subscribe to
  secret?: string,        // For HMAC validation
  retryConfig?: {
    maxRetries: number,
    backoff: 'exponential' | 'linear'
  }
}
```

#### webhookSubscriptions.update.requested

- **Trigger**: User updates webhook config
- **Automation**: Webhooks Worker
- **Automation**: Update subscription
- **Output**: `webhookSubscriptions.update.validated`

#### webhookSubscriptions.delete.requested

- **Trigger**: User unsubscribes webhook
- **Automation**: Webhooks Worker
- **Automation**: Soft delete subscription
- **Output**: `webhookSubscriptions.delete.validated`

---

### API Keys (9 events)

**Purpose**: API authentication

#### apiKeys.create.requested

- **Trigger**: User generates API key
- **Automation**: API Keys Worker
- **Automation**: Generate key + hash + store
- **Output**: `apiKeys.create.validated` + API key (shown once)
- **Schema**:
```typescript
{
  name: string,
  scopes: string[],  // Permissions
  expiresAt?: Date
}
```

#### apiKeys.update.requested

- **Trigger**: User updates key metadata (name, scopes)
- **Automation**: API Keys Worker
- **Automation**: Update record
- **Output**: `apiKeys.update.validated`

#### apiKeys.delete.requested

- **Trigger**: User revokes API key
- **Automation**: API Keys Worker
- **Automation**: Soft delete + invalidate immediately
- **Output**: `apiKeys.delete.validated`

---

### Tags (9 events)

**Purpose**: User-defined entity labels

#### tags.create.requested

- **Trigger**: User creates tag
- **Automation**: Tags Worker
- **Automation**: Create tag + assign color
- **Output**: `tags.create.validated`
- **Schema**:
```typescript
{
  name: string,
  color?: string  // Hex color
}
```

#### tags.update.requested

- **Trigger**: User renames tag or changes color
- **Automation**: Tags Worker
- **Automation**: Update tag
- **Output**: `tags.update.validated`

#### tags.delete.requested

- **Trigger**: User deletes tag
- **Automation**: Tags Worker
- **Automation**: Delete tag + remove from all entities
- **Output**: `tags.delete.validated`

---

### Agents (9 events)

**Purpose**: AI agent configurations

#### agents.create.requested

- **Trigger**: User or system creates AI agent config
- **Automation**: Agents Worker
- **Automation**: Store agent config + capabilities
- **Output**: `agents.create.validated`
- **Schema**:
```typescript
{
  name: string,
  type: 'orchestrator' | 'analyzer' | 'extractor' | 'custom',
  model?: string,
  capabilities?: string[],
  permissions?: {
    autoApprove?: boolean,
    allowedActions?: string[]
  }
}
```

#### agents.update.requested

- **Trigger**: Update agent config
- **Automation**: Agents Worker
- **Automation**: Update config
- **Output**: `agents.update.validated`

#### agents.delete.requested

- **Trigger**: Disable agent
- **Automation**: Agents Worker
- **Automation**: Soft delete agent
- **Output**: `agents.delete.validated`

---

## System Events

### webhooks.deliver.requested

- **Trigger**: **Any event** (if webhook subscription exists for that event type)
- **Automation**: Webhook Broker
- **Automation**: 
  1. Find all subscriptions for this event type
  2. For each subscription:
     - Build payload
     - Sign with HMAC
     - POST to subscriber URL
     - Retry on failure (3 attempts)
- **Output**: HTTP 200 from subscriber (or failure logged)
- **Schema**:
```typescript
{
  subscriptionId: string,
  event: SynapEvent,  // The original event
  attempt: number,
  timestamp: Date
}
```

**🎯 Default Automation**: **Event Delivery**
- Guaranteed delivery with retries
- Exponential backoff: 1s, 4s, 16s
- Dead letter queue after 3 failures

---

## Event Catalog Summary

| Category | Events | Tables |
|----------|--------|--------|
| **Generated** | 54 | 9 |
| **System** | 1 | - |
| **Total** | **55** | **9** |

---

## Next Steps

- [Event Architecture](../architecture/events/event-architecture.md) - Pattern reference
- [Automation System](../architecture/events/automation-system.md) - Worker deep dive
- [Webhooks Guide](../integrations/webhooks-guide.md) - External integrations
- [API Reference](./data-pod/events.md) - Event API endpoints
