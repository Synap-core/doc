---
sidebar_position: 3
---

# Remote Plugins

**Run services separately, connect via HTTP**

---

## When to Use

✅ AI/ML processing (heavy computation)  
✅ Proprietary/commercial logic  
✅ Independent scaling needs  
✅ External team ownership

❌ Core functionality → Use [Direct Plugin](./direct-plugins)  
❌ Need custom schema → Use [Hybrid Plugin](./hybrid-plugins)

---

## How It Works

```
Your Service ←─────HTTP────── Data Pod
     │                            │
     ├─ Register capabilities     │
     ├─ Receive webhook calls     │
     └─ Call back with results ───┘
```

1. **Build your service** (any tech stack)
2. **Register with Intelligence Registry**
3. **Receive webhooks** from Data Pod
4. **Call back** with results

---

## Step-by-Step Tutorial

### 1. Build Your Service

Any tech stack works. Example with Node.js:

```typescript
// src/index.ts
import { Hono } from 'hono';

const app = new Hono();

app.post('/webhook', async (c) => {
  const payload = await c.req.json();
  
  // Your AI/processing logic
  const result = await processData(payload.data);
  
  // Call back to Data Pod
  await fetch(payload.callbackUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      itemId: payload.itemId,
      result
    })
  });
  
  return c.json({ success: true });
});

export default { port: 3001, fetch: app.fetch };
```

---

### 2. Register with Intelligence Registry

Register your service:

```typescript
const response = await fetch('http://datapod/trpc/intelligenceRegistry.register', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    serviceId: 'my-ai-service',
    name: 'My AI Service',
    webhookUrl: 'https://my-service.com/webhook',
    apiKey: process.env.SERVICE_API_KEY,
    capabilities: ['analysis', 'summarization'],
    pricing: 'free',
    version: '1.0.0'
  })
});
```

---

### 3. Implement Webhook Endpoint

Data Pod will call your webhook:

```typescript
app.post('/webhook', async (c) => {
  // Authenticate
  const apiKey = c.req.header('Authorization')?.replace('Bearer ', '');
  if (apiKey !== process.env.SERVICE_API_KEY) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  
  // Parse request
  const { itemId, data, callbackUrl } = await c.req.json();
  
  // Process with your AI/logic
  const analysis = await analyzeData(data);
  
  // Call back to Data Pod
  await fetch(callbackUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Webhook-Secret': process.env.CALLBACK_SECRET
    },
    body: JSON.stringify({
      itemId,
      analysis: {
        priority: 'high',
        tags: ['important', 'ai-analyzed'],
        summary: analysis.summary
      }
    })
  });
  
  return c.json({ success: true });
});
```

---

### 4. Handle Callbacks

Data Pod expects results at callback URL:

```typescript
// What Data Pod expects
{
  itemId: string;
  analysis: {
    priority?: 'urgent' | 'high' | 'normal' | 'low';
    tags?: string[];
    category?: string;
    summary?: string;
  }
}
```

---

## Discovery

Frontends discover your service:

```typescript
// Frontend code
const capabilities = await client.capabilities.list();

// Find your service
const myService = capabilities.intelligenceServices.find(
  s => s.serviceId === 'my-ai-service'
);
```

---

## Authentication

Two-way authentication:

**Data Pod → Your Service**:
```typescript
headers: {
  'Authorization': `Bearer ${service.apiKey}`
}
```

**Your Service → Data Pod**:
```typescript
headers: {
  'X-Webhook-Secret': process.env.CALLBACK_SECRET
}
```

---

## Real Example: Life Feed Intelligence

See the complete implementation:

- Service: `synap-intelligence-service/`
- Registration: Happens on startup
- Webhook: Receives inbox items
- Callback: Returns analysis

[View example →](./examples/life-feed)

---

## Testing Locally

```bash
# 1. Start Data Pod
cd synap-backend/apps/api
pnpm dev

# 2. Start your service
cd my-service
pnpm dev

# 3. Register service
curl -X POST http://localhost:3000/trpc/intelligenceRegistry.register \
  -H "Content-Type: application/json" \
  -d '{"serviceId":"test","webhookUrl":"http://localhost:3001/webhook",...}'

# 4. Trigger workflow
curl -X POST http://localhost:3000/webhooks/n8n/inbox \
  -H "X-Webhook-Secret: dev" \
  -d '{"items":[...]}'
```

---

## Deployment

Deploy your service anywhere:

- **Cloud**: AWS, Google Cloud, Azure
- **PaaS**: Vercel, Railway, Fly.io
- **Self-hosted**: Docker, Kubernetes

Data Pod connects via HTTP - deployment is independent.

---

## Next Steps

- **Need schema in Data Pod?** → [Hybrid Plugins](./hybrid-plugins)
- **See complete workflow** → [Life Feed Example](./examples/life-feed)
- **Learn Intelligence Registry** → [Intelligence Registry Guide](./intelligence-registry)
