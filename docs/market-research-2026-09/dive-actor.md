# DIVE: agent-as-human attribution census

**Headline: this is a CONSOLIDATION, not a build.** The pod already has a complete,
one-door agent-identity model with a tripwire enforcing it. The census found
**exactly one write door in the whole MCP surface that bypasses it** (`synap_revise_proposal`),
its Hub REST twin, and one latent predicate hole. Everything else threads the agent principal.

## (b) THE REFERENCE SHAPE — what already exists and works [VERIFIED]

`packages/api/src/access/key-identity.ts` — `resolveKeyIdentity(keyRecord)`, the ONE door.
Derives three facts and names the principle in its own header:
- `isAgent` = key principal's `users.userType === 'agent'` — NOT `linkedUserId`, NOT `keyType`
- `agentUserId` = `isAgent ? keyRecord.userId : undefined`
- `effectiveUserId` = `linkedUserId ?? keyRecord.userId` — the human whose DATA is in scope

Enforced by `packages/api/src/__tripwires__/identity-one-door.test.ts` — asserts all
three transports both import AND call it. All three do:
`middleware/api-key-auth.ts:166`, `routers/hub-protocol/_middleware/auth.ts:~279`,
`routers/mcp/http-handler.ts:457`.

The four distinct "who"s on `proposals` are documented precisely
(`packages/database/src/schema/proposals.ts:113-156`):
- `createdBy` — OVERLOADED (userId OR agentUserId, per door); the schema comment itself
  says it "has already caused ~5 bugs and is NOT an owner"
- `proposedByUserId` — the human PROPOSER (human-member path only)
- `subjectUserId` (0248) — the human the proposal is FOR (owner floor) — **SCOPE, correct**
- `agentUserId` — the AGENT actor, never a human

`services/agent-identity-service.ts:157+` — `ownProposalFilter`, the **authorship floor**,
already exists as a three-branch predicate ("createdBy = me" OR "agentUserId ∈ my agents"
OR "createdBy ∈ my agents"), pinned by `proposal-author-floor.test.ts`. **It is a READ
floor only** — nothing gates a WRITE on it. That matters for (d).

Attribution enforcement: `routers/mcp/http-handler.ts:~172` `shouldRejectUnattributedWrite`
hard-rejects a bare `user_pat`/`hub_inbound` write with no agent principal.

## (a) VIOLATION TABLE

| # | Site | Class | Sev | What |
|---|---|---|---|---|
| 1 | `routers/mcp/handlers/build.ts:407,434` | **AUTHORIZATION + ATTRIBUTION** | HIGH | `synap_revise_proposal` — the ONLY write handler in the entire MCP surface that does not destructure `agentUserId` from ctx. Passes `actorId: userId` (the human). The agent passes `computeCanReviewApproval` **because the human would** (privilege borrow), and `revisionHistory[].by` records the HUMAN as the reviser (`proposals-service.ts:344 by: actorId`) — a provenance lie visible in the browser's "edited before approval" UI (`browser/.../workflows/place-facets.tsx`). |
| 2 | `routers/hub-protocol/proposals.ts:170` | **AUTHORIZATION + ATTRIBUTION** | HIGH | Same defect, Hub REST twin: `actorId: ctx.userId as string`. `ctx.agentUserId` **is available here** (`middleware/api-key-auth.ts:173` puts it on ctx) and is dropped. Its own inline comment admits the borrow: "an agent key is remapped to its human owner by api-key-auth.ts, which is what the ladder gates on." |
| 3 | `routers/proposals/review-authority.ts:~163,~203` | **AUTHORIZATION (latent)** | MED | `isOwner = proposal.data.sourceId === userId` — the predicate never checks that `userId` is a HUMAN. Safe today only by convention (no caller passes an agent id). See the sourceId overload below — it is the trap that makes the obvious fix to #1/#2 dangerous. |
| 4 | `services/proposals/dev-approval.ts:222`, `services/playbooks/stage-gate.ts:232` | **ATTRIBUTION (overload)** | MED | `sourceId: input.agentUserId ?? input.userId` — `data.sourceId` is a **FIFTH overloaded "who"**, undocumented as such. On these two doors it holds the AGENT; on the canonical `permission-check.ts:2750` path it holds the HUMAN. |
| 5 | `routers/proposals/review-authority.ts:~166` (comment) | doc defect | LOW | Comment asserts "An agent-authored proposal carries `sourceId` = the acting agent's user row, never the human's". **FALSE for the canonical path** — `permission-check.ts` `createProposal` writes `sourceId: userId` where `userId` = `envelope.access.userId` = the human. True only for #4's two doors. |
| 6 | `utils/permission-check.ts:2332` | ATTRIBUTION (by design, load-bearing) | MED | `createdBy: input.createdBy ?? input.agentUserId ?? input.userId` — the overload itself. See (c3). |

