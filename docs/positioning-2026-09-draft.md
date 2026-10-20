---
title: 'Positioning draft — 2026-09'
description: 'Governance-at-the-data-layer replaces memory as the lead claim'
last_updated: '2026-09-12'
status: draft
---

# Positioning draft — 2026-09-12

## 1. The shift

Anthropic shipped unified chat+Cowork memory on 2026-08-25, on by default for Free, Pro,
and Max (https://techcrunch.com/2026/08/25/claude-cowork-finally-remembers-what-you-told-the-app-in-chat/).
Mem0 and Zep already compete on retrieval benchmarks with one-click connectors.
"AI has no memory of you" — our lead pain since April — is no longer true for most
people, and it's free where it is. That pain is gone as a wedge.

Unsolved: what happens the moment that memory-equipped agent gets a real key — Gmail, a
calendar, a filesystem, a database. Governance at the data layer — not "the call was
logged," but "here is the exact diff, you approve or reject it, and the record survives"
— is white space. Research run 2026-09-04 (pod entity `Competitive positioning: BYOA
governance vs the 2026-09 field`, doc `2ab4ac2c`) mapped memory vendors, sovereign tools,
and MCP gateways on a memory-vs-action, vendor-vs-human axis and found Synap alone in the
human-owned quadrant spanning both. That's the wedge now.

## 2. Pitch and the three claims

**One sentence:** Your agent already has write access to your life. Synap is the pod it
writes into, where every change is a diff you approve and a record you can trace back to
the session that made it.

Three claims nobody else makes credibly, each backed by a shipped mechanism:

1. **Governance lives at the data layer, not the call layer.** MCP gateways (Obot,
   Pomerium, TrueFoundry — https://obot.ai/blog/the-13-best-mcp-gateways-for-enterprise-teams/,
   https://www.pomerium.com/blog/top-5-agentic-gateways-for-securing-mcp-tool-calls-in-2026)
   log that `update_row` was invoked; the MCP spec (2026-07-28) only recommends a human
   can deny a call. Synap shows the field, before value, and
   after value before it lands — every AI mutation is gated by `checkPermissionOrPropose()`
   and lands as a reviewable proposal (`synap-backend/packages/governance-policy/src/index.ts`,
   the `governance_rules` table, migration `0215`).
2. **A trust floor no rule can widen.** Case-by-case auto-approve rules resolve at rung
   2.8, below every floor — admin (2), forced-propose (2.1), destructive (2.5), by-kind
   (2.6) — so a rule can never auto-approve a delete, an admin action, or a scope change,
   proven by a tripwire in `policy.test.ts`. Widening a trusted agent's lane is itself a
   proposal (`governance.widen_lane`), so the floor governs its own governance.
3. **The session is a durable, queryable unit of work.** Which agent, which goal, what it
   changed, whether it was approved — one query, not grep across chat logs
   (`focus_sessions`, `@synap-core/focus-sessions`, `synap_get_session`). No memory
   vendor or gateway in the research ships this.

## 3. Two weaknesses, answered honestly

- **No published retrieval benchmark.** Mem0 and Zep compete on this and we have no
  number to put next to theirs. We lead with what happens after recall, when the agent
  acts, not with recall quality.
- **Native memory is free.** Anthropic's own memory, on by default, undercuts any pitch
  built on "your AI doesn't remember you." We don't compete there — a user keeps native
  memory and still needs Synap for the write-governance layer memory products lack.

## 4. ICP and channel

Solo technical operator — OpenClaw self-hosters, Claude Code power users — who gave an
agent real write access and watched it almost do something they wouldn't have approved.
Channel: OpenClaw Discord and GitHub issues, where "what can this agent touch and how do
I stop it" is the loudest recurring topic; Show HN framed on the ledger, not memory.

## 5. Naming: "Synap Relay," never bare "Relay"

Relay.app shut down: free users lost access 2026-08-15, paying users 2026-09-14, founder
moved to Google Chrome — an acqui-hire, not a brand sale
(https://relay.app/, https://ground.news/article/ai-automation-startup-relay-shuts-down-staff-joins-googles-chrome-team).
The trademark and domain are likely still held, and any search on "Relay" will surface
shutdown coverage for 12–18 months. Always say "Synap Relay" externally; keep "Relay"
internal. No migration-traffic play off the shutdown.

## 6. Pricing anchors

| Product | Entry | Mid | High | Self-host | Source |
|---|---|---|---|---|---|
| Mem0 | $19 | $249 | custom | OSS free | https://mem0.ai/pricing |
| Zep | $125 | $375 | custom | Enterprise only | https://www.getzep.com/pricing |
| Letta | $20 | $20/seat | — | free | https://docs.letta.com/letta-code/pricing |
| Supermemory | $19 | $100 | $399 | Scale+ only | https://supermemory.ai/pricing |
| n8n | €20 | €50 | €667 | free (FairCode) | https://n8n.io/pricing/ |
| Zapier | $19.99 | $69 | — | no | https://zapier.com/pricing |
| Lindy | $29.99/user | $99.99/user | $199.99/user | no | https://www.lindy.ai/pricing |
| Gumloop | $37 | — | — | no | https://www.gumloop.com/pricing |

Synap's planned €15 pod-only / €30 pod+intelligence-service sits inside this band. Free
self-host is table stakes, not a differentiator. Paywall the hosted pod and the
intelligence service; never the proposal system — that's the product.

## 7. What's stale in the current positioning doc

`synap-team-docs/content/team/ops-marketing/positioning-and-icp.mdx` (last reviewed
2026-04-20) opens its pain list with:

> "Pain 2: AI has no memory of you. ChatGPT and Claude reset every session."

That's no longer differentiating after 2026-08-25. Replace with:

> "Pain: your agent already has write access, and nothing shows you what it's about to
> change before it changes it. Governance is bolted on as a call log, not an approvable
> diff at the data layer."

Likewise `messaging-framework.mdx`'s Level 1 promise — "Never lose anything. Never
organize anything." — is memory-pain framed. Replace with: "See every change before it
lands, and trace it back to the session that made it."
