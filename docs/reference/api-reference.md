---
sidebar_position: 1
---

# API Reference

> **Auto-generated** from tRPC router definitions. Do not edit manually — run `pnpm gen-docs` in `synap-backend/packages/api` to regenerate.

This page lists every tRPC procedure exposed by the Synap data pod. All procedures are callable via `@synap/sdk` (vanilla JS) or `@synap/react` hooks.

## How to read this page

- **query** — use `.useQuery(input)` (React) or `.query(input)` (vanilla)
- **mutation** — use `.useMutation()` (React) or `.mutate(input)` (vanilla)
- **Router key** — the first segment in the call chain, e.g. `entities.list`

```typescript
// Vanilla JS
import { createSynapClient } from "@synap/sdk";
const synap = createSynapClient({ podUrl, apiKey, workspaceId });
const result = await synap.entities.list.query({ limit: 20 });

// React
import { useSynap } from "@synap/react";
const { data } = useSynap().entities.list.useQuery({ limit: 20 });
```

---

### Agent Configs

> Router key: `agentConfigs`

#### `agentConfigs.list` <span class="badge badge--info">query</span>

List all agent configs for the current user in this workspace.


---

### API Keys

> Router key: `apiKeys`

#### `apiKeys.list` <span class="badge badge--info">query</span>

List API keys for the current user

#### `apiKeys.listSystemKeys` <span class="badge badge--info">query</span>

List all system keys (System Admin only)


---

### Capabilities & Cells

> Router key: `capabilities`

#### `capabilities.list` <span class="badge badge--info">query</span>

List all available capabilities. Returns core features, plugins, and intelligence services with cached health status (lastHealthCheck). Does NOT ping services — use checkHealth for that so this query stays fast.


---

### Channel Gateway

> Router key: `channelGateway`

#### `channelGateway.list` <span class="badge badge--info">query</span>

List all channel connections for the current user.


---

### Connectors

> Router key: `connectors`

#### `connectors.status` <span class="badge badge--info">query</span>

Diagnostic: returns what the pod sees for CP connection settings. Helps debug provisioning issues.


---

### Files

> Router key: `files`

#### `files.listBuckets` <span class="badge badge--info">query</span>

List buckets


---

### Health

> Router key: `health`

#### `health.alive` <span class="badge badge--info">query</span>

Liveness probe - basic "is the service running" check Should always return quickly, used by orchestrators

#### `health.ready` <span class="badge badge--info">query</span>

Readiness probe - is the service ready to handle traffic Checks all critical dependencies

#### `health.migrations` <span class="badge badge--info">query</span>

Migration status - shows applied database migrations

#### `health.metrics` <span class="badge badge--info">query</span>

System metrics - basic operational metrics


---

### Inbox

> Router key: `inbox`

#### `inbox.stats` <span class="badge badge--info">query</span>

Get stats (for header display)


---

### Intelligence (AI)

> Router key: `intelligence`

#### `intelligence.listSpecialisations` <span class="badge badge--info">query</span>

List specialisations from the connected intelligence service. Proxies to hub GET /api/specialisations — gracefully returns [] if the hub is unreachable (service not yet connected). Used by the branch picker and Intelligence Studio Capabilities tab.

#### `intelligence.agentDefinitions` <span class="badge badge--info">query</span>

List agent definitions from the connected intelligence service. Proxies to hub GET /api/agent-definitions — gracefully returns [] if the hub is unreachable (service not yet connected).

#### `intelligence.getServiceCommands` <span class="badge badge--info">query</span>

getServiceCommands Returns previously stored Docker run commands for provisioned services. Allows wizards to show the command on re-open without regenerating credentials.

#### `intelligence.getLatestMemoryState` <span class="badge badge--info">query</span>

getLatestMemoryState Returns the latest compacted memory state for the user's personal AI timeline. Compacted states are written by any Hub Protocol service that implements the session-scoped memory protocol (currently Synap Agent Hub). Returns null if no state has been produced yet (new user or legacy service).

#### `intelligence.getServiceManifest` <span class="badge badge--info">query</span>

getServiceManifest Returns the AgentManifest for the workspace's active IS. For Synap IS (default): always fetches live from IS. For custom IS: returns cached manifest from DB metadata, refreshes if stale (>1h).

#### `intelligence.listSystemSkills` <span class="badge badge--info">query</span>

listSystemSkills Returns the list of system skills served by the active IS.

#### `intelligence.listRegisteredServices` <span class="badge badge--info">query</span>

listRegisteredServices Returns all IS records registered for the workspace. apiKey is never returned.


---

### MCP Servers

> Router key: `mcpServers`

#### `mcpServers.list` <span class="badge badge--info">query</span>

List all MCP servers for the current workspace.


---

### Notifications

> Router key: `notifCenter`

#### `notifCenter.unreadCount` <span class="badge badge--info">query</span>

Total unread count for the bell badge.

#### `notifCenter.markAllRead` <span class="badge badge--warning">mutation</span>

