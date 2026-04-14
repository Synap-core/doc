# Type Packages: Architecture & Developer Guide

How `@synap-core/types` and `@synap-core/api-types` connect the backend to the frontend — and what you need to know when changing backend APIs.

## Overview

Synap uses two shared type packages that bridge the data pod backend with all frontend consumers (web app, browser/Electron, SDK):

| Package | Purpose | Source |
|---------|---------|--------|
| `@synap-core/types` | Domain types + Zod schemas (entities, views, templates, profiles, etc.) | `synap-backend/packages/types/` |
| `@synap-core/api-types` | tRPC `AppRouter` type (auto-generated from backend router) | `synap-backend/packages/api-types/` |

Both packages live in `synap-backend/` but are included in the **root pnpm workspace**, so all frontend packages resolve them as workspace links — always in sync with source.

## How It Works

```
synap-backend/packages/api/src/routers/*.ts   (tRPC procedures)
        |
        v
synap-backend/packages/api/src/root.ts        (coreRouter, exports AppRouter type)
        |
        v  gen-types.mjs (dts-bundle-generator)
synap-backend/packages/api-types/src/generated.d.ts
        |
        v  workspace:* link
@synap/client → createTRPCReact<AppRouter>()   (full type inference)
        |
        v
Components get autocomplete + type safety on all tRPC calls
```

### Local Development

Frontend packages use `"workspace:*"` references, which means:

- **No npm publish needed** for local development
- Types update instantly when you edit backend source
- `trpc.workspaces.create.useMutation()` always reflects the current router

### npm Publishing (CI)

External consumers (`synap-intelligence-service`, third-party integrations) use npm packages. A GitHub Action (`.github/workflows/publish-types.yml`) auto-publishes on push to `main` when type-relevant files change. When pnpm publishes a package, it automatically replaces `workspace:*` with the real version number.

## Developer Workflow

### Adding a new tRPC procedure

**Order matters.** Follow these steps:

1. **Write the procedure** in `synap-backend/packages/api/src/routers/<router>.ts`

2. **Build the API package** (needed for type extraction):
   ```bash
   cd synap-backend/packages/api
   pnpm build
   ```

3. **Regenerate API types**:
   ```bash
   node scripts/gen-types.mjs
   ```
   This updates `synap-backend/packages/api-types/src/generated.d.ts` with the new procedure.

4. **Use it in the frontend** — it's immediately available:
   ```typescript
   const mutation = trpc.myRouter.myNewProcedure.useMutation();
   ```

5. **Commit both** the backend router change and the regenerated `generated.d.ts` together.

### Modifying domain types (`@synap-core/types`)

1. **Edit types** in `synap-backend/packages/types/src/`
2. **Build** (if the frontend imports from `dist/`):
   ```bash
   cd synap-backend/packages/types
   pnpm build
   ```
3. Frontend packages that import from `@synap-core/types` see changes immediately (workspace link resolves to source via the `types` export condition).

### Adding a new Zod schema for a procedure

If you're adding validation schemas that both backend and frontend need:

1. Define the schema in `@synap-core/types` (e.g., `synap-backend/packages/types/src/templates/schemas.ts`)
2. Import it in the backend router's `.input()` validation
3. Import it in frontend for client-side validation if needed
4. Both sides reference the same schema — single source of truth

## Commit Guidelines

### What to commit together

Always commit related changes atomically:

| Change | Must include |
|--------|-------------|
| New tRPC procedure | Router file + regenerated `generated.d.ts` |
| Modified procedure input/output | Router file + regenerated `generated.d.ts` |
| New domain type/schema | Types source file |
| Template JSON changes | Template file + normalizer updates (if new aliases needed) |

### What NOT to do

- **Don't commit `generated.d.ts` without regenerating it.** It must reflect the actual router code. If you see a diff in `generated.d.ts` that you didn't generate, re-run `gen-types.mjs`.
- **Don't manually edit `generated.d.ts`.** It's auto-generated. Changes will be overwritten.
- **Don't bump versions in `api-types/package.json` or `types/package.json` locally.** CI handles npm version bumps on push to `main`.

## Architecture Details

### Package Resolution

```
pnpm-workspace.yaml includes:
  - synap-backend/packages/types        (@synap-core/types)
  - synap-backend/packages/api-types    (@synap-core/api-types)

All consumers use:
  "@synap-core/types": "workspace:*"
  "@synap-core/api-types": "workspace:*"

Centralized in synap-app/package.json:
  pnpm.catalog + pnpm.overrides → workspace:*
```

The browser (`browser/package.json`) has its own direct `workspace:*` references since it's outside the `synap-app/` sub-workspace.

### Browser Vite Aliases

The browser also has Vite aliases in `browser/electron.vite.config.ts` for `@synap-core/types` subpath imports (`/events`, `/realtime`). These point to the built `dist/` files. The workspace link and Vite alias both resolve to the same package — no conflict.

### Types Package Dependencies

`@synap-core/types` depends on `drizzle-orm`, `drizzle-zod`, `yjs`, and `zod` as runtime dependencies. These are available in the frontend because they're also used directly by other packages.

The types package previously had peer/dev dependencies on `@synap-core/core` and `@synap/database` (backend-only packages). These were removed from the package.json since they're only needed when building the types package within `synap-backend/`, not when consuming it from the frontend.

### gen-types.mjs

Located at `synap-backend/packages/api/scripts/gen-types.mjs`. It:

1. Runs `dts-bundle-generator` on `src/root.ts` to extract the full `AppRouter` type
2. Post-processes the output to fix SuperJSON transformer types (`transformer: false` → `transformer: any`)
3. Writes to `synap-backend/packages/api-types/src/generated.d.ts`

The generated file is ~4000+ lines and contains every tRPC procedure's input/output types, inlined.

### CI Auto-Publish

`.github/workflows/publish-types.yml` triggers on push to `main` when these paths change:

- `synap-backend/packages/types/src/**`
- `synap-backend/packages/api/src/routers/**`
- `synap-backend/packages/api/src/root.ts`

It builds both packages, auto-bumps patch versions, publishes to npm, and commits the version bumps back with `[skip ci]`.

**Prerequisite:** `NPM_TOKEN` secret must be configured in the GitHub repository settings.

## Troubleshooting

### "Property X does not exist on type" for a tRPC procedure

The `generated.d.ts` is stale. Regenerate:
```bash
cd synap-backend/packages/api && pnpm build && node scripts/gen-types.mjs
```

### "client[procedureType] is not a function" at runtime

The backend you're connecting to doesn't have the procedure. This happens when:
- The data pod is running an older version without the procedure
- The procedure was added to the router but the backend wasn't restarted

### pnpm install fails with "package not found in workspace"

A `workspace:*` reference points to a package not listed in `pnpm-workspace.yaml`. Either add the package to the workspace or change the reference to an npm version.

### Type-check passes locally but fails in CI

Ensure `generated.d.ts` is committed and up to date. CI doesn't regenerate it — it uses whatever is in the repo.
