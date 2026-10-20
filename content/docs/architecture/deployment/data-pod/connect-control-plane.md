# Connecting an Account Service to Your Data Pod

A Data Pod remains a complete, independent server. It owns its local users, memberships, workspaces, projects, and sessions. Connecting Synap Cloud or another account service must not put that provider's user IDs, Pod IDs, or configuration into the Pod's identity model.

An account service can help a person discover and enter a Pod only after the Pod owner has trusted it as a generic **issuer**.

## What each side owns

| Layer | Responsibility |
|---|---|
| Account service (including Synap Control Plane) | Its accounts, passwords, sessions, invitations, and its ledger of people related to Pods |
| Data Pod | Trusted-issuer approval, local identities, local membership/access decisions, workspaces, projects, and Pod sessions |
| Browser or app | Talks directly to the account service and the Pod; transports only short-lived assertions or opaque receipts |

The account service never receives a raw Pod session token. A Pod does not trust any issuer by default.

## Connect a fresh managed Pod

A newly installed managed Pod has no human owner and no trusted issuer. Its installer provides a Pod-local bootstrap secret. The orchestrator may create the first local owner with one short-lived ES256 assertion:

```text
orchestrator -> POST https://your-pod.example.com/api/federation/bootstrap
  X-Pod-Bootstrap-Token: <local installation secret>
  body: { assertion }
```

The `initial-owner-bootstrap` assertion is addressed to the exact public Pod origin and contains a generic issuer subject, email, and name. It contains no external Pod ID, Control Plane user ID, stored issuer URL, or Pod session. The Pod verifies the assertion, creates its first local owner, links that owner to `(issuer, opaque subject)`, and approves the issuer locally. A second owner cannot be bootstrapped through this route.

For a self-hosted Pod, a local owner can instead use the Pod's direct setup/login flow and approve an issuer in Pod administration. No Control Plane is required.

## Connect an existing Pod to an account

Use the following flow when a person who already has access to a Pod wants it listed in an account service:

```text
1. Browser -> account service: create a link intent
2. Account service -> browser: short-lived identity-link assertion
3. Browser (direct Pod session) -> Pod: POST /api/federation/identity-links
4. Pod -> browser: one-time opaque receipt
5. Browser -> account service: submit intent + receipt only
6. Account service -> Pod: consume the receipt server-to-server
7. Account service: records the Pod-authoritative relationship in its ledger
```

The direct Pod session proves the person already has local access. The receipt, rather than the session token, is what crosses back to the account service.

## Sign in through an approved issuer

Once the Pod owner has approved the issuer and a generic identity link exists, a client can exchange a short-lived `user-exchange` assertion directly with the Pod:

```text
Browser -> POST https://your-pod.example.com/api/federation/exchange
  body: { assertion }
```

The Pod verifies the issuer, exact audience, expiry, purpose, and one-time identifier; resolves `(issuer, opaque subject)` to its local user; checks local membership; then creates its own Kratos session. If the user has no local access, the exchange is rejected even when the account service knows the user.

## Invite or grant scoped access

Account-service invitations are ledger records until the recipient has an account. To apply an accepted invitation, the issuer sends a short-lived `access-grant` assertion to `POST /api/federation/access-grants`. The assertion must name one exact Pod-local workspace or project. The Pod verifies that the issuer has the `membership:grant` capability and that the target is active before creating or updating its own local membership.

Direct Pod invitations continue to work without an account-service session. They are a local Pod feature.

## Issuer requirements

An issuer must:

- publish an ES256 JWKS at a canonical HTTPS origin;
- sign assertions with its own private key and use the exact Pod public origin as `aud`;
- include an issuer URL, opaque `sub`, unique `jti`, short expiry, and purpose appropriate to the route;
- accept that the Pod is the authority for local membership and session issuance.

The Pod uses durable replay protection for federation assertions and rejects issuer/JWKS locations that resolve to private or local network addresses.

## Retired endpoints

`/api/handshake` and the legacy identity-provisioning endpoints below are retired and return an explicit retirement response. Do not use them as a fallback:

- `POST /api/provision/connect`
- `POST /api/provision/seed-trust`
- `POST /api/provision/seed-admin`

They have been replaced by `/api/federation/bootstrap`, `/identity-links`, `/identity-links/consume`, `/access-grants`, and `/exchange`.

Optional external-service settings used by marketplace, lifecycle, or intelligence operations are separate from this identity boundary. They do not establish issuer trust or grant Pod membership.

## Related

- [Trusted issuers](/team/platform/trusted-issuers)
- [Pod Federation Boundary](/team/control-plane/pod-trust-architecture)