Mark all unread notifications as read.

#### `notifCenter.dismissAll` <span class="badge badge--warning">mutation</span>

Dismiss all notifications (clear bell).

#### `notifCenter.getPrefs` <span class="badge badge--info">query</span>

Get notification preferences for the current user + workspace.


---

### Preferences

> Router key: `preferences`

#### `preferences.get` <span class="badge badge--info">query</span>

Get user preferences

#### `preferences.getViewModes` <span class="badge badge--info">query</span>

Get view mode preferences

#### `preferences.getIntelligenceServices` <span class="badge badge--info">query</span>

Get intelligence service preferences and available services


---

### Profile Relations

> Router key: `profileRelations`

#### `profileRelations.list` <span class="badge badge--info">query</span>

List all profile relations for profiles accessible in this workspace. Used by the data structure viewer.


---

### Profiles

> Router key: `profiles`

#### `profiles.list` <span class="badge badge--info">query</span>

List accessible profiles (system + workspace + user)


---

### Property Definitions

> Router key: `propertyDefs`

#### `propertyDefs.list` <span class="badge badge--info">query</span>

List property definitions accessible to the calling workspace. Returns only defs whose profile is accessible to this workspace (system profiles, workspace-owned profiles, shared profiles with access, user profiles) plus globally-scoped defs (profileId IS NULL). Uses workspaceProcedure so ctx.workspaceId is available.


---

### Relation Definitions

> Router key: `relationDefs`

#### `relationDefs.list` <span class="badge badge--info">query</span>

List all relation definitions for the current workspace


---

### Relations

> Router key: `relations`

#### `relations.listTypes` <span class="badge badge--info">query</span>

List all available relation types with metadata Returns all relation definitions from the workspace's relation_defs table. Default types (assigned_to, depends_on, etc.) are seeded during workspace creation.


---

### Vault

> Router key: `secretsVault`

#### `secretsVault.hasVault` <span class="badge badge--info">query</span>

Check if vault is set up for current user

#### `secretsVault.getVaultMetadata` <span class="badge badge--info">query</span>

Get vault metadata (for client-side password verification)

#### `secretsVault.recordUnlock` <span class="badge badge--warning">mutation</span>

Record vault unlock (for audit trail)

#### `secretsVault.generateRecoveryKey` <span class="badge badge--warning">mutation</span>

Generate recovery key (server-side for security)

#### `secretsVault.getCategories` <span class="badge badge--info">query</span>

Get all categories

#### `secretsVault.getTags` <span class="badge badge--info">query</span>

Get all tags

#### `secretsVault.sharedWithMe` <span class="badge badge--info">query</span>

Get secrets shared with me

#### `secretsVault.getSecurityStats` <span class="badge badge--info">query</span>

Get security stats (compromised, weak passwords, old passwords)


---

### Workspace Setup

> Router key: `setup`

#### `setup.status` <span class="badge badge--info">query</span>


---

### System

> Router key: `system`

#### `system.getCapabilities` <span class="badge badge--info">query</span>

Get system capabilities Returns all registered event types, handlers, tools, and routers. This gives a complete overview of the system's architecture.

#### `system.getDashboardMetrics` <span class="badge badge--info">query</span>

Get Dashboard Metrics (V2) Returns aggregated real-time metrics optimized for the Dashboard view. Includes health status, throughput, latency, and key system statistics.

#### `system.getServiceHealth` <span class="badge badge--info">query</span>

Get service health status Checks the connectivity and health of all dependent services: - Postgres (Database) - Typesense (Search) - MinIO (Storage) - Hydra (OAuth Provider) - Kratos (Identity Provider)

#### `system.getDataPodStats` <span class="badge badge--info">query</span>

Get Data Pod Stats Returns global counts for the Data Pod overview dashboard. Requires authentication.


---

### Search Index

> Router key: `typesense`

#### `typesense.getStats` <span class="badge badge--info">query</span>

Get collection statistics

#### `typesense.getQueueStatus` <span class="badge badge--info">query</span>

Get indexing queue status

#### `typesense.initializeCollections` <span class="badge badge--warning">mutation</span>

Initialize collections (admin only)


---

### Users

> Router key: `users`

#### `users.me` <span class="badge badge--info">query</span>

Get the currently authenticated user's identity. Returns Kratos session data merged with DB fields (name, avatarUrl, timezone, locale).


---

### Webhooks

> Router key: `webhooks`

#### `webhooks.list` <span class="badge badge--info">query</span>

List all webhook subscriptions for the current user


---

### Widget Definitions

> Router key: `widgetDefinitions`

#### `widgetDefinitions.list` <span class="badge badge--info">query</span>

List active widget definitions for a workspace. Returns system-wide builtins first, then workspace-specific custom widgets.


---

### Workspaces

> Router key: `workspaces`

#### `workspaces.list` <span class="badge badge--info">query</span>

List user's workspaces


---

*Generated 2026-03-25 from `synap-backend/packages/api/src/routers/`*
