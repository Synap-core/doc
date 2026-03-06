# Synap Deployment Checklist

Use this checklist before every production deployment of any Synap service.

---

## Pre-Deploy: Code Quality

- [ ] `pnpm lint` passes (no lint errors)
- [ ] `pnpm type-check` passes (no TypeScript errors)
- [ ] `pnpm test` passes (all unit + integration tests)
- [ ] `pnpm build` succeeds (production build compiles)
- [ ] Pull request reviewed and approved
- [ ] No unresolved merge conflicts

---

## Pre-Deploy: Environment Variables

Verify the following are set in production environment (`.env` or deploy secrets):

### Control Plane API
- [ ] `DATABASE_URL` — PostgreSQL connection string
- [ ] `BETTER_AUTH_SECRET` — min 32 chars
- [ ] `HETZNER_API_TOKEN` — valid, not expired
- [ ] `CLOUDFLARE_API_TOKEN` — valid with DNS write permissions
- [ ] `STRIPE_SECRET_KEY` — starts with `sk_live_` (not `sk_test_` in prod)
- [ ] `STRIPE_WEBHOOK_SECRET` — matches Stripe dashboard webhook secret
- [ ] `STRIPE_PUBLISHABLE_KEY` — starts with `pk_live_`
- [ ] `RESEND_API_KEY` — starts with `re_`
- [ ] `INTELLIGENCE_HUB_URL` — reachable from control plane
- [ ] `INTELLIGENCE_HUB_INTERNAL_KEY` — min 32 chars
- [ ] `PLATFORM_JWT_SECRET` — min 32 chars
- [ ] `SENTRY_DSN` — set for error tracking
- [ ] `RATE_LIMIT_STORE=redis` — NOT `memory` in production
- [ ] `REDIS_URL` — reachable Redis instance
- [ ] `DEPLOY_VERSION` — set to current git tag (e.g. `v1.2.0`), NOT `main`
- [ ] `APP_DOMAIN` — set to your domain (e.g. `synap.live`), not hardcoded

### Frontend (synap-app)
- [ ] `NEXT_PUBLIC_USE_MOCKS` — must NOT be set (or must be `false`) in production
- [ ] `NEXT_PUBLIC_API_URL` — points to production backend
- [ ] `NEXT_PUBLIC_SENTRY_DSN` — set for frontend error tracking

### Backend (Data Pod)
- [ ] `CONTROL_PLANE_JWT_SECRET` — matches `PLATFORM_JWT_SECRET` on control plane
- [ ] `KRATOS_PUBLIC_URL` / `KRATOS_ADMIN_URL` — point to running Kratos instance

---

## Pre-Deploy: Database

- [ ] All pending Drizzle migrations have been reviewed
- [ ] Migrations tested on staging database first
- [ ] Manual backup taken: `docker exec synap-postgres pg_dump -U synap synap_control_plane > backup-$(date +%Y%m%d-%H%M%S).sql`
- [ ] Migration rollback plan documented (if migration is destructive)

---

## Pre-Deploy: Infrastructure

- [ ] Hetzner API quota checked (server creation limit not reached)
- [ ] Cloudflare DNS zone verified accessible
- [ ] Stripe webhook endpoint URL matches deployed API URL
- [ ] Redis accessible from all API container instances
- [ ] Docker images built and pushed to registry with version tag

---

## Deployment

1. **Tag the release**:
   ```bash
   git tag v<version> && git push --tags
   ```

2. **Update `DEPLOY_VERSION`** in control plane env:
   ```
   DEPLOY_VERSION=v<version>
   ```

3. **Apply database migrations** (if any):
   ```bash
   pnpm db:migrate
   ```

4. **Deploy the service** (via CI/CD or manually):
   ```bash
   docker compose -f docker-compose.prod.yml pull control-plane
   docker compose -f docker-compose.prod.yml up -d control-plane
   ```

5. **Monitor startup**:
   ```bash
   docker logs -f synap-control-plane
   ```

---

## Post-Deploy: Verification

- [ ] `GET /health` returns 200
- [ ] `GET /ready` returns 200 with all dependencies healthy
- [ ] `GET /status` shows correct version
- [ ] Sentry shows no new critical errors (check 10 minutes post-deploy)
- [ ] Stripe test webhook received and processed correctly
- [ ] Can create a test pod (smoke test provisioning flow)
- [ ] Frontend loads without JS errors in browser console
- [ ] Auth flow works (login → workspace → logout)

---

## Post-Deploy: Monitoring

- [ ] Uptime monitor shows green for `/ready`
- [ ] Sentry alert rules are active for the new release
- [ ] Log aggregation showing logs from new deploy
- [ ] Trigger.dev worker is processing jobs

---

## Rollback Procedure

If post-deploy verification fails:

1. **Revert to previous Docker image**:
   ```bash
   docker compose -f docker-compose.prod.yml stop control-plane
   # Edit docker-compose.prod.yml to use previous image tag
   docker compose -f docker-compose.prod.yml up -d control-plane
   ```

2. **Revert database migration** (if applicable):
   - See `docs/RUNBOOK.md` § "How to Roll Back a Bad Deploy"

3. **Notify team** and document the rollback reason

---

## Special Considerations

### First Deploy
- Run `pnpm db:migrate` to create all tables
- Seed initial data if needed: `pnpm db:seed`
- Create initial admin user via Ory Kratos admin API

### Deploying with Breaking API Changes
- Consider zero-downtime strategies: deploy backend first, then frontend
- For tRPC schema changes: both client and server must be updated together
- Coordinate with any external integrations using Hub Protocol

### Deploying Intelligence Hub
The Intelligence Hub is a separate service. See its own deploy docs for:
- Model provider API key rotation
- Agent configuration updates
- MCP server configuration
