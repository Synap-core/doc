---
sidebar_position: 5
---

# API Keys

**Personal access tokens for authenticating external requests to your pod.**

---

## Creating a key

1. Open the Synap app and go to **Settings → API Keys**
2. Click **New Key**
3. Give the key a name (e.g. "Claude Code", "n8n automation", "custom pipeline")
4. Select the scopes you need
5. Click **Create**

The key is displayed **once**. Copy it immediately — it cannot be retrieved after you close the dialog. The stored value is bcrypt-hashed.

---

## Scope reference

| Scope | What it allows |
|-------|---------------|
| `read:entities` | Read entities and their properties |
| `write:entities` | Create and update entities |
| `hub-protocol.read` | Read via Hub Protocol: entities, documents, search, memory |
| `hub-protocol.write` | Write via Hub Protocol: create entities, send messages, trigger AI |
| `skills.invoke` | List and invoke skills via `/api/external/skills` |
| `chat.stream` | Stream AI chat via `/api/external/chat/stream` |
| `mcp.read` | Read resources via the MCP endpoint |
| `mcp.write` | Write via the MCP endpoint |

Scopes are additive. A key with `hub-protocol.read` can call any read operation in the Hub Protocol surface — it does not need separate `read:entities` for those calls. However, `read:entities` is required for direct SDK (tRPC) reads that go outside the Hub Protocol surface.

---

## Recommended scope bundles

| Use case | Scopes to request |
|----------|------------------|
| Read-only analytics or reporting | `read:entities`, `hub-protocol.read` |
| External AI agent (read + write) | `read:entities`, `write:entities`, `hub-protocol.read`, `hub-protocol.write` |
| Invoke skills only | `skills.invoke` |
| Chat with your pod | `chat.stream` |
| Claude Code / custom AI assistant | `skills.invoke`, `chat.stream`, `read:entities` |
| Full external access | `skills.invoke`, `chat.stream`, `read:entities`, `write:entities`, `hub-protocol.read`, `hub-protocol.write` |

Grant only the scopes your use case actually needs. A read-only analytics script does not need `write:entities` or `hub-protocol.write`.

---

## Using a key

Pass the key as a Bearer token in every request:

```bash
curl https://YOUR_POD.synap.live/api/external/skills \
  -H "Authorization: Bearer sk_live_..."
```

For requests that are workspace-scoped (most tRPC procedures), also pass the workspace ID as a header:

```bash
curl "https://YOUR_POD.synap.live/trpc/entities.list?input=..." \
  -H "Authorization: Bearer sk_live_..." \
  -H "x-workspace-id: ws_..."
```

The external chat and skill endpoints infer the workspace from the key's owner. You only need the explicit header for raw tRPC calls.

---

## Security

- Keys are **bcrypt-hashed** at rest. The pod never stores the plaintext value.
- Keys are **scoped** — a compromised key with only `chat.stream` cannot write entities.
- Keys are **rate-limited** per pod tier.
- All API key usage is written to the pod's **audit log**, visible at **Settings → API Keys → Activity**.
- Keys do not expire automatically, but you can revoke them at any time.

**Best practices:**

- Store keys in environment variables, not in source code
- Create separate keys per integration (one for Claude Code, one for n8n, one for your custom script)
- Grant minimum required scopes
- Rotate keys if you suspect compromise — revoking and recreating takes 30 seconds

---

## Revoking a key

1. Go to **Settings → API Keys**
2. Find the key you want to revoke
3. Click **Revoke**

Revocation is immediate. Any in-flight requests using the revoked key will return `401 Unauthorized`.

---

## Next steps

- [Connect AI to your pod — overview](./overview)
- [Skill invocation](./skill-invocation) — requires `skills.invoke`
- [Chat stream](./chat-stream) — requires `chat.stream`
- [SDK and direct API](./sdk-direct) — requires `read:entities` and/or `hub-protocol.*`
