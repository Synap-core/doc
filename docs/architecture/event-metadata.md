---
sidebar_position: 5
---

# Event Metadata

**Extensible context for events: AI, Import, Sync, and beyond**

---

## Overview

Every SynapEvent can carry optional **metadata** that provides context about **how and why** the event happened. This is the key extensibility point that enables:

- 🤖 **AI enrichments** - Intelligence Hub adds reasoning traces, confidence scores
- 📥 **Import context** - Track where data was imported from
- 📱 **Sync context** - Device and offline sync information
- ⚡ **Automation context** - Rule triggers and execution details
- 🔌 **Custom extensions** - Your own metadata for plugins

---

## The `data` vs `metadata` Split

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

| Field | Purpose | Example |
|-------|---------|---------|
| `data` | **WHAT** happened | `{ id, type, title, content }` |
| `metadata` | **HOW/WHY** it happened | `{ ai: {...}, import: {...} }` |

<Tabs>
<TabItem value="user" label="User-Created Entity" default>

```typescript
// User creates a task manually
{
  type: 'entity.created',
  data: {
    id: 'task_123',
    type: 'task',
    title: 'Call John',
  },
  metadata: undefined,  // No additional context
  source: 'api',
}
```

</TabItem>
<TabItem value="ai" label="AI-Extracted Entity">

```typescript
// AI extracts a task from conversation
{
  type: 'entity.created',  // SAME event type
  data: {
    id: 'task_456',
    type: 'task',
    title: 'Call John',
  },
  metadata: {
    ai: {
      agent: 'orchestrator',
      confidence: { score: 0.92 },
      extraction: {
        extractedFrom: { messageId: 'msg_789', threadId: 'thread_abc' },
        method: 'explicit',
      },
    },
  },
  source: 'intelligence',
}
```

</TabItem>
</Tabs>

**Both create real entities.** The metadata tells the story of how it came to be.

---

## Event Schema with Metadata

```typescript
interface SynapEvent {
  // Identity
  id: string;           // UUID
  version: 'v1';        // Schema version
  
  // Classification
  type: string;         // e.g., 'entity.created'
  aggregateId?: string; // Entity ID this event relates to
  
  // WHAT happened (core payload)
  data: Record<string, unknown>;
  
  // HOW/WHY it happened (extensible context)
  metadata?: EventMetadata;
  
  // Ownership & Source
  userId: string;
  source: 'api' | 'automation' | 'sync' | 'migration' | 'system' | 'intelligence';
  timestamp: Date;
  
  // Tracing
  correlationId?: string;
  causationId?: string;
}
```

---

## Metadata Types

### AI Metadata

When Intelligence Hub creates or enriches content:

```typescript
interface AIMetadata {
  // Required: which agent produced this
  agent: string;  // 'orchestrator', 'research-agent', etc.
  
  // Confidence scoring
  confidence?: {
    score: number;      // 0.0 - 1.0
    reasoning?: string; // Why this confidence?
  };
  
  // If extracted from conversation
  extraction?: {
    extractedFrom: {
      messageId: string;
      threadId: string;
      content?: string;  // Snippet that triggered extraction
    };
    method: 'explicit' | 'implicit' | 'relationship';
  };
  
  // Classification results
  classification?: {
    categories: Array<{ name: string; confidence: number }>;
    tags?: string[];
    method: 'embedding_similarity' | 'llm_analysis' | 'rule_based';
  };
  
  // Reasoning trace for transparency
  reasoning?: {
    steps: Array<{
      type: 'thinking' | 'tool_call' | 'tool_result' | 'decision';
      content: string;
    }>;
    outcome?: { action: string; confidence: number };
  };
  
  // Inferred properties (flexible)
  inferredProperties?: Record<string, unknown>;
}
```

**Example use case**: User says "Remind me to call John tomorrow". The AI extracts a task entity with:
- `confidence.score: 0.92`
- `extraction.method: 'explicit'`
- `reasoning.steps: [{ type: 'thinking', content: 'User said "remind me to" which indicates task creation' }]`

---

### Import Metadata

When importing from external sources:

```typescript
interface ImportMetadata {
  source: 'notion' | 'obsidian' | 'roam' | 'logseq' | 'markdown' | 'csv' | 'api' | 'other';
  externalId?: string;      // Original ID in source system
  externalUrl?: string;     // Link back to source
  importedAt: Date;
  batchId?: string;         // For batch imports
  transformed?: boolean;    // Was content transformed?
}
```

**Example use case**: Importing notes from Notion with original block IDs preserved.

---

### Sync Metadata

When syncing from mobile/devices:

