# Workspace Member Invitations

> **Audience:** New team members onboarding + landing page copy reference
> **Feature shipped:** February 2026

---

## What it is

Workspace invitations let owners and admins bring collaborators into a Synap workspace without requiring manual account setup or backend intervention. The owner generates a shareable link; the invitee clicks it, signs in (or creates an account), and lands directly inside the workspace.

This works for **every deployment** — cloud, self-hosted, or on-premise — without any email infrastructure being required.

---

## How it works (user perspective)

### For the person sending the invite

1. Go to **Settings → Users** inside your workspace.
2. Click **"Invite Member"** (visible only to owners and admins).
3. Enter the email address and choose a role: `Admin`, `Editor`, or `Viewer`.
4. Click **"Create Invite"** — an invite link appears instantly.
5. Copy the link and share it however you like: email, Slack, iMessage, carrier pigeon.
6. The link is valid for **7 days**. You can revoke it at any time from the pending invitations list.

### For the person receiving the invite

1. Click the link.
2. If not logged in, you're redirected to sign in (or create an account). After auth, you land back on the invite page automatically — no link re-opening needed.
3. Click **"Accept Invitation"**.
4. You're in. The workspace opens immediately.

---

## Role model

| Role | Can invite others | Can manage members | Can edit content | Can view content |
|------|:-----------------:|:------------------:|:----------------:|:----------------:|
| **Owner** | ✓ | ✓ | ✓ | ✓ |
| **Admin** | ✓ | ✓ (except other admins/owners) | ✓ | ✓ |
| **Editor** | — | — | ✓ | ✓ |
| **Viewer** | — | — | — | ✓ |

Owners cannot be removed or have their role changed through the invite flow. Admins can manage editors and viewers but not other admins.

---

## Email delivery (optional, Synap Cloud only)

When a Synap-hosted pod has an active subscription, creating an invite automatically triggers an email to the invitee via the Synap control plane. This is **fire-and-forget** — the invite is always created successfully even if the email fails. Failures are logged as warnings and do not surface to the user.

Self-hosted deployments skip the email step entirely and use the copy-link flow only. No configuration is needed; it degrades gracefully.

---

## Architecture (for developers)

### The invite URL

```
https://app.synap.live/workspace/invite?token={token}&backend={encodedPodUrl}
```

The `token` is a 32-byte random hex string. The `backend` param carries the pod URL so that invitees with no prior session are automatically routed to the right data pod on first load.

### Request flow

```
Owner clicks "Create Invite"
  → trpc.workspaces.createInvite (Data Pod)
      → writes workspace_invites row (token, email, role, 7-day expiry)
      → fire-and-forget → POST /internal/workspace-invite-email (Control Plane)
                              → verify pod subdomain in DB
                              → verify active subscription
                              → Resend → invitee inbox
      → returns { token, ... } to frontend
  → frontend builds invite URL from token + getBackendUrl()
  → user copies link

Invitee clicks link
  → /workspace/invite?token=...&backend=...
  → setBackendUrl(backend) — writes SYNAP_INSTANCE_URL cookie
  → if not authed → /auth?return_to=/workspace/invite?... (preserves all params)
  → after auth → back to invite page
  → trpc.workspaces.acceptInvite (Data Pod)
      → validates token, checks expiry
      → WorkspaceMemberRepository.add() — writes workspace_members row
      → audit log
      → deletes invite record
  → redirect to /workspace
```

### Three-repo breakdown

| Repo | What changed |
|------|-------------|
| `synap-control-plane-api` | New `/internal/workspace-invite-email` endpoint; removed incorrect domain restriction from `sendWorkspaceInviteEmail`; added `SYNAP_POD_INTERNAL_KEY` env var |
| `synap-backend` | `createInvite` wires email relay; `acceptInvite` and `revokeInvite` finalized; `previewInvite` public procedure added (no auth needed) |
| `synap-app` | Settings → Users page: invite modal + pending invitations section; `/workspace/invite` accept page |

### Key files

```
synap-control-plane-api/
  src/routes/internal.ts          # /internal/workspace-invite-email handler
  src/services/email/resend.ts    # sendWorkspaceInviteEmail (domain guard removed)
  src/env.ts                      # SYNAP_POD_INTERNAL_KEY

synap-backend/
  packages/api/src/routers/workspaces.ts   # createInvite, acceptInvite, revokeInvite, previewInvite
  packages/core/src/config.ts              # controlPlaneUrl, controlPlaneInternalKey

synap-app/
  apps/web/app/workspace/settings/users/page.tsx   # invite modal + pending invitations
  apps/web/app/workspace/invite/page.tsx           # accept-invite page
```

### Environment variables

**Control Plane (`synap-control-plane-api`)**
```env
SYNAP_POD_INTERNAL_KEY=<32-char secret>   # optional; if unset, /internal returns 404
```

**Data Pod (`synap-backend`)**
```env
CONTROL_PLANE_URL=https://api.synap.live    # optional; if unset, email is skipped
CONTROL_PLANE_INTERNAL_KEY=<same secret>   # must match SYNAP_POD_INTERNAL_KEY above
```

### Security notes

- The `X-Internal-Key` shared secret is checked on every request to `/internal/*`. If `SYNAP_POD_INTERNAL_KEY` is not set in the CP environment, the entire `/internal` router returns `404` — safe for self-hosted control plane deployments that have no pods.
- Invite tokens are 256-bit random values (cryptographically secure via Node's `crypto.randomBytes`).
- `previewInvite` is a public tRPC procedure — it intentionally requires no authentication. It only exposes workspace name, role, and expiry date, never sensitive data.
- Tokens are deleted from the database on acceptance; a second accept attempt returns `NOT_FOUND`.

---

## Pending / known limitations

| Item | Status |
|------|--------|
| Invite page shows workspace name before login | Blocked on `@synap-core/api-types@1.4.2` npm publish — `previewInvite` exists in backend but not in the published types package yet |
| Email delivery for self-hosted | Not supported by design — copy-link only |
| Bulk invites | Not implemented |
| Invite via username (no email) | Not implemented |

---

## Landing page copy (draft)

> **Invite your whole team in seconds.**
>
> Share a link. That's it. Synap generates a secure invite for any email address — no admin panel, no IT ticket, no waiting. Your teammate clicks, signs in, and lands straight in the workspace. Set their role before they even arrive: viewer, editor, or admin.
>
> Links expire automatically after 7 days. Revoke any invite before it's used. Every join is logged. You're always in control of who has access.

### Feature bullets

- **One-click invite links** — share by email, Slack, or anywhere
- **Role-scoped access from day one** — Admin, Editor, or Viewer
- **Auto-expires in 7 days** — no stale links floating around
- **Revoke any time** — pending invites disappear from the list and become instantly invalid
- **Works without email infra** — copy the link and paste it anywhere; email delivery is a bonus, not a requirement
- **Self-hosted friendly** — no control plane dependency for the core flow
