---
sidebar_position: 3
---

# External Services

**Complete guide to creating external services for the Marketplace**

---

## Overview

External services are hosted separately and connected via the Hub Protocol. They provide specialized intelligence or capabilities that can be accessed by any Data Pod via the marketplace.

**External services can provide**:
- **Expert Agents**: Specialized AI agents (e.g., travel planning, financial analysis)
- **Cloud Resources**: Services requiring GPU, external APIs, etc.
- **Shared Intelligence**: Services accessible to multiple users
- **Independent Evolution**: Services that update without affecting Data Pods

---

## Service Structure

```
my-service/
├── src/
│   ├── api.ts              # API endpoint
│   ├── agent.ts            # Expert agent logic
│   └── index.ts            # Entry point
├── package.json
└── README.md
```

---

## Implementing Hub Protocol

```typescript
import { HubOrchestratorBase } from '@synap/hub-orchestrator-base';
import type { ExpertiseRequest, ExpertiseResponse } from '@synap/hub-orchestrator-base';

export class TravelPlannerService extends HubOrchestratorBase {
  async processRequest(request: ExpertiseRequest): Promise<ExpertiseResponse> {
    // Access user data via HubProtocolClient
    const data = await this.hubClient.requestData({
      token: request.token,
      scope: ['preferences', 'calendar'],
    });
    
    // Process with expert agent
    const insight = await this.planTrip(data);
    
    // Submit insight back
    await this.hubClient.submitInsight({
      token: request.token,
      insight,
    });
    
    return { success: true };
  }
  
  private async planTrip(data: any) {
    // Your expert logic here
    return {
      version: '1.0',
      type: 'action_plan',
      actions: [
        {
          eventType: 'project.creation.requested',
          data: { title: 'Trip to Lisbon' },
        },
      ],
    };
  }
}
```

---

## Registration

Register your service on the Marketplace:

```typescript
POST /api/marketplace/register
{
  "name": "travel-planner",
  "description": "AI travel planning service",
  "endpoint": "https://travel-planner.example.com",
  "capabilities": ["planning", "booking"],
  "pricing": {
    "model": "per-request",
    "price": 0.10
  }
}
```

---

## API Endpoint

Your service should expose an endpoint that accepts Hub Protocol requests:

```typescript
import { Hono } from 'hono';
import { TravelPlannerService } from './service';

const app = new Hono();
const service = new TravelPlannerService();

app.post('/expertise', async (c) => {
  const request = await c.req.json();
  const response = await service.processRequest(request);
  return c.json(response);
});
```

---

## Best Practices

1. **Follow Hub Protocol** - Use standard schemas
2. **Handle errors gracefully** - Return clear error messages
3. **Respect token expiration** - Never use expired tokens
4. **Log appropriately** - No user data in logs
5. **Version your API** - Support multiple versions

---

**Next**: See [SDK Reference](../sdk/sdk-reference.md) for client integration.

