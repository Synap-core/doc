---
sidebar_position: 2
---

# Direct Plugins

**Extend Data Pod by adding code directly to the repository**

---

## When to Use

✅ Core functionality everyone needs  
✅ Tight integration with Data Pod internals  
✅ Open source contribution  
✅ Performance critical features

❌ Proprietary logic → Use [Remote Plugin](./remote-plugins)  
❌ Heavy AI processing → Use [Remote Plugin](./remote-plugins)

---

## How It Works

Add features by modifying Data Pod packages:

1. **Add API endpoint** → Create tRPC router
2. **Add data storage** → Create database schema
3. **Add events** → Define typed domain events
4. **Add logic** → Create event handlers

The SDK auto-updates with your changes.

---

## Step-by-Step Tutorial

### 1. Add a Router

Create a new tRPC endpoint:

```typescript
// packages/api/src/routers/my-feature.ts
import { router, protectedProcedure } from '../trpc.js';
import { z } from 'zod';

export const myFeatureRouter = router({
  create: protectedProcedure
    .input(z.object({ name: z.string() }))
    .mutation(async ({ input, ctx }) => {
      // Your logic here
      return { success: true };
    }),
});
```

Register it:

```typescript
// packages/api/src/index.ts
import { myFeatureRouter } from './routers/my-feature.js';

registerRouter('myFeature', myFeatureRouter, {
  version: '1.0.0',
  source: 'core',
  description: 'My feature'
});
```

**Done!** Frontend automatically gets typed access:

```typescript
await client.rpc.myFeature.create.mutate({ name: 'test' });
```

---

### 2. Add Schema (Optional)

Need to store data? Add a table:

```typescript
// packages/database/src/schema/my-feature.ts
import { pgTable, uuid, text } from 'drizzle-orm/pg-core';

export const myFeatureData = pgTable('my_feature_data', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: text('user_id').notNull(),
  name: text('name').notNull(),
});
```

Create migration:

```sql
-- packages/database/migrations/XXXX_my_feature.sql
CREATE TABLE my_feature_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  name TEXT NOT NULL
);
```

Export from schema:

```typescript
// packages/database/src/schema/index.ts
export * from './my-feature.js';
```

---

### 3. Add Events (Optional)

Need event sourcing? Define typed events:

```typescript
// packages/events/src/domain-events.ts

// Define your event
export type MyFeatureCreatedEvent = BaseEvent<
  'myfeature.created',
  'myfeature_item',
  {
    name: string;
    metadata?: Record<string, unknown>;
  }
>;

// Add to union
export type DomainEvent =
  | InboxItemReceivedEvent
  | MyFeatureCreatedEvent  // ← Add here
  | ...;
```

Create builder:

```typescript
// packages/events/src/publisher.ts
export function createMyFeatureCreatedEvent(
  itemId: string,
  data: EventDataFor<'myfeature.created'>
) {
  return {
    type: 'myfeature.created' as const,
    subjectId: itemId,
    subjectType: 'myfeature_item' as const,
    data,
  };
}
```

Publish events:

```typescript
import { publishEvent, createMyFeatureCreatedEvent } from '@synap/events';

const event = createMyFeatureCreatedEvent(itemId, { name: 'test' });
await publishEvent(event, { userId: ctx.userId });
```

---

### 4. Add Event Handler (Optional)

Process events asynchronously:

```typescript
// packages/api/src/event-handlers/my-feature.ts
import type { MyFeatureCreatedEvent } from '@synap/events';

export async function handleMyFeatureCreated(
  event: MyFeatureCreatedEvent & { userId: string }
) {
  // Process event
  // Update projections
  // Trigger side effects
}
```

Register handler:

```typescript
// packages/api/src/event-handlers/index.ts
switch (event.type) {
  case 'myfeature.created':
    await handleMyFeatureCreated(event);
    break;
}
```

---

## Real Example: Intelligence Registry

See how Intelligence Registry implements all these patterns:

- **Router**: `packages/api/src/routers/intelligence-registry.ts`
- **Schema**: `packages/database/src/schema/intelligence-services.ts`
- **Events**: Not needed (simple CRUD)

[View code →](https://github.com/Synap-core/backend/tree/main/packages/api/src/routers/intelligence-registry.ts)

---

## Testing

```bash
# Run tests
pnpm test

# Test your router specifically
pnpm test -- my-feature
```

---

## Building

```bash
# Build packages
cd packages/database && pnpm build
cd ../api && pnpm build
cd ../../apps/api && pnpm build
```

---

## Type Safety

Every step is type-safe:

- ✅ Schema → TypeScript types (Drizzle ORM)
- ✅ Events → Typed domain events
- ✅ Router → tRPC types
- ✅ SDK → Auto-generated client types

Frontends get full autocomplete!

---

## Next Steps

- **Need external processing?** → [Hybrid Plugins](./hybrid-plugins)
- **Contributing to core?** → [Core Contribution](../core-contribution/overview)
- **See complete example** → [Life Feed Example](./examples/life-feed)
