---
sidebar_position: 2
---

# Internal Plugins

**Complete guide to creating internal plugins with The Architech**

---

## Overview

Internal plugins modify the Core OS codebase and database directly. They are installed via The Architech CLI.

**Plugins can add intelligence** through:
- **Single Agents**: Simple LangGraph workflows for specific tasks
- **Agent Graphs**: Complex multi-agent orchestration with supervisor patterns
- **Tools**: New capabilities that agents can use

---

## Plugin Structure

```
my-plugin/
├── manifest.json              # Plugin manifest
├── package.json              # npm dependencies
├── src/
│   ├── router.ts             # tRPC router
│   ├── handlers.ts           # Event handlers
│   └── schema.ts             # Database schemas
├── migrations/
│   └── 001_add_tables.sql    # SQL migrations
└── README.md                  # Documentation
```

---

## Manifest

```json
{
  "name": "@synap/plugin-invoicing",
  "version": "1.0.0",
  "description": "Billing system for Synap",
  "synap": {
    "version": ">=1.0.0",
    "type": "plugin",
    "capabilities": {
      "routers": ["invoicing"],
      "handlers": ["invoice.created", "invoice.paid"],
      "entities": ["invoice", "client"],
      "migrations": ["001_add_invoices.sql"]
    }
  }
}
```

---

## Router Example

```typescript
import { router, protectedProcedure } from '@synap/api';
import { z } from 'zod';
import { createSynapEvent } from '@synap/types';

export const invoicingRouter = router({
  create: protectedProcedure
    .input(z.object({
      clientId: z.string().uuid(),
      amount: z.number().positive(),
    }))
    .mutation(async ({ ctx, input }) => {
      const event = createSynapEvent({
        type: 'invoice.created',
        userId: ctx.userId!,
        data: input,
      });
      
      await eventRepository.append(event);
      
      return { success: true, invoiceId: event.aggregateId };
    }),
});
```

---

## Handler Example

```typescript
import { IEventHandler } from '@synap/jobs';

export class InvoiceHandler implements IEventHandler {
  async handle(event: SynapEvent): Promise<void> {
    if (event.type === 'invoice.created') {
      // Create invoice in database
      await db.insert(invoices).values({
        id: event.aggregateId,
        userId: event.userId,
        amount: event.data.amount,
      });
    }
  }
}
```

---

## Adding Intelligence via Plugins

### Single Agent Plugin

```typescript
// src/agent.ts
import { StateGraph, START, END } from '@langchain/langgraph';

export function createMyAgent() {
  const graph = new StateGraph(MyAgentState);
  
  graph.addNode('process', processNode);
  graph.addNode('create', createEntityNode);
  
  graph.addEdge(START, 'process');
  graph.addEdge('process', 'create');
  graph.addEdge('create', END);
  
  return graph.compile();
}

// manifest.json
{
  "synap": {
    "type": "agent-plugin",
    "pattern": "simple",
    "capabilities": {
      "agents": ["my-agent"],
      "tools": ["createEntity"]
    }
  }
}
```

### Agent Graph Plugin

```typescript
// Complex multi-agent workflow
export function createProjectPlannerAgent() {
  const graph = new StateGraph(ProjectPlannerState);
  
  // Supervisor agent
  graph.addNode('supervisor', supervisorNode);
  
  // Worker agents
  graph.addNode('researcher', researchAgent);
  graph.addNode('writer', writingAgent);
  
  // Dynamic routing
  graph.addConditionalEdges('supervisor', routeToWorker);
  
  return graph.compile();
}
```

## Installation

```bash
npx @thearchitech/cli install @synap/plugin-invoicing
```

This will:
1. Install npm dependencies
2. Run database migrations
3. Register router
4. Register handlers
5. Register agents (if agent plugin)

---

**Next**: See [External Services](./external-services.md) for marketplace services.

