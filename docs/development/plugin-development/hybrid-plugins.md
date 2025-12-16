---
sidebar_position: 4
---

# Hybrid Plugins

**Combine Data Pod schema with remote processing**

---

## When to Use

✅ Need custom data types (requires schema)  
✅ Need event sourcing (requires events)  
✅ But processing should be external (AI, scaling)

**Perfect for**: AI features that need persistent data.

---

## How It Works

**Split responsibilities**:

**Data Pod provides**:
- Database tables
- Typed events
- Webhook endpoints
- Event handlers

**Remote Service provides**:
- AI/ML processing
- Business logic
- External integrations

---

## Architecture

```
┌─────────────────────────────────────────┐
│ Data Pod                                │
│                                         │
│ ┌─────────┐  ┌────────┐  ┌──────────┐ │
│ │ Schema  │  │ Events │  │ Webhooks │ │
│ └─────────┘  └────────┘  └──────────┘ │
│      │            │            │       │
│      └────────────┴────────────┘       │
│                   │                    │
└───────────────────┼────────────────────┘
                    │
              ┌─────▼─────┐
              │   HTTP    │
              └─────┬─────┘
                    │
┌───────────────────▼────────────────────┐
│ Remote Service                         │
│                                        │
│ ┌──────────┐  ┌──────────┐           │
│ │ AI Logic │  │ Callback │           │
│ └──────────┘  └──────────┘           │
└────────────────────────────────────────┘
```

---

## Step-by-Step Tutorial

### Step 1: Add to Data Pod

#### Add Schema

```typescript
// packages/database/src/schema/my-feature.ts
export const myFeatureItems = pgTable('my_feature_items', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: text('user_id').notNull(),
  content: text('content').notNull(),
  status: text('status').default('pending'),
  aiAnalysis: jsonb('ai_analysis'),  // Results from remote service
});
```

#### Define Events

```typescript
// packages/events/src/domain-events.ts
export type MyFeatureReceivedEvent = BaseEvent<
  'myfeature.received',
  'myfeature_item',
  {
    content: string;
    metadata: Record<string, unknown>;
  }
>;

export type MyFeatureAnalyzedEvent = BaseEvent<
  'myfeature.analyzed',
  'myfeature_item',
  {
    analysis: {
      sentiment: 'positive' | 'negative' | 'neutral';
      keywords: string[];
    };
  }
>;
```

#### Create Webhooks

```typescript
// apps/api/src/webhooks/my-feature.ts
import { publishEvent, createMyFeatureReceivedEvent } from '@synap/events';

export const myFeatureWebhook = new Hono();

// Ingestion endpoint
myFeatureWebhook.post('/receive', async (c) => {
  const { content } = await c.req.json();
  const itemId = generateId();
  
  // Publish event
  const event = createMyFeatureReceivedEvent(itemId, {
    content,
    metadata: {}
  });
  
  await publishEvent(event, {
    userId: c.get('userId'),
    source: 'webhook'
  });
  
  return c.json({ success: true, itemId });
});

// Callback endpoint (from remote service)
myFeatureWebhook.post('/callback', async (c) => {
  const { itemId, analysis } = await c.req.json();
  
  // Publish analyzed event
  const event = createMyFeatureAnalyzedEvent(itemId, { analysis });
  
  await publishEvent(event, {
    userId: 'system',
    source: 'ai-service'
  });
  
  return c.json({ success: true });
});
```

#### Create Event Handlers

```typescript
// packages/api/src/event-handlers/my-feature-storage.ts  
export async function handleMyFeatureReceived(
  event: MyFeatureReceivedEvent
) {
  // Store in database
  await db.insert(myFeatureItems).values({
    id: event.subjectId,
    userId: event.userId,
    content: event.data.content,
    status: 'pending'
  });
}

// packages/api/src/event-handlers/my-feature-intelligence.ts
export async function handleMyFeatureIntelligence(
  event: MyFeatureReceivedEvent
) {
  // Find registered service
  const services = await db
    .select()
    .from(intelligenceServices)
    .where(eq(intelligenceServices.status, 'active'));
  
  const aiService = services.find(s => 
    s.capabilities.includes('my-feature-analysis')
  );
  
  if (!aiService) return;
  
  // Call service
  await fetch(aiService.webhookUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${aiService.apiKey}`
    },
    body: JSON.stringify({
      itemId: event.subjectId,
      content: event.data.content,
      callbackUrl: `${process.env.API_URL}/webhooks/my-feature/callback`
    })
  });
}

// packages/api/src/event-handlers/my-feature-analysis.ts
export async function handleMyFeatureAnalyzed(
  event: MyFeatureAnalyzedEvent
) {
  // Update with analysis
  await db
    .update(myFeatureItems)
    .set({
      aiAnalysis: event.data.analysis,
      status: 'analyzed'
    })
    .where(eq(myFeatureItems.id, event.subjectId));
}
```

---

### Step 2: Build Remote Service

```typescript
// my-ai-service/src/index.ts
import { Hono } from 'hono';

const app = new Hono();

app.post('/webhook', async (c) => {
  const { itemId, content, callbackUrl } = await c.req.json();
  
  // AI processing
  const analysis = await analyzeContent(content);
  
  // Call back
  await fetch(callbackUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      itemId,
      analysis: {
        sentiment: analysis.sentiment,
        keywords: analysis.keywords
      }
    })
  });
  
  return c.json({ success: true });
});

// Register on startup
await registerService({
  serviceId: 'my-feature-ai',
  name: 'My Feature AI',
  webhookUrl: process.env.SERVICE_URL + '/webhook',
  capabilities: ['my-feature-analysis']
});
```

---

## Complete Flow

```
1. Data arrives → /webhooks/my-feature/receive
   ↓
2. Publish: myfeature.received event
   ↓
3. Storage handler → Write to database
   ↓
4. Intelligence handler → Call AI service
   ↓
5. AI service processes → Calls back
   ↓
6. Callback endpoint → Publishes myfeature.analyzed
   ↓
7. Analysis handler → Update database with results
   ↓
8. ✅ Frontend sees analyzed item
```

---

## Real Example: Life Feed

Life Feed is the perfect hybrid plugin example:

**Data Pod side**:
- Schema: `inbox_items` table
- Events: `InboxItemReceivedEvent`, `InboxItemAnalyzedEvent`
- Webhooks: `/webhooks/n8n/inbox`, `/webhooks/intelligence/callback`
- Handlers: storage, intelligence, analysis

**Remote Service side**:
- Service: `synap-intelligence-service`
- Registration: Registers with Intelligence Registry
- Analysis: AI-powered inbox analysis
- Callback: Returns priority/tags/summary

[See full implementation →](./examples/life-feed)

---

## Benefits

✅ **Clean separation**: Data in Data Pod, logic external  
✅ **Type safety**: Full TypeScript types throughout  
✅ **Scalable**: Scale AI service independently  
✅ **Event sourcing**: Can rebuild state from events  
✅ **Flexible**: Update AI logic without Data Pod changes

---

## Next Steps

- **See complete example** → [Life Feed Implementation](./examples/life-feed)
- **Understand Intelligence Registry** → [Registry Guide](./intelligence-registry)
- **Learn event sourcing** → [Event System](#) *(coming soon)*
