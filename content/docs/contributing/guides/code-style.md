---
sidebar_position: 1
---

# Code Style Guide

**Coding standards and best practices for Synap Backend**

---

## TypeScript Standards

### Type Safety

- ✅ **Always use explicit types** - No `any` types
- ✅ **Use Zod for validation** - Runtime type checking
- ✅ **Strict mode enabled** - `strict: true` in tsconfig
- ✅ **Type inference** - Let TypeScript infer when possible

### Example

```typescript
// ✅ Good
const createNote = async (input: CreateNoteInput): Promise<Note> => {
  const validated = CreateNoteInputSchema.parse(input);
  // ...
};

// ❌ Bad
const createNote = async (input: any): Promise<any> => {
  // ...
};
```

---

## Code Organization

### File Structure

```
packages/my-package/
├── src/
│   ├── index.ts          # Public exports
│   ├── types.ts          # Type definitions
│   ├── utils.ts          # Utility functions
│   └── services/         # Service classes
│       └── my-service.ts
└── tests/
    └── my-service.test.ts
```

### Naming Conventions

- **Files**: `kebab-case.ts`
- **Classes**: `PascalCase`
- **Functions**: `camelCase`
- **Constants**: `UPPER_SNAKE_CASE`
- **Types**: `PascalCase`

---

## Error Handling

### Use SynapError Types

```typescript
import { ValidationError, NotFoundError } from '@synap/core';

if (!input) {
  throw new ValidationError('Input is required', { field: 'input' });
}

if (!entity) {
  throw new NotFoundError('Entity not found', { entityId });
}
```

---

## Logging

### Structured Logging

```typescript
import { createLogger } from '@synap/core';

const logger = createLogger({ module: 'my-service' });

logger.info({ userId, entityId }, 'Processing request');
logger.error({ err: error }, 'Failed to process');
logger.debug({ data }, 'Debug information');
```

---

## Testing

### Unit Tests

```typescript
import { describe, it, expect } from 'vitest';

describe('MyService', () => {
  it('should create entity', async () => {
    const result = await service.create({ name: 'Test' });
    expect(result.id).toBeDefined();
  });
});
```

---

## Documentation

### JSDoc Comments

```typescript
/**
 * Creates a new note entity
 * 
 * @param input - Note creation input
 * @returns Created note with ID
 * @throws {ValidationError} If input is invalid
 */
export async function createNote(input: CreateNoteInput): Promise<Note> {
  // ...
}
```

---

**Next**: See [Testing](./testing.md) for testing guidelines.
