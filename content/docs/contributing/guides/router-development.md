---
sidebar_position: 3
---

# Router Development

**Adding tRPC API endpoints**

---

## Quick Start

```typescript
// 1. Create router
// packages/api/src/routers/my-feature.ts
import { router, protectedProcedure } from '../trpc.js';
import { z } from 'zod';

export const myFeatureRouter = router({
  create: protectedProcedure
    .input(z.object({ name: z.string() }))
    .mutation(async ({ input, ctx }) => {
      return { success: true, name: input.name };
    }),
});

// 2. Register
// packages/api/src/index.ts
registerRouter('myFeature', myFeatureRouter, {
  version: '1.0.0',
  source: 'core',
  description: 'My feature'
});

// 3. Use (auto-typed!)
await client.rpc.myFeature.create.mutate({ name: 'test' });
```

**That's it!** Frontend automatically gets types.

---

## Router Types

### Query (GET)

Read data, no side effects:

```typescript
list: publicProcedure.query(async () => {
  return db.select().from(myTable);
}),
```

### Mutation (POST)

Create/update/delete:

```typescript
create: protectedProcedure
  .input(z.object({ name: z.string() }))
  .mutation(async ({ input }) => {
    await db.insert(myTable).values(input);
    return { success: true };
  }),
```

---

## Authentication

### Public (No Auth)

```typescript
publicProcedure.query(...)  // Anyone can call
```

### Protected (Requires Auth)

```typescript
protectedProcedure.query(({ ctx }) => {
  const userId = ctx.userId;  // Available!
  ...
})
```

---

## Input Validation

Use Zod for type-safe inputs:

```typescript
.input(z.object({
  name: z.string().min(1).max(100),
  email: z.string().email().optional(),
  age: z.number().int().positive(),
}))
```

---

## Error Handling

```typescript
import { TRPCError } from '@trpc/server';

.mutation(async ({ input }) => {
  if (!valid) {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: 'Invalid input'
    });
  }
})
```

---

## Database Access

```typescript
import { db, myTable } from '@synap/database';

.query(async () => {
  return db.select().from(myTable);
})
```

---

## Publishing Events

```typescript
import { publishEvent, createMyEvent } from '@synap/events';

.mutation(async ({ input, ctx }) => {
  const event = createMyEvent(itemId, input);
  await publishEvent(event, { userId: ctx.userId });
  return { success: true };
})
```

---

## Real Example

See `packages/api/src/routers/intelligence-registry.ts` for a complete router.

---

## Testing

```bash
pnpm test -- intelligence-registry
```

---

## Next Steps

- **Add schema** → [Database Migrations](./database-migrations)
- **Add events** → [Event System](./event-system)
