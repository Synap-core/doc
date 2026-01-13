---
sidebar_position: 5
---

# Intelligence Registry

**Service discovery for AI and intelligence capabilities**

---

## What Is It?

A registry where AI services announce their capabilities.

- **Services register** what they can do
- **Data Pod discovers** available services
- **Frontends adapt** to available capabilities

---

## Why Use It?

✅ **Dynamic discovery**: Find services at runtime  
✅ **Decoupled**: Services independent of Data Pod  
✅ **Capability-based**: Route by what service can do  
✅ **Frontend-aware**: UI adapts to available services

---

## Registration

### Register a Service

```typescript
POST /trpc/intelligenceRegistry.register

{
  serviceId: 'my-ai-service',           // Unique ID
  name: 'My AI Service',                // Display name
  webhookUrl: 'https://my-service.com/webhook',
  apiKey: 'secret-key-for-callbacks',   // For Data Pod → Service auth
  capabilities: [                       // What can it do?
    'lifefeed-analysis',
    'document-summary',
    'sentiment-analysis'
  ],
  pricing: 'free',                      // or 'paid'
  version: '1.0.0'
}
```

### What Gets Stored

```typescript
{
  id: 'gen_123',                // Auto-generated
  serviceId: 'my-ai-service',
  name: 'My AI Service',
  webhookUrl: 'https://...',
  apiKey: 'secret...',          // Encrypted
  capabilities: [...],
  pricing: 'free',
  version: '1.0.0',
  status: 'active',             // active | inactive
  registeredAt: '2024-...',
  lastActiveAt: '2024-...'
}
```

---

## Discovery

### List All Services

```typescript
const services = await client.rpc.intelligenceRegistry.list.query();

// Returns:
[
  {
    id: 'gen_123',
    serviceId: 'lifefeed-ai',
    name: 'Life Feed Intelligence',
    capabilities: ['lifefeed-analysis'],
    pricing: 'free',
    status: 'active'
  }
]
```

### Capabilities API

Frontend-friendly discovery:

```typescript
const capabilities = await client.capabilities.list();

// Returns:
{
  core: {
    version: '1.0.0',
    features: ['notes', 'tasks', 'chat', ...]
  },
  intelligenceServices: [
    {
      id: 'gen_123',
      serviceId: 'lifefeed-ai',
      name: 'Life Feed Intelligence',
      capabilities: ['lifefeed-analysis'],
      pricing: 'free',
      version: '1.0.0'
    }
  ]
}
```

---

## Service Selection

### Capability-Based Routing

Data Pod selects services by capability:

```typescript
// Find service that can analyze inbox items
const services = await db
  .select()
  .from(intelligenceServices)
  .where(eq(intelligenceServices.status, 'active'));

const lifefeedService = services.find(s => 
  s.capabilities.includes('lifefeed-analysis')
);

if (lifefeedService) {
  await fetch(lifefeedService.webhookUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${lifefeedService.apiKey}`
    },
    body: JSON.stringify({ ... })
  });
}
```

---

## Integration Patterns

### Pattern 1: Event-Driven

Event triggers service call:

```
Event published (inbox.item.received)
  ↓
Event handler queries registry
  ↓
Finds service with 'lifefeed-analysis' capability
  ↓
Calls service webhook
  ↓
Service processes and calls back
  ↓
Callback publishes new event (inbox.item.analyzed)
```

### Pattern 2: On-Demand

Frontend requests service directly:

```typescript
// Frontend
const capabilities = await client.capabilities.list();
const hasAnalysis = capabilities.intelligenceServices.some(
  s => s.capabilities.includes('document-summary')
);

if (hasAnalysis) {
  // Show "Summarize" button
}
```

---

## Authentication

### Data Pod → Service

Data Pod uses service's API key:

```typescript
await fetch(service.webhookUrl, {
  headers: {
    'Authorization': `Bearer ${service.apiKey}`
  }
});
```

### Service → Data Pod

Service needs its own auth:

```typescript
// When registering, generate API key for callbacks
const callbackKey = await client.rpc.apiKeys.create.mutate({
  name: 'My AI Service Callback',
  scopes: ['write:events']
});

// Service stores this key
process.env.DATA_POD_API_KEY = callbackKey.key;

// Service uses it for callbacks
await fetch(dataPodCallbackUrl, {
  headers: {
    'X-Webhook-Secret': process.env.DATA_POD_API_KEY
  }
});
```

---

## Management

### Update Service

```typescript
await client.rpc.intelligenceRegistry.update.mutate({
  id: 'gen_123',
  updates: {
    capabilities: ['lifefeed-analysis', 'email-triage'],  // Add capability
    version: '1.1.0'
  }
});
```

### Deactivate Service

```typescript
await client.rpc.intelligenceRegistry.updateStatus.mutate({
  id: 'gen_123',
  status: 'inactive'
});
```

### Health Check

```typescript
await client.rpc.intelligenceRegistry.heartbeat.mutate({
  id: 'gen_123'
});
// Updates lastActiveAt timestamp
```

---

## Real Example

Life Feed Intelligence Service:

```typescript
// On startup, register
const response = await fetch(
  `${process.env.DATA_POD_URL}/trpc/intelligenceRegistry.register`,
  {
    method: 'POST',
    body: JSON.stringify({
      serviceId: 'lifefeed-intelligence',
      name: 'Life Feed Intelligence',
      webhookUrl: `${process.env.SERVICE_URL}/analyze`,
      apiKey: process.env.WEBHOOK_SECRET,
      capabilities: ['lifefeed-analysis'],
      pricing: 'free',
      version: '1.0.0'
    })
  }
);
```

Data Pod event handler:

```typescript
// When inbox item received, find service
const services = await db
  .select()
  .from(intelligenceServices)
  .where(eq(intelligenceServices.status, 'active'));

const lifefeedService = services.find(s =>
  s.capabilities.includes('lifefeed-analysis')
);

// Call it
await fetch(lifefeedService.webhookUrl, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${lifefeedService.apiKey}`
  },
  body: JSON.stringify({
    itemId: event.subjectId,
    data: event.data,
    callbackUrl: `${process.env.API_URL}/webhooks/intelligence/callback`
  })
});
```

---

## Best Practices

✅ **Use specific capability names**: `lifefeed-analysis` not `analysis`  
✅ **Version your services**: Semantic versioning  
✅ **Heartbeat regularly**: Keep `lastActiveAt` updated  
✅ **Handle failures gracefully**: Service might be down  
✅ **Validate callbacks**: Check webhook secrets

---

## Next Steps

- **Build a remote service** → [Remote Plugins Guide](./remote-plugins)
- **See complete example** → [Life Feed Implementation](./examples/life-feed)
- **Understand hybrid pattern** → [Hybrid Plugins](./hybrid-plugins)
