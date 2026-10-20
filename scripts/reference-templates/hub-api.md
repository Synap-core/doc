The Hub REST API is the pod's HTTP API for anything that is not a TypeScript app: agents, scripts, automation tools and
integrations in any language. It is served under `/api/hub` on every pod. The pages in this section are rendered from
its OpenAPI description, grouped by tag.

## The OpenAPI description

Every pod publishes the OpenAPI description of its Hub REST API, without authentication:

```bash
curl https://pod.example.com/api/hub/openapi.json
```

It matches the pod's exact version, so use it (or a client generated from it) when your pod runs a different version
from the one these pages were generated from.

## Authentication

```
Authorization: Bearer <API key>
```

| Scope | Allows |
|---|---|
| `hub-protocol.read` | `GET` requests |
| `hub-protocol.write` | Writes |

A key's grant can narrow what it reads further; a read the grant cannot bound answers `403 GRANT_DOOR_UNSUPPORTED`.
See [API keys](/docs/build/api-keys).

Requests can name a workspace with the `X-Workspace-Id` header (or in the body or query, depending on the route).

## Writes and proposals

Writes go through the pod's governance: a write is applied directly where a rule allows it, and otherwise returns a
proposal. Approving a proposal is refused for an agent's key: approval is a human step. See
[Proposals](/docs/reference/hub-api/proposals).

## Clients

- [`@synap-core/hub-rest-client`](https://www.npmjs.com/package/@synap-core/hub-rest-client): a zero-dependency
  TypeScript client for Node.js, browsers, Deno and Bun.
- Any OpenAPI client generator, from `/api/hub/openapi.json`.
- [`@synap-core/cli`](/docs/reference/cli) and the [MCP endpoint](/docs/build/agents/mcp) use the same API.

## Errors

Errors are JSON with an `error` message, and an HTTP status that says what went wrong: `401` for a missing or invalid
key, `403` for a missing scope or a refused grant, `404` for a missing object, `409` for a conflict such as a proposal
that is no longer pending.
