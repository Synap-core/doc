---
sidebar_position: 3
title: 'Tunnels And Domains'
description: Documentation covering Tunnels And Domains
section: general
audience: users
version: 1.0+
last_updated: '2026-04-20'
tags: []
hide_title: false
toc: true
---

# Tunnels, DNS, and your Data Pod URL

Your Data Pod is meant to be reachable at a stable **HTTPS hostname** (for the API, auth, realtime, and admin UI). How you get that hostname depends on whether you expose the machine directly or use a **tunnel**.

## Default: public DNS to your server

The usual self-hosted path:

1. Point a DNS **A record** for your domain (or subdomain) to your server’s **public IPv4**.
2. Set `DOMAIN` in the pod’s `.env` to that hostname (see the installer / `synap install`).
3. **Caddy** (in the Docker stack) terminates TLS and routes traffic to the backend.

This is the path assumed by `synap-backend/deploy/Caddyfile` and the standard `docker-compose` stack.

## When you cannot open ports 80/443 (NAT, home lab, strict firewall)

Use an **outbound tunnel** so traffic enters through the tunnel provider’s edge instead of your router:

- **Cloudflare Tunnel** (`cloudflared`) — common, documented, works well with arbitrary HTTPS services behind the tunnel.
- **Pangolin / similar** — other self-hosted or vendor-specific tunnel stacks; wiring depends on the product you use.

At a high level you still need:

1. A **hostname** you control (or that the provider assigns) that resolves to the tunnel’s public entry.
2. The tunnel process on the host (or in Docker) forwarding to **Caddy** (or directly to backend ports only if you intentionally skip Caddy — not the default Synap layout).

### Practical checklist (self-hosted)

1. Keep **`DOMAIN`** in `.env` aligned with the hostname users and clients will use (must match TLS certificate issuance and cookie scope).
2. If using **Docker**, prefer a **compose profile** for the tunnel agent so it starts with the rest of the stack when you choose tunnel mode (see team docs for the optional `cloudflare-tunnel` / `pangolin-tunnel` profiles on the backend deploy).
3. For **Cloudflare Tunnel**, you typically set a **tunnel token** (or credentials file) in environment variables consumed by the `cloudflared` service; map public hostnames to `https://caddy:443` or `http://caddy:80` depending on your split-horizon setup.
4. **WebSockets** (realtime) and **long-lived cookies** must work through the tunnel — if something breaks, verify WebSocket support and TLS **SNI** on the tunnel route.

### Synap Cloud (managed pods)

If your pod is provisioned through **Synap Cloud**, DNS and exposure are orchestrated by the **Control Plane** by default (`direct_dns`: A record to your server IP). The CP can also manage **Cloudflare Tunnels** on your behalf when the `cloudflare_tunnel` exposure mode is enabled (Synap holds the Cloudflare account and creates a named tunnel per pod).

**Pangolin, however, is self-hosted only.** If you want a Pangolin-backed pod you keep your own Pangolin server and activate the `pangolin-tunnel` compose profile in your pod's docker-compose — the Synap Control Plane is not in that loop. Operators who want Pangolin should run `synap install`, bring their own `fosrl/pangolin` server, and paste a Newt site-connector token into the pod's `.env`.

## Eve vs Synap Data Pod

**Eve** (`eve legs`) can set up **Traefik** and optional tunnel helpers for the Eve stack. That is separate from the **Data Pod** edge (Caddy). Do not assume one configures the other; see [Ingress & tunnels](/team/technologies/ingress-and-tunnels) in the team docs.

## Related reading

- [Self-Hosted Deployment](./self-hosted) — broader self-host context  
- [Production](./production) — hardened deployment notes  
- Team: [Pod exposure orchestration](/team/control-plane/pod-exposure-orchestration) — how the Control Plane models exposure
