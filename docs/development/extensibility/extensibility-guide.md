---
sidebar_position: 1
---

# Extensibility Guide

**Complete guide to extending the Synap ecosystem**

---

## Overview

Synap offers two extensibility mechanisms for adding intelligence and capabilities:

1. **Internal Plugins (The Architech)** - Extensions that modify the Core OS directly
   - **Single Agents**: Simple LangGraph workflows
   - **Agent Graphs**: Complex multi-agent orchestration
   - **Business Logic**: Custom routers, handlers, database schemas

2. **External Services (Marketplace)** - Services hosted separately and connected via Hub Protocol
   - **Specialized AI**: Expert agents with cloud resources
   - **Shared Services**: Services accessible to multiple users
   - **Independent Updates**: Services that evolve independently

See [Plugin System](../../architecture/core-concepts/plugin-system.md) for the decision matrix and intelligence plugin details.

---

## Internal Plugins

### When to Use

- Need direct database access
- Complex business logic
- Performance critical
- User/organization-specific

### Creating a Plugin

1. **Create manifest.json**:
```json
{
  "name": "@synap/plugin-myplugin",
  "version": "1.0.0",
  "synap": {
    "version": ">=1.0.0",
    "type": "plugin",
    "capabilities": {
      "routers": ["myplugin"],
      "handlers": ["myplugin.event"],
      "migrations": ["001_add_tables.sql"]
    }
  }
}
```

2. **Create router**:
```typescript
import { router, protectedProcedure } from '@synap/api';
import { z } from 'zod';

export const myPluginRouter = router({
  create: protectedProcedure
    .input(z.object({ name: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Your logic here
    }),
});
```

3. **Create handler**:
```typescript
import { IEventHandler } from '@synap/jobs';

export class MyPluginHandler implements IEventHandler {
  async handle(event: SynapEvent): Promise<void> {
    // Handle event
  }
}
```

---

## External Services

### When to Use

- Providing AI expertise
- Need cloud resources
- Shared across users
- Independent updates

### Creating a Service

1. **Implement Hub Protocol**:
```typescript
import { HubOrchestratorBase } from '@synap/hub-orchestrator-base';

export class MyService extends HubOrchestratorBase {
  async processRequest(request: ExpertiseRequest): Promise<ExpertiseResponse> {
    // Your logic here
    return {
      insight: {
        version: '1.0',
        type: 'action_plan',
        actions: [],
      },
    };
  }
}
```

2. **Register on Marketplace**:
```typescript
POST /api/marketplace/register
{
  "name": "my-service",
  "endpoint": "https://my-service.example.com",
  "capabilities": ["planning"]
}
```

---

## Best Practices

1. **Follow the protocol** - Adhere to Hub Protocol V1.0
2. **Document thoroughly** - Clear README and examples
3. **Test extensively** - Unit and integration tests
4. **Version carefully** - Semantic versioning

---

**Next**: See [Internal Plugins](./internal-plugins.md) or [External Services](./external-services.md) for detailed guides.

