# Connecting a Control Plane to Your Data Pod

Your Data Pod is a fully independent server — it works without any control plane. But if you want remote management, monitoring, automated updates, or to use the Synap Cloud dashboard, you can connect a control plane (CP) to your pod.

This page covers both options:
- **Synap Cloud CP** — managed, zero-config
- **Your own CP** — full sovereignty, requires a bit of setup

---

## Option 1: Synap Cloud (Managed Pods)

If you signed up at [synap.live](https://synap.live) and provisioned your pod through the dashboard, the trust relationship is established automatically during provisioning. Nothing to configure.

Your pod has `CONTROL_PLANE_URL=https://api.synap.live` in `/opt/synap/deploy/.env`.

**Re-establishing trust** (if you migrated your pod or something went wrong):
1. Open the CP dashboard → **Your Pod** → **Re-establish Trust**
2. The CP sends a new signed JWT to your pod's `/api/provision/seed-trust` endpoint
3. Trust is re-established in seconds — no restart required

---

## Option 2: Your Own Control Plane

This is for advanced users running a self-hosted Synap stack who want to connect their own CP (e.g. a custom management plane, a fork of `synap-control-plane-api`, or any HTTPS service that can issue ES256 JWTs).

### How It Works

Your pod verifies every CP request using **asymmetric cryptography (ES256)**:

1. Your CP generates an ECDSA P-256 key pair
2. Your CP publishes its public key at `https://your-cp.example.com/.well-known/jwks.json`
3. Your pod fetches that public key and verifies every JWT your CP sends

No shared secret is ever transmitted. Your CP's private key never leaves your CP server.

### Step 1 — Generate a Key Pair on Your CP

```bash
# Generate ECDSA P-256 private key
openssl ecparam -name prime256v1 -genkey -noout -out cp-private-key.pem

# Extract the public key
openssl ec -in cp-private-key.pem -pubout -out cp-public-key.pem
```

Keep `cp-private-key.pem` secret and on your CP server only.

### Step 2 — Publish Your JWKS Endpoint

Your CP must serve the public key at `/.well-known/jwks.json`. The response format is standard OIDC JWKS:

```json
{
  "keys": [
    {
      "kty": "EC",
      "crv": "P-256",
      "alg": "ES256",
      "use": "sig",
      "kid": "cp-key-1",
      "x": "<base64url-encoded x coordinate>",
      "y": "<base64url-encoded y coordinate>"
    }
  ]
}
```

You can generate the JWKS JSON from your PEM key with any JWT library, or with `openssl`:

```bash
# Get key parameters (x, y as hex, then base64url-encode them)
openssl ec -in cp-private-key.pem -text -noout 2>/dev/null
```

The endpoint must be served over **HTTPS** (self-signed certificates are not accepted).

### Step 3 — Configure Your Pod

Set `CONTROL_PLANE_URL` in your pod's environment file:

```bash
# On your pod server
echo "CONTROL_PLANE_URL=https://your-cp.example.com" >> /opt/synap/deploy/.env
```

Then restart the pod backend:

```bash
cd /opt/synap/deploy && docker compose restart api
```

If you leave `CONTROL_PLANE_URL` unset, your pod will accept JWTs from any HTTPS issuer that passes signature verification (OIDC-style discovery). Setting it explicitly restricts your pod to only trust your specific CP.

### Step 4 — Call seed-trust

Your CP must call your pod's `seed-trust` endpoint to register itself. This is the bootstrap step — it adds your CP to the pod's trusted issuer list.

```bash
# Your CP generates a seed-trust JWT (valid for 5 minutes)
# Claims: { type: "seed-trust", iss: "https://your-cp.example.com", aud: "https://your-pod.example.com", jti: "<uuid>", exp: <now+5min> }
SEED_JWT="<your ES256 JWT>"

curl -X POST https://your-pod.example.com/api/provision/seed-trust \
  -H "Authorization: Bearer $SEED_JWT" \
  -H "Content-Type: application/json" \
  -d '{"issuerUrl": "https://your-cp.example.com"}'
```

Expected response:
```json
{ "success": true, "issuerUrl": "https://your-cp.example.com" }
```

After this call, your CP is registered in the pod's `trusted_issuers` table and can call any other provision endpoint.

### Step 5 — Provision the Pod

Once trust is established, your CP can call `POST /api/provision/connect` to push credentials:

```bash
# JWT claims: { type: "provision", podId: "<uuid>", controlPlaneUrl: "https://your-cp.example.com",
#               iss: "https://your-cp.example.com", aud: "https://your-pod.example.com", jti, exp }
PROVISION_JWT="<your ES256 JWT>"

curl -X POST https://your-pod.example.com/api/provision/connect \
  -H "Content-Type: application/json" \
  -d "{\"token\": \"$PROVISION_JWT\"}"
```

---

## Token Requirements

All CP→Pod JWTs must:

| Claim | Value |
|---|---|
| `alg` (header) | `ES256` |
| `iss` | Your CP's base URL (e.g. `https://your-cp.example.com`) |
| `aud` | Your pod's public URL (e.g. `https://your-pod.example.com`) |
| `jti` | A unique UUID — prevents replay attacks |
| `exp` | Short-lived — recommended 5–10 minutes |
| `type` | Specific to each endpoint (see below) |

The `aud` (audience) check is mandatory. A JWT minted for one pod cannot be replayed against another.

### Token Types by Endpoint

| Endpoint | `type` claim |
|---|---|
| `POST /api/provision/seed-trust` | `seed-trust` |
| `POST /api/provision/connect` | `provision` |
| `POST /api/provision/seed-admin` | `seed-admin` |
| `POST /api/provision/register-intelligence` | `provision` |
| `POST /api/provision/reset-intelligence` | `provision` |
| `POST /api/provision/trigger-update` | `provision` |
| `POST /api/provision/disconnect` | `provision` |

---

## Checking Trust Status

```bash
curl https://your-pod.example.com/api/provision/status
```

```json
{
  "connected": true,
  "connectionState": "connected",
  "controlPlane": {
    "url": "https://your-cp.example.com",
    "connectedAt": "2026-04-29T12:00:00.000Z"
  }
}
```

`connectionState` values:
- `connected` — CP registered + Intelligence Service active
- `partial` — CP registered but IS not yet registered
- `disconnected` — no CP connection

---

## Revoking a Control Plane

To remove CP access from your pod:

```bash
# Requires a "provision" type JWT
curl -X POST https://your-pod.example.com/api/provision/disconnect \
  -H "Content-Type: application/json" \
  -d "{\"token\": \"$PROVISION_JWT\"}"
```

Or directly via the pod admin CLI (no JWT required — authenticated via local session):

```bash
# From inside the pod server
synap pod disconnect
```

---

## Security Notes

- The pod never stores your CP's private key
- Each token has a `jti` claim that prevents replay — the same token cannot be used twice
- Setting `CONTROL_PLANE_URL` pins JWKS to a specific URL and prevents OIDC-style discovery from an unverified `iss` claim
- Pod-agent (the update sidecar) always derives the JWKS URL from `CONTROL_PLANE_URL` — it ignores any URL passed in request headers
