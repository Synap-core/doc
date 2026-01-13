---
sidebar_position: 1
---

# Extending Synap

**Extend Data Pod with custom capabilities and integrations**

---

## Three Ways to Extend

Synap supports three extension patterns:

### 1. Internal Extensions (Direct)

**Add features directly to the codebase**

- **Use when**: Contributing core functionality, tight integration, open source.
- **Examples**: New API endpoints, custom entities, data transformations.
- **Guide**: [Internal Extensions →](./direct-plugins)

### 2. External Integrations (Remote)

**Run services separately, connect via Hub Protocol**

- **Use when**: AI processing, proprietary code, independent scaling.
- **Examples**: Intelligence services, external integrations, heavy computation.
- **Guide**: [External Integrations →](./remote-plugins)

### 3. Hybrid Modules

**Combine both approaches**

- **Use when**: Need schema + external logic.
- **Example**: Life Feed (inbox schema in Data Pod, AI analysis remote).
- **Guide**: [Hybrid Modules →](./hybrid-plugins)

---

## Quick Decision Tree

```
Need custom data storage?
├─ Yes → Internal Extension (contribute code)
│   └─ Need external AI/processing?
│       └─ Yes → Make it Hybrid
└─ No → External Integration (pure service)
```

---

## Real Example: Life Feed

The Life Feed implementation demonstrates all three patterns:

- **Internal**: Inbox schema, event types, webhooks
- **External**: AI analysis service
- **Hybrid**: Schema + types in Data Pod, AI logic remote

---

## Type Safety

All extensions work with Data Pod's type system:

- Database schema → TypeScript types
- Events → Typed domain events  
- API → tRPC → Auto-generated SDK
- Frontend gets full autocomplete

---

## Intelligence Registry

External services register capabilities for discovery:

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

1.  **Choose your pattern**
2.  **Read the specific guide**
3.  **Build your extension**

**New to contributing?** See [Contributing Guide →](../contributing/overview) first.
