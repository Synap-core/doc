---
sidebar_position: 1
---

# Plugin Development

**Extend Data Pod with custom capabilities**

---

## Three Ways to Extend

Data Pod supports three plugin patterns:

### 1. Direct Plugins

**Add features directly to the codebase**

- **Use when**: Core functionality, tight integration, open source
- **Examples**: New API endpoints, custom entities, data transformations
- **Guide**: [Direct Plugins →](./direct-plugins)

### 2. Remote Plugins

**Run services separately, connect via HTTP**

- **Use when**: AI processing, proprietary code, independent scaling
- **Examples**: Intelligence services, external integrations, heavy computation
- **Guide**: [Remote Plugins →](./remote-plugins)

### 3. Hybrid Plugins

**Combine both approaches**

- **Use when**: Need schema + external logic
- **Example**: Life Feed (inbox schema in Data Pod, AI analysis remote)
- **Guide**: [Hybrid Plugins →](./hybrid-plugins)

---

## Quick Decision Tree

```
Need custom data storage?
├─ Yes → Start with Direct Plugin (add schema)
│   └─ Need external AI/processing?
│       └─ Yes → Make it Hybrid
└─ No → Remote Plugin (pure service)
```

---

## Real Example: Life Feed

The Life Feed implementation demonstrates all three patterns:

- **Direct**: Inbox schema, event types, webhooks
- **Remote**: AI analysis service
- **Hybrid**: Schema + types in Data Pod, AI logic remote

[See Life Feed Example →](./examples/life-feed)

---

## Type Safety

All plugin types work with Data Pod's type system:

- Database schema → TypeScript types
- Events → Typed domain events  
- API → tRPC → Auto-generated SDK
- Frontend gets full autocomplete

[Learn more about Type Safety →](./type-safety)

---

## Intelligence Registry

Remote services register capabilities for discovery:

```typescript
POST /trpc/intelligenceRegistry.register
{
  serviceId: 'my-service',
  capabilities: ['analysis'],
  webhookUrl: 'https://...'
}
```

Frontends discover services dynamically via Capabilities API.

[Intelligence Registry Guide →](./intelligence-registry)

---

## Next Steps

1. **Choose your pattern** (direct/remote/hybrid)
2. **Read the specific guide**
3. **See working examples**
4. **Build your plugin**

**New to contributing?** See [Core Contribution →](../core-contribution/overview) first.