### NOT violations — legitimate ownership floors [say so explicitly]
- `subjectUserId: input.userId` (`permission-check.ts:~2336`) — **SCOPE, correct.** The 0248
  owner floor; the human the review awaits. Owning is not acting.
- `effectiveUserId` = the human on every agent key — **SCOPE, correct.** The data floor.
- `proposals.withdraw` `isAgentOwner = agentUserId && createdBy === userId`
  (`routers/proposals.ts:1671-1677`) — **SCOPE, correct.** The human who dispatched the
  agent retracts it. It is an OWNER right, not the agent acting.
- Every other MCP write handler (build/capability/capture/entity/rule/session/workspace) —
  **all thread `agentUserId`.** Verified by enumerating every `synap_*` handler.

## (c) BLAST RADIUS of fixing the revise door — ⚠️ THE OBVIOUS FIX BREAKS IT

The tempting one-liner `actorId: agentUserId ?? userId` is **wrong**, in one of two ways
depending on which door authored the proposal, because `data.sourceId` is overloaded (#4):

- Proposal authored via the canonical `createProposal` path (`sourceId` = the HUMAN):
  an agent actorId matches nothing — not sourceId, not membership, and the
  `agent.createdByUserId === userId` fallback compares the agent to itself. Result:
  **NOT_FOUND. The revise door stops working for agents entirely.**
- Proposal authored via `dev-approval.ts` / `stage-gate.ts` (`sourceId` = the AGENT):
  `isOwner` becomes TRUE, and under the DEFAULT `owner_and_admins` policy
  (`canReviewProposal`: `args.isOwner || isAdmin`) the agent is **granted full reviewer
  authority over its own proposal** — precisely the self-approval the "no approve tool"
  design forbids (`synap_reject_proposal`'s own description states this).

So the blast radius is not "swap one argument". It is: **the revise door needs its own
gate**, and #3/#4 should be closed alongside or the same trap recurs.

## (d) IS AN "AUTHOR MAY AMEND" GATE AVAILABLE? — YES, and it is nearly free

- **Does it exist as a write gate today? NOT FOUND.** `mergeProposalRevision`
  (`services/proposals/proposals-service.ts:~407-427`) has exactly one authority call,
  `computeCanReviewApproval`. There is no author rung.
- **Does the predicate exist? YES — already written and tested.**
  `proposals.agentUserId` is selected inside the revise transaction *already*
  (`proposals-service.ts:~385`) and passed to the reviewer gate. The author test is
  literally `existing.agentUserId === actingAgentUserId`.
- **Precedent for a non-reviewer authority rung: YES.** `proposals.withdraw` is a
  documented **proposer-only** gate that explicitly refuses the reviewer ladder
  ("Authority is proposer-only, NOT the approval-policy ladder... Anyone else —
  including a workspace owner/admin who is NOT the proposer — must use `reject`").
  The three-rung shape (author / owner / reviewer) is therefore already established.
- **Precluded? NO.** An author gate grants strictly less than reviewer: amend-own-pending
  only, still PENDING-locked, still cannot approve. It does not touch
  `computeCanReviewApproval` and so cannot widen approve.

Recommended shape: in `mergeProposalRevision`, add an `actingAgentUserId` param and admit
when `existing.agentUserId === actingAgentUserId` **as a separate branch**, never by
passing the agent id into `computeCanReviewApproval` (which would trip #3).

## (e) LINKED vs GLOBAL AGENT — the schema supports pod-global today [VERIFIED]

- `users.createdByUserId` is **nullable** (`packages/database/src/schema/users.ts:90`),
  so an owner-less agent-user is representable.
- A pod-wide agent KEY is a first-class, named case:
  `access/key-identity.ts` header calls out "A pod-wide agent key (userType='agent',
  no linked human)" as exactly the case a `linkedUserId`-keyed derivation gets wrong,
  and `shouldRejectUnattributedWrite` ADMITs it via the `isAgent` bit.
  There is an opt-in mint door (`podWide: true`) — `agent-identity-service.podwide.test.ts`.
- **But the human-owner requirement survives at the agent-USER level.** That same test
  states `createdByUserId` is REQUIRED regardless of `podWide` (NO_HUMAN_OWNER), and
  `scripts/provision-agent.ts:479` hard-errors without an owner.
  So today: **pod-global KEY = yes; owner-less agent USER = representable in the schema,
  refused by every provisioning door.**
- Consequence worth flagging: `ownAgentUserFilter` floors on
  `createdByUserId = <human> AND userType = 'agent'`, so a genuinely owner-less agent's
  proposals would fall outside **every** human's author floor and outside the
  `isAgentOwner` reviewer widening — i.e. unreviewable-by-owner. The owner requirement is
  what currently prevents that; dropping it needs a companion answer.