```typescript
interface SyncMetadata {
  deviceId: string;
  platform: 'ios' | 'android' | 'web' | 'desktop' | 'cli';
  syncedAt: Date;
  offline?: boolean;        // Created while offline
  conflictResolution?: 'client_wins' | 'server_wins' | 'merged';
}
```

**Example use case**: User creates a note on mobile while offline, sync resolves when online.

---

### Automation Metadata

When triggered by rules/automations:

```typescript
interface AutomationMetadata {
  ruleId: string;
  ruleName: string;
  trigger: {
    type: string;
    event?: string;     // Triggering event type
    schedule?: string;  // Cron expression
  };
  executionId?: string;
}
```

**Example use case**: Daily summary note created by scheduled automation.

---

### Custom Metadata

For plugins and extensions:

```typescript
interface EventMetadata {
  ai?: AIMetadata;
  import?: ImportMetadata;
  sync?: SyncMetadata;
  automation?: AutomationMetadata;
  
  // Your custom extensions
  custom?: Record<string, unknown>;
}
```

**Example**:
```typescript
metadata: {
  custom: {
    myAnalytics: {
      sentiment: 'positive',
      topics: ['productivity', 'ai'],
      score: 85.5,
    },
  },
}
```

---

## Adding Metadata to Events

### Using Helper Functions

```typescript
import { createSynapEvent, EventTypes, createAIExtractionMetadata } from '@synap/types';

const event = createSynapEvent({
  type: EventTypes.ENTITY_CREATED,
  userId: 'user_123',
  aggregateId: 'entity_456',
  source: 'intelligence',
  data: {
    id: 'entity_456',
    type: 'task',
    title: 'Call John',
  },
  metadata: createAIExtractionMetadata({
    agent: 'orchestrator',
    messageId: 'msg_789',
    threadId: 'thread_abc',
    confidence: 0.92,
    method: 'explicit',
  }),
});
```

### Manual Metadata

```typescript
const event = createSynapEvent({
  type: EventTypes.ENTITY_CREATED,
  // ...
  metadata: {
    ai: {
      agent: 'my-custom-agent',
      confidence: { score: 0.85, reasoning: 'High keyword match' },
      inferredProperties: {
        priority: 'high',
        dueDate: '2024-12-10',
      },
    },
  },
});
```

---

## Querying Metadata

### SQL (Direct Query)

```sql
-- Find all AI-created entities
SELECT * FROM events 
WHERE type = 'entity.created'
  AND metadata->'ai' IS NOT NULL;

-- Get extraction source
SELECT 
  data->>'id' as entity_id,
  metadata->'ai'->'extraction'->'extractedFrom'->>'messageId' as source_message,
  (metadata->'ai'->'confidence'->>'score')::float as confidence
FROM events
WHERE type = 'entity.created'
  AND metadata->'ai'->'extraction' IS NOT NULL;

-- Filter by confidence
SELECT * FROM events
WHERE (metadata->'ai'->'confidence'->>'score')::float > 0.8;
```

### tRPC

```typescript
// Get event with metadata
const event = await trpc.events.get.query({ eventId: 'event_123' });

if (event.metadata?.ai) {
  console.log('Created by:', event.metadata.ai.agent);
  console.log('Confidence:', event.metadata.ai.confidence?.score);
}
```

---

## Projections

Metadata is automatically projected into optimized tables for fast queries:

| Source | Projection Table | Query |
|--------|------------------|-------|
| `metadata.ai.extraction` | `entity_enrichments` | Get extraction context |
| `metadata.ai.classification` | `entity_enrichments` | Get categories/tags |
| `metadata.ai.relationships` | `entity_relationships` | Graph queries |
| `metadata.ai.reasoning` | `reasoning_traces` | Transparency audits |

**Note**: Projections are optional optimizations. You can always query the `events` table directly with JSONB operators.

---

## Best Practices

### ✅ Do

| Practice | Reason |
|----------|--------|
| Include `agent` for AI metadata | Know which system created it |
| Add confidence scores | Let consumers filter by quality |
| Add reasoning traces | Enable transparency and debugging |
| Use `source: 'intelligence'` | Clearly mark AI events |

### ❌ Don't

| Anti-Pattern | Why It's Bad |
|--------------|--------------|
| Put huge blobs in metadata | Keep focused (&lt;10KB) |
| Skip confidence scores | Consumers can't filter quality |
| Modify metadata after creation | Events are immutable |

---

## Summary

The metadata system provides:

1. **Extensibility** - AI, import, sync, automation, custom
2. **Transparency** - Know how every entity was created
3. **Queryability** - JSONB operators + projections
4. **Type Safety** - Zod schemas for validation

**Events tell what happened. Metadata tells the story of how and why.**

---

**Next**: See [Extensibility Guide](../development/extensibility/extensibility-guide.md) to build your own metadata-aware plugins.
