---
sidebar_position: 2
---

# Testing Guide

**Testing standards and practices for Synap Backend**

---

## Testing Strategy

### Unit Tests
- Test individual functions and classes
- Mock external dependencies
- Fast execution (< 100ms per test)

### Integration Tests
- Test component interactions
- Use test database
- Test event flows

### E2E Tests
- Test complete user flows
- Use real services (Docker)
- Validate end-to-end behavior

---

## Test Structure

```typescript
import { describe, it, expect, beforeEach } from 'vitest';

describe('NoteService', () => {
  beforeEach(() => {
    // Setup test data
  });
  
  it('should create note', async () => {
    const result = await service.create({ content: 'Test' });
    expect(result.id).toBeDefined();
  });
  
  it('should validate input', async () => {
    await expect(
      service.create({ content: '' })
    ).rejects.toThrow(ValidationError);
  });
});
```

---

## Testing Event Handlers

```typescript
import { NoteCreationHandler } from './note-creation-handler.js';

describe('NoteCreationHandler', () => {
  it('should process note.creation.requested event', async () => {
    const event = createSynapEvent({
      type: 'note.creation.requested',
      data: { content: 'Test' },
    });
    
    const handler = new NoteCreationHandler();
    const result = await handler.handle(event, mockStep);
    
    expect(result.success).toBe(true);
  });
});
```

---

## Testing Agents

```typescript
import { runSynapAgent } from '@synap/ai';

describe('SynapAgent', () => {
  it('should classify intent', async () => {
    const result = await runSynapAgent({
      userId: 'user-123',
      message: 'Create a note',
    });
    
    expect(result.intent).toBe('command');
  });
});
```

---

## Best Practices

1. **Test behavior, not implementation** - Focus on outcomes
2. **Use fixtures** - Reusable test data
3. **Mock external services** - Don't call real APIs
4. **Test error cases** - Invalid inputs, failures
5. **Keep tests fast** - Use mocks and stubs

---

**Next**: See [Code Style](./code-style.md) for coding standards.
