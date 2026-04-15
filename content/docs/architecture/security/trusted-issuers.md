---
title: Trusted issuers
description: How Synap pods decide which external services are allowed to connect and act on your data.
---

# Trusted issuers

Your pod maintains a registry of external services it trusts. Any service that wants to interact with your pod — a control plane, an automation provider, a custom integration — does so by presenting a signed JWT. The registry (the "trusted issuers" list) determines whether that JWT is accepted.

An issuer is identified by the URL it uses to sign JWTs: the `iss` claim. Synap uses this URL to fetch the issuer's public keys and verify signatures, so the URL is both an identity and a key-discovery endpoint.

---

## How trust is established

**Managed pods** — Synap Cloud is pre-trusted. When your pod is provisioned, Synap Cloud's issuer URL is seeded into the registry as a built-in, pre-approved issuer. No action needed on your part.

**Any other service** — when a service first presents a JWT your pod has not seen before, the pod registers it as "pending" and returns a `202` response. Nothing is executed. The service must wait for an admin to review and approve it before its JWTs are accepted.

**Self-hosted pods** — no issuer is pre-trusted unless you set `CONTROL_PLANE_URL` in the environment (in which case that URL is seeded as the built-in issuer on startup). All other services — including Synap Cloud if you want to connect it to your self-hosted pod — must be approved through the admin panel.

---

## The approval flow

When a new service tries to connect, the pod records the attempt and waits:

```
External service  ──►  POST /api/hub/setup/agent  (signed JWT)
                              │
                        Decode JWT, read iss claim
                              │
                    Look up iss in trusted_issuers
                              │
             ┌────────────────┼──────────────────────┐
             │                │                      │
       Not found /        Rejected /             Approved
        Pending          Revoked                     │
             │                │               Verify signature
        202: admin        403: not           + check scopes
        must approve      authorized               │
                                              Proceed
```

Pending issuers appear in the pod admin panel at `/admin/trusted-issuers` as amber connection-request cards. Each card shows the issuer URL, a derived display name, when it first tried to connect, and a scope selector. The admin approves or rejects.

Once approved, the pod verifies the signature of every incoming JWT from that issuer against its public keys (fetched from `{issuerUrl}/.well-known/jwks.json`) and enforces the scopes the admin selected.

---

## Issuer states

| State | Meaning |
|---|---|
| `pending` | First contact received. Waiting for admin review. All JWTs from this issuer are held (202). |
| `approved` | Admin approved. JWTs are verified and scopes are enforced. |
| `rejected` | Admin rejected. All JWTs return 403. Record kept for audit. |
| `revoked` | Was approved, now revoked. All JWTs return 403. |

Built-in issuers (Synap Cloud) are always `approved` and cannot be revoked through the UI.

---

## Scopes

When approving an issuer, the admin selects which scopes that issuer may use. This selection is the ceiling — even if the issuer's JWT claims more, only the approved scopes are honored.

| Scope | What it allows |
|---|---|
| `setup.agent` | Provision agent users and API keys |
| `hub-protocol.read` | Read entities, views, documents, and search results |
| `hub-protocol.write` | Create and update data (subject to proposal governance) |
| `data.read` | Direct read access to pod data |
| `data.write` | Direct write access to pod data |
| `provision` | Full pod provisioning (credentials, IS configuration) |
| `tier_update` | Push subscription tier changes to the pod |
| `sync` | Event log replication for cross-pod sharing |

Synap Cloud is granted all scopes. Third-party services should be granted only what they need.

---

## Managing trusted issuers

Open the pod admin panel and navigate to **Trusted Issuers**. The page is divided into three sections:

**Pending** — connection requests waiting for review. Each card shows the issuer URL, when it first appeared, and a scope selector. Click Approve (with scope selection) or Reject.

**Active** — approved issuers. Each row shows the display name, issuer URL, approved scopes, and who approved it. Built-in issuers show a lock badge. Other issuers have a Revoke button.

**Rejected** — issuers the admin rejected. They can be re-approved if circumstances change.

---

## After approving an issuer

Because the pod returns `202` while an issuer is pending, the original connection attempt from the external service has already timed out. After you approve, you will need to retry the connection from the external service (for example, re-run the Raycast setup flow, re-click "Connect" in the integration settings).

The `202` response from the pod includes an `adminUrl` field pointing at the admin panel, which the service can surface to the user to make this step obvious.

---

## Self-hosted pods

On a self-hosted pod, the trusted-issuers registry starts empty. The first time any external service presents a JWT, it enters as `pending`. You review and approve it through the admin panel.

If you set `CONTROL_PLANE_URL=https://api.synap.live` in your environment (to connect your self-hosted pod to Synap Cloud services), that URL is automatically seeded as the built-in approved issuer on the next pod boot.

There is no requirement to connect to Synap Cloud. A fully air-gapped self-hosted pod can approve only the issuers you control.
