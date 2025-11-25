---
sidebar_position: 5
---

# Hub Protocol Flow

**Complete flow documentation for Data Pod ↔ External Intelligence Services communication**

---

## Overview

The **Hub Protocol** is the standardized contract governing communication between the **Synap Core OS (Data Pod)** and **External Intelligence Services** (available via the marketplace). This protocol enables:

- ✅ **Security**: Mutual authentication and time-limited tokens
- ✅ **Type Safety**: Zod schemas for runtime validation
- ✅ **Traceability**: Complete audit trail of all access
- ✅ **Sovereignty**: The Data Pod has complete control over data access

**Note**: External Intelligence Services are third-party services that can be connected via the marketplace. They provide specialized AI capabilities while respecting data sovereignty.

---

## Complete Flow Example

Let's follow a complex use case: **"Plan my trip to Lisbon for May."**

import MermaidFullscreen from '@site/src/components/MermaidFullscreen';

<MermaidFullscreen 
  title="Hub Protocol Flow: Trip Planning Example"
  value={`sequenceDiagram
    actor User as User
    participant App as Synap App
    participant SDK as synap/client
    participant DataPod as Data Pod
    participant Service as External Service
    participant Agent as Expert Agent
    participant ExternalAPI as External API (e.g., Kayak)

    User->>App: "Plan my trip to Lisbon in May"
    App->>SDK: synap.chat.sendMessage(...)
    
    Note over App, SDK: SDK handles authentication and sends request.

    SDK->>DataPod: 1. chat.sendMessage (tRPC)
    DataPod->>DataPod: 2. Local agent analyzes intent.<br/>"This is a complex planning task."
    
    Note over DataPod: Local agent decides to call external service.

    DataPod->>Service: 3. requestExpertise(agentId: 'TravelPlanner', context)
    Service->>Service: 4. Validates subscription + generates requestId
    
    Note over Service: Service activates 'TravelPlanner' expert agent.

    Service->>DataPod: 5. hub.generateAccessToken(requestId, scope: ['preferences', 'calendar'])
    DataPod->>DataPod: 6. Generates JWT (5 min TTL) + Audit log
    DataPod-->>Service: 7. { token, expiresAt, requestId }
    
    Service->>DataPod: 8. hub.requestData(token, scope, filters)
    DataPod->>DataPod: 9. Validates token + Logs access + Retrieves data
    DataPod-->>Service: 10. { preferences, calendar, ... } (read-only)
    
    Service->>Agent: 11. Analyzes with user data
    Agent->>ExternalAPI: 12. Searches flights/hotels
    ExternalAPI-->>Agent: Available options
    Agent->>Agent: 13. Synthesizes into structured insight
    Agent-->>Service: 14. HubInsight (V1.0 format)
    
    Service->>DataPod: 15. hub.submitInsight(token, insight)
    DataPod->>DataPod: 16. Validates insight + Transforms to events
    DataPod->>DataPod: 17. Emits: project.creation.requested, task.creation.requested (x3)
    DataPod-->>Service: 18. { success, eventIds }
    
    DataPod-->>App: 19. Real-time notification (WebSocket): plan ready
    App->>User: Displays "Trip to Lisbon" project card with tasks`} 
/>

---

## Protocol Endpoints

### 1. `generateAccessToken`

**Purpose**: Generate a temporary access token for the external service

**Request**:
```typescript
{
  requestId: string; // UUID
  scope: string[]; // ['preferences', 'calendar', 'tasks', ...]
  expiresIn: number; // 60-300 seconds (1-5 minutes)
}
```

**Response**:
```typescript
{
  token: string; // JWT token
  expiresAt: number; // Unix timestamp (milliseconds)
  requestId: string; // UUID of the request
}
```

---

### 2. `requestData`

**Purpose**: Allow the external service to request read-only data

**Request**:
```typescript
{
  token: string; // JWT token from generateAccessToken
  scope: string[]; // Data types to retrieve
  filters?: {
    dateRange?: { start: string; end: string };
    entityTypes?: string[];
    limit?: number; // 1-1000, default 100
    offset?: number; // default 0
  };
}
```

**Response**:
```typescript
{
  userId: string;
  requestId: string;
  data: {
    preferences?: UserPreferences;
    calendar?: CalendarEvent[];
    notes?: NoteSummary[];
    tasks?: TaskSummary[];
    // ... other data types
  };
  metadata: {
    retrievedAt: string; // ISO timestamp
    scope: string[];
    recordCount: number;
  };
}
```

---

### 3. `submitInsight`

**Purpose**: Allow the external service to submit a structured insight that will be transformed into events

**Request**:
```typescript
{
  token: string; // JWT token
  insight: {
    version: '1.0';
    type: 'action_plan' | 'analysis' | 'suggestion';
    correlationId: string; // requestId
    actions: Array<{
      eventType: string; // e.g., 'project.creation.requested'
      data: Record<string, unknown>;
      requiresConfirmation?: boolean;
    }>;
    confidence: number; // 0-1
    reasoning: string;
  };
}
```

**Response**:
```typescript
{
  success: boolean;
  requestId: string;
  eventIds: string[]; // UUIDs of created events
  eventsCreated: number;
  errors?: Array<{
    actionIndex: number;
    error: string;
  }>;
}
```

---

## Security & Privacy

### Token Security

- **Time-limited**: Maximum 5 minutes validity
- **Scope-based**: Service can only request authorized data
- **Non-reusable**: Each token is tied to a unique request (`requestId`)
- **Audit trail**: All token generation is logged

### Data Confidentiality

- **No persistent storage**: External services receive data in memory only
- **Automatic cleanup**: Data is garbage collected after processing
- **Anonymized logs**: Error logs contain only IDs, never user content
- **Temporary cache**: Maximum 60-second TTL for performance optimization

### GDPR Compliance

- ✅ **Right to be forgotten**: User can revoke service access at any time
- ✅ **Data portability**: All data remains in user's Data Pod
- ✅ **Transparency**: User can view audit log of all service access
- ✅ **Minimization**: Services only request strictly necessary data

---

## Best Practices

1. **Always validate tokens** before processing requests
2. **Log all access** for complete audit trail
3. **Use minimal scopes** - only request what's needed
4. **Handle errors gracefully** - return clear error messages
5. **Respect token expiration** - never use expired tokens

---

**Next**: See [Hub Protocol API Reference](../api/hub-protocol/overview.md) for complete API documentation.

