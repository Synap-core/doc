# Dive: one-door capture — build state + prior art

Read-only. Repo `/Users/antoine/Documents/Code/synap`. Every `file:line` below was
read this session. Tags: **VERIFIED** = I read the code / fetched the page.
**INFERRED** = reasoning over what I read. **NOT FOUND** = I looked and did not find it.

⚠️ `capture.ts` and the receipt path are being edited by a peer agent right now;
line numbers in `routers/capture.ts` may shift.

---

## (a) BUILD-STATE TABLE

### Ask #1 — ONE door, send text, service infers what to create

| Sub-step | State | Evidence |
|---|---|---|
| One tool that takes the whole gradient | **SHIPPED** | `synap_capture` schema, `packages/api/src/routers/mcp/tools/index.ts:1788-1900`. Description is explicit: "the payload is a GRADIENT" — `text` alone / `entities[]` / `entities[]+relations[]` |
| Free-text → typed entities via AI | **SHIPPED** | `capture.structure` (`routers/capture.ts:900`) calls IS `/structure` (`synap-intelligence-service/apps/intelligence-hub/src/routes/structure.ts`, 1530 lines of prompt + schema) |
| Text lane actually WRITES (not just previews) | **SHIPPED** | `routers/mcp/handlers/capture.ts:592-607` — structure() then execute(); the comment records that an earlier version previewed only, so the "write door wrote nothing" |
| Non-text inputs on the same door | **SHIPPED** | `structure` accepts `file` (base64/utf8 + mimeType, normalized by IS), `url`, `html` — `capture.ts:906-922` |
| Routing to the right workspace inferred | **SHIPPED** | up to 30 workspaces + projects fed as hints (`capture.ts:1063-1090`); `resolveWorkspacePlacement` + an IS `workspaceTiebreak` when >1 candidate (`capture.ts:1425-1455`) |
| Anchor to an existing entity ("updates on this") | **SHIPPED** | `anchorEntityId` (`capture.ts:940-1050`) — feeds identity+shape so the model patches rather than duplicates |
| Dedup before create | **SHIPPED** | `dedupMode: "title" | "semantic" | "both"` (default both) `capture.ts:945`; `semanticDedupCandidates` pgvector `capture.ts:340` |
| Structurer down → honest degrade | **SHIPPED** | `buildDegradedCaptureFallback` (`capture.ts:295`) files a generic `item` at confidence 0.3 with the **full text preserved** in `properties.content` (no truncation); MCP relays a `degradedNotice` telling the agent to tell the user it was NOT structured (`handlers/capture.ts:640-647`) |

**Verdict on the gradient's `text` lane: it is the strongest of the four asks and
it is genuinely good.** The intent inference is not a thin `extract JSON` prompt —
`structure.ts` is a 1530-line contract with real domain rules (rule 1c: a project
is not an entity; rule 15: formSpec; rule 16: architectureSuggestion). VERIFIED.

**Does thin input silently produce a thin entity? NO — and this is the finding
that reverses the brief's premise.** `structure.ts:758` rule 13: an input framed
as an idea sketch ("Idea:", "What if", "Imagine", "Concept:") is extracted at
confidence ≤ 0.6 and **ALWAYS** gets a followUp inviting development — the prompt
says verbatim *"Never silently file an idea as a high-confidence plain note."*

### Ask #2 — the proposal is ITERABLE / long-living

| Sub-step | State | Evidence |
|---|---|---|
| Revise a pending proposal at all | **SHIPPED** | `mergeProposalRevision`, `packages/api/src/services/proposals/proposals-service.ts:382` — the ONE core behind three doors |
| Concurrency-safe | **SHIPPED** | `FOR UPDATE` row lock + `status !== PENDING → CONFLICT` (`:434`), explicitly so a revise can't be dropped while approve materializes the original |
| Revision is a **version**, not an overwrite | **SHIPPED** | `revisionHistory` JSONB appended on EVERY revise with before/after per field + actor (`:451`; `computeRevisedEnvelope` `:255-300`) |
| Revise the **payload** (what gets created) | **PARTIAL — core yes, agent door NO** | core supports `patch.kind: "inner"|envelope` (`:282-298`). But `synap_revise_proposal`'s schema is **`{proposalId, summary, reasoning}` only** — `routers/mcp/tools/index.ts:2240-2256`; handler `routers/mcp/handlers/build.ts:404-435` passes no patch; `reviseProposal()` (`proposals-service.ts:479`) hard-omits it |
| The **authoring agent** may revise | **ABSENT / by design** | gate is `computeCanReviewApproval` — *the same authority as approve* (`proposals-service.ts:404-420`, `routers/proposals/review-authority.ts:105`). Fails closed on absent actorId; returns NOT_FOUND not FORBIDDEN so it can't be an existence oracle |
| Guard against system-authored provenance edits | **SHIPPED** | `patchTouchesProtectedField` blocks `sourceFile` — the comment documents the cross-tenant read it would otherwise open (`proposals-service.ts:263-275`) |
| "A human has OPENED this" / stale-review signal | **NOT FOUND** | no view stamp, no reviewer lock, no baseline-version check on approve. A revise landing between render and click is silent |

**The founder's ask #2 as phrased is in direct tension with the pod's own
self-approval floor.** `synap_reject_proposal`'s description states the principle:
*"There is deliberately NO approve tool: approval is the HUMAN step (an agent key
that approved its own write would be self-approving)"* (`tools/index.ts:2268`).
Revise carries approve-level authority **because a revise rewrites the evidence
the human decides on**. Today MCP revise works only because it passes
`actorId: userId` — the linked human, not the agent. INFERRED from the two files.

**The prior-finding shape you warned about IS present**, in a slightly different
place than expected: the agent can rewrite `summary`/`reasoning` — *the sentence a
human reads* — while the payload that actually materialises is untouched and
unreachable. The approve path reads the payload; the human reads the summary;
nothing keeps them honest.

### Ask #3 — AI-to-AI clarification ("ask for more rather than guess")

| Sub-step | State | Evidence |
|---|---|---|
| Structurer can ask instead of extracting | **SHIPPED** | `followUp: string \| StructuredFollowUp \| null` — schema `structure.ts:259`, type `:874`, returned `:1344`; prompt rules `:743`, `:754`, `:758` |
| Answer **chips**, not just prose | **SHIPPED** | `suggestions: [{label, value, action}]` e.g. `action: "link_entity"` — `structure.ts:752` |
| A structured **form** for missing typed fields | **SHIPPED** | `formSpec` rule 15 `structure.ts:760-763`: 16 field types (text/number/date/enum/currency/person/entity-link/richtext/…), derived from the profile's real Props |
| Form NEVER blocks creation | **SHIPPED — and it is the founder's own constraint, already encoded** | `structure.ts:760` verbatim: *"A formSpec NEVER blocks or gates creation — the entity is ALWAYS extracted and created with what you already know… an OFFER to ENRICH"* |
| Right instrument chosen deliberately | **SHIPPED** | rule 8 (`:743`): prose/chip followUp for **linking & disambiguation** or ONE open question; formSpec for a **batch** of missing typed fields. Explicitly not interchangeable |
| Surfaced on the **agent** door (MCP) | **SHIPPED** | `handlers/capture.ts:648-707` — returns `needsInput` + question + suggestions + **the draft entities ready to re-send verbatim**, having written NOTHING |
| One reader, no drift | **SHIPPED** | `routers/capture-follow-up.ts` (53 lines) — written because two doors had hand-rolled the same narrowing + fallback sentence |
| The clarified answer is fed BACK into the same plan | **NOT FOUND** | I found no consumer that takes a followUp answer and re-runs `structure()` carrying it. The `previousEntities[]` channel (`capture.ts:920`) could carry the draft, but nothing wires the answer to it |
| A pending "needs-info" proposal that survives the round-trip | **ABSENT** | `shouldPersistCapturePlan` (`services/capture-agent/capture-structure-to-graph.ts:34`) **refuses to persist** when `followUp != null`. A clarification is a discarded round-trip, not a paused object |
| `pendingWorkspaceSwitch` generalisable to needs-info | **PARTIAL** | a confirm-with-the-user concept exists for placement, but it is placement-specific; I did not find a generic pending state |

**So ask #3 is the one already built. Its gap is not the QUESTION — it is the
MEMORY of the question.** The service asks, and then forgets: nothing is
persisted, and the answer has no wire back into the plan that prompted it.

### Ask #4 — full document creation

| Sub-step | State | Evidence |
|---|---|---|
| Agent can author a substantial document | **SHIPPED** | `synap_create_document({title, content})` — `tools/index.ts:695-728`; body is markdown, **no `.max()` anywhere on the Zod** (`routers/documents.ts:78,92,103`; `hub-protocol/rest/documents.ts:30`) |
| Entity + body in ONE call | **SHIPPED** | `synap_capture` `entities[].content` → "materialized as a linked document on approval" (`tools/index.ts` capture schema); executor `routers/proposals/executors/entity.ts:177,194,198`; composite `utils/materialize-composite.ts:581` |
| ONE door or two? | **TWO, deliberately, and documented** | `synap_create_document`'s own description routes you away from itself: *"If you're also creating the entity, prefer synap_create_entity with `content` (entity + body in ONE call)"* (`tools/index.ts:703`). `synap_update_entity.content` is a third: full REPLACEMENT, always proposed (`tools/index.ts:672,685-689`) |
| Attach on a proposal-gated create | **HONEST GAP** | `tools/index.ts:703`: "Attachment only happens when the document auto-approved; a proposal-gated one has no row to link yet, **and the response says so**" |
| Binary from disk | **ABSENT by design** | CLI `synap upload` / multipart only — "an agent can't do it here" (`tools/index.ts:703`) |

**The real ceiling — and it is a SEAM, not a size limit:**

- **Storage is uncapped.** No `.max()` on any document `content`. VERIFIED.
- **Inference is capped at 8000 chars.** `capture.structure` input `text: z.string().max(8000)` (`routers/capture.ts:906`); `html` at 50_000 (`:915`). So an agent can *store* a 200KB document but cannot ask the one door to *understand* more than 8000 characters of it. Structuring also has a 45s timeout / 3 attempts (`capture.ts:238,244`).
- **A long body can be silently-ish DISCARDED on dedup.** `materialize-composite.ts:532,608-623` — when a capture op dedups onto an existing entity, its long-form `content` is dropped. This is at least *reported* (`contentDropped: true`, `:149,652`), which is the honest half; but the agent that just authored 3000 words of meeting notes about an existing person gets them thrown away.

**Truncation hunt (the `knowledge_keys.value = 300` class):** I grepped for
`.slice(0, N)` / `substring(0, N)` across `packages/api/src` and
`packages/database/src`. **No silent tail-truncation of stored capture content
found.** The hits are all honest: `diagnose/index.ts:94`, `runs/index.ts:132`,
`execute-capability.ts:939` all return `{truncated: true, preview}` — they *say*
they truncated. `capture.ts:1439` `inputText.slice(0, 4000)` is the
**workspace-tiebreak prompt**, a routing hint that is never stored.
`capture.ts:347` `content.slice(0, 500)` is the dedup **embedding** text.
`audit-log.ts:46` appends `...[truncated]`. NOT FOUND: any stored capture body
that is tail-truncated while reading complete.

### Known limits from the brief — verification status

- relations cannot resolve on the project lens — **NOT RE-DERIVED** (accepted as measured; I did not spend budget re-proving it).
- capture reports `status:"applied"` when relations failed — **NOT RE-DERIVED**; a peer is fixing the receipt half. I saw the `contentDropped` signal as evidence the codebase is already moving toward honest partial-outcome reporting, which is the same class.

---

## (b) HONEST VERDICT — is capture "really strong and easy to use" today?

**Strong: yes, and more than the brief assumed.** The gradient is real, the text
lane is backed by a serious 1530-line structuring contract, degradation is
honest, dedup runs two ways, routing is inferred, and *the clarifying turn the
founder asked for already exists in three instruments on both doors*.

**Easy to use: no — and the reason is not missing capability, it is that every
non-trivial interaction is a THROWN-AWAY ROUND TRIP.**

Three concrete failures of "long-living":

1. **The clarification is not an object.** `shouldPersistCapturePlan` refuses to
   persist a plan carrying a followUp (`capture-structure-to-graph.ts:34`). The
   agent gets a question + a draft and must hold both in its own context; if the
   session ends, the capture evaporates. Nothing in the pod records that a
   capture is *waiting on the user*.
2. **The proposal's content is frozen at authoring time.** The agent may rewrite
   the sentence but not the substance (`tools/index.ts:2240-2256`). So "the AI
   refines its proposal" is exactly half-built: the versioning, locking and
   history are all there; the *field* is not exposed.
3. **The document ceiling is a seam, not a wall.** 8000 chars of inference vs
   unbounded storage means "capture this whole document and understand it" is a
   thing the door advertises (`file`, `url`, `html`) but caps at a length below
   most real documents. And a long body captured against a known entity is
   dropped on dedup.

---

## (c) PRIOR ART

### The clarifying turn — does asking cost you the user?

**"Ask or Assume? Uncertainty-Aware Clarification-Seeking in Coding Agents"**
(arXiv 2603.26233) — the most directly relevant measurement I found. VERIFIED by
fetching the paper.

| | asked | did not ask | overall |
|---|---|---|---|
| UA-Multi | 65.99% (n=344) | 76.92% (n=156) | **69.40%** |
| UA-Single | 55.81% (n=369) | 73.08% (n=131) | 61.20% |
| Interactive baseline | — | — | avg 1.02 queries/task |

**Read this carefully — it is easy to misread as "asking hurts".** The asked
column is lower because agents ask on the *harder* tasks (the paper reports a
9.28% higher ask rate on medium vs easy). The paper's own conclusion: *no
evidence that asking hurt performance*; the win is **calibration**, not volume.
The better system asked **more** (3.06 vs 1.84 queries/task) and scored higher
overall, and its questions were **early/mid** (41.8% / 43.4%) rather than
late (UA-Single skewed 43.9% late — "premature assumptions" surfacing too late).

**The actionable finding is about TIMING, not count**: a question asked before
writing is cheap; a question asked after is a correction. This aligns with, and
sharpens, the prior dive's "3 questions not 10".
Source: https://arxiv.org/html/2603.26233v1

Supporting (weaker, VERIFIED as existing but not measured): "Active Task
Disambiguation with LLMs", ICLR 2025 Spotlight — frames a clarifying question as
information-gathering that narrows interpretations *before* acting. And
"Feedback by Design" (arXiv 2602.01405) identifies **premature abandonment**
when users must shoulder the whole burden of expressing corrections and repairing
misunderstandings — i.e. abandonment is caused by the system *not* participating,
which is the opposite of the naive "asking causes abandonment" fear.
Sources: https://www.emergentmind.com/topics/clarifying-agent ·
https://arxiv.org/html/2602.01405v1

**NOT FOUND**: a hard measured abandonment curve for AI clarifying questions
specifically (the ~8-question form-abandonment literature is about *forms*, not
agents, and I did not find a clean transfer). Do not present one as measured.

### Long-living / revisable proposals — who lets the AUTHOR revise?

| System | Author may revise before review? | What it costs |
|---|---|---|
| **GitHub PR** | **Yes — and the revision INVALIDATES the review.** GitHub records the diff state at approval; if the diff changes, the approval is **dismissed as stale** and cannot merge without re-approval. On force-push, pending and existing reviews are dismissed outright. | Reviewer trust is protected by *destroying the stale verdict*, not by blocking the author. The community has complained about this for years (discussions #3478, #8808, #12876) precisely because it is aggressive — but nobody proposes letting the approval survive. VERIFIED |
| **Terraform plan → apply** | **No — a changed world makes the saved plan unappliable.** `Error: Saved plan is stale`, detected by comparing the state **serial** between plan and apply. The only remedy is to re-plan. | Zero ambiguity, at the cost of a full recompute. VERIFIED |
| **Google Docs suggestion** | Yes, freely — a suggestion is a live editable object until accepted | Trust is cheap because the *diff is rendered inline*, so a changed suggestion is visibly changed |
| **Copilot Workspace plan** | **Yes — the plan was "fully editable and regeneratable", add/edit/remove steps.** This was the product's headline. | It was **sunset 30 May 2025**; the spec→plan→implement workflow was split into Copilot Coding Agent + Copilot Spaces, and the standalone editable-plan review UI did not survive. Separately, GitHub CLI later hardened Plan mode so it *can no longer edit files*. VERIFIED that it was retired; **NOT FOUND**: an official postmortem saying why |

Sources: https://github.com/orgs/community/discussions/3478 ·
https://github.com/orgs/community/discussions/8808 ·
https://docs.github.com/en/enterprise-server@3.5/pull-requests/collaborating-with-pull-requests/reviewing-changes-in-pull-requests/about-pull-request-reviews ·
https://discuss.hashicorp.com/t/question-on-error-saved-plan-is-stale/52912 ·
https://github.blog/ai-and-ml/github-copilot/5-tips-and-tricks-when-using-github-copilot-workspace/ ·
https://www.techtimes.com/articles/320560/20260715/github-copilot-cli-closes-agentic-loophole-plan-mode-can-no-longer-edit-your-files.htm

**The pattern across all four: every system that permits author revision pairs it
with an explicit staleness mechanism.** Synap today has the *lock* (PENDING or
CONFLICT) but no *staleness* concept — no record of what a reviewer last saw.
That is the missing half, and it is cheaper than it looks: `revisionHistory`
already exists, so "the version you were shown" is one column away.

### Intent-to-structure from free text

**Airtable Omni** — plain-text requests build, update and query base data;
records/automations are **set up pending your confirmation**. VERIFIED that a
confirmation step exists. **NOT FOUND**: documented behaviour on *ambiguous*
input specifically — Airtable's help pages do not describe an ask-vs-guess
policy. Do not claim they ask.
Source: https://support.airtable.com/docs/using-omni-ai-in-airtable

**Notion AI / Reflect / Mem / Readwise / Superhuman**: **NOT FOUND** at the
evidentiary bar this dive requires. Search returned marketing and third-party
guides, not documented ambiguity behaviour. I am not going to characterise their
ask-vs-guess policy from a comparison blog. Flagging honestly rather than filling
the table.

---

## (d) ANTI-PATTERNS — paths prior art says are WRONG

1. **Asking a clarifying question on every input.** Not supported as "fatigue"
   by the evidence I found — the Ask-or-Assume paper found *no* evidence asking
   hurt. The real finding is that **uncalibrated** asking is the failure: the
   weaker system asked on 369/500 tasks and scored 61.20%; the stronger asked on
   344/500, later-weighted the other way, and scored 69.40%. So the anti-pattern
   is **asking without uncertainty calibration**, and specifically **asking
   LATE** (43.9% late-stage questioning correlated with premature assumptions).
   Synap already does the right thing here — rule 15 makes the form an *offer
   after* creation rather than a gate before it.
2. **Auto-structuring with no review step.** Every comparable — Omni, PR,
   Terraform — inserts a confirmation. Synap's proposal queue *is* this and
   should not be weakened.
3. **A proposal that mutates after a human starts reviewing it.** VERIFIED
   wrong by both GitHub (approval dismissed as stale on any diff change; reviews
   dismissed on force-push) and Terraform (`Saved plan is stale`, refuses to
   apply). The correct move is never "block the author" — it is "invalidate the
   verdict". **Synap currently does neither**, because it has no notion of what
   the reviewer saw.
4. **A heavyweight editable-plan review surface as the product.** Copilot
   Workspace's fully-editable plan was retired and its capability redistributed.
   Weak evidence (no postmortem) but it is the one direct attempt at exactly ask
   #2 as a UI, and it did not survive. Treat "make the proposal an editable
   document the user tends" as unproven, not obvious.
5. **Adding proposal volume.** Standing measurement: the queue is saturated
   (304 pending → 9 fingerprints). Any design whose first-order effect is *more
   rows* is disqualified on arrival.

---

## (e) OPTIONS FOR THE ONE-DOOR EXPERIENCE

All three respect: *structure is a consequence of capture, never a prerequisite*
(already encoded at `structure.ts:760`), and *no net new proposal volume*.

### Option A — "Close the loop on the question you already ask" (recommended)

The clarifying turn exists and is thrown away. Make it survive one round trip.

- **Exists**: `followUp` + `suggestions` + `formSpec` (`structure.ts:259,752,760`);
  the MCP `needsInput` envelope that already returns the draft verbatim
  (`handlers/capture.ts:648-707`); `previousEntities[]` as the input channel
  (`capture.ts:920`); `readCaptureFollowUp` as the one reader.
- **Build**: (1) accept the answer + the prior draft on `capture.structure` and
  thread both into the structuring call — the channel already exists, nothing new
  on the IS contract; (2) invert `shouldPersistCapturePlan`
  (`capture-structure-to-graph.ts:34`) for the followUp case *only* far enough to
  keep a **draft** — not a proposal — so a capture that is waiting on the user is
  a thing the pod knows about.
- **Cost**: small. The riskiest part is (2), and it must NOT mint a proposal —
  a draft is a distinct state or it violates the volume constraint.
- **Forecloses**: nothing. Strictly additive.
- **Why first**: it converts the best-built of the four asks from a stateless
  question into a conversation, and it is the change that makes capture *feel*
  intelligent rather than one-shot — which is the founder's actual complaint.

### Option B — "Let the author revise the substance, with a staleness stamp"

- **Exists**: the entire revise core — lock, PENDING guard, `patch.kind`
  inner/envelope merge, `revisionHistory` with before/after + actor
  (`proposals-service.ts:255-300,382-465`), and the protected-field guard.
- **Build**: expose `patch` on `synap_revise_proposal`
  (`tools/index.ts:2240`, `handlers/build.ts:404`, `proposals-service.ts:479`) —
  three small edits onto machinery that already exists — **plus the staleness
  half prior art says is mandatory**: stamp the revision index a reviewer was
  shown, and on approve, refuse (or re-confirm) if it advanced. GitHub dismisses;
  Terraform refuses; pick one and name it.
- **Cost**: the authority question is the real cost, not the code. Revise is
  gated at approve-level *on purpose*. Two sub-options: (i) a narrower
  **author-may-revise-own-pending** branch scoped to the agent's own lineage
  (`ownAgentUserFilter` already exists — `proposal-author-floor.test.ts`), or
  (ii) leave the human as actor and accept that "the AI refines its proposal"
  really means "the AI refines it on the human's behalf, in-session". (ii) is
  free and honest; (i) needs a governance decision.
- **Forecloses**: shipping (i) without the staleness stamp would permanently
  poison reviewer trust — that is the one sequencing constraint I would hold
  hard.

### Option C — "Raise the document ceiling"

- **Exists**: unbounded storage; `file`/`url`/`html` inputs; `contentDropped`.
- **Build**: chunked structuring above 8000 chars (`capture.ts:906`), and stop
  discarding a long body on dedup (`materialize-composite.ts:608-623`) — append
  or attach as a second document instead of dropping.
- **Cost**: real AI cost and latency; the 45s/3-attempt budget
  (`capture.ts:238,244`) does not survive chunking unchanged.
- **Forecloses**: nothing, but it is the option with the worst
  effort-to-perceived-improvement ratio of the three.

### Recommendation

**A, then B(ii) with the staleness stamp designed but B(i) deferred, then C.**

A is the only one that changes how capture *feels*, and it costs least because
the hard half — knowing when and how to ask — is already built and is better than
most of the prior art I found. B's machinery is built too, but its blocker is a
governance decision (self-approval floor), not engineering, and shipping the
revise-payload door without a staleness mechanism would repeat the one mistake
every comparable system explicitly guards against. C is a real limit but it is a
limit on an input length, not on the product's shape.

**One caution for the founder's framing**: "long-living commands" and "the AI
verifies and validates" pull toward giving the agent approve-adjacent authority.
The pod's refusal to give agents an approve tool is one of its better decisions.
The version of ask #2 that keeps that intact is *the agent iterating a DRAFT
before it ever becomes a proposal* — which is Option A, not Option B. That may be
what the founder actually means, and it is worth putting to him directly.

---

# ADDENDUM — three questions from the lead, settled

⚠️ `routers/mcp/handlers/capture.ts` shows ` M` in git status (the peer's
receipt fix is in flight). Line numbers below re-read at the time of writing.

## Q1 — Is the clarifying turn reachable from the `entities[]` lane? **NO. VERIFIED.**

**Your live data point is fully explained by the code, and the hypothesis is
correct.**

`routers/mcp/handlers/capture.ts:144` — `if (captureEntities.length > 0) {` opens
the STRUCTURED/GRAPH branch. That branch is **terminal**: every one of its exits
is a `return ok({...})` (`:183, :195, :387, :413, :486`). The IS structurer is
called at `:601` — *after* that block, reachable only when `captureEntities` is
empty.

So: **`entities[]` present ⇒ `structure()` never runs ⇒ `followUp` / `formSpec` /
`needsInput` cannot exist.** Not a bug — the branch comment at `:141-143` is
explicit that the structured payload "wins (it is the precise one)" and the text
rides along as `rawSource` provenance. It is a correct decision with an
unintended consequence.

**The consequence is the product-shaped finding.** Under BYOA, the agent is the
primary caller, and an agent naturally sends `entities[]` because it *can*
structure. So the clarifying turn — the best-built of the four asks — fires for
prose callers (humans, the CLI's `runSmartCapture`, web/extension capture) and
**essentially never for the agent door**. Four production calls, zero follow-ups,
is exactly what this code predicts.

Worth noting what this does NOT mean: the `entities[]` lane is not "dumb" — it
still runs identity dedup, within-batch collapse, and returns
`pendingDuplicateCandidates`. What it cannot do is *ask*.

## Q2 — Is there a store for a parked plan? **YES — and it is gated OFF for agents. VERIFIED.**

This is the sharpest finding of the addendum, and it inverts my earlier answer.

`routers/hub-protocol/rest/capture.ts:591-599` — a block headed
**"CONFIRM MODE (the server holds the plan)"**. Its own comment:

> "A HUMAN interactive caller (no agentUserId) gets the produced plan PERSISTED
> as a pending composite proposal the moment it is offered — so an abandoned plan
> is a visible uncommitted proposal, not silence. This closes the false-success
> incident by construction… **An AGENT caller (agentUserId set) still gets the
> ephemeral plan** to drive its own /capture/graph write."

The gate is literally `if (!structureAgentUserId && shouldPersistCapturePlan(...))`
(`:602`).

**So your one-line statement is right, and it is narrower and more damning than
"nothing is built":** the pod already knows how to hold a plan. It refuses to do
so *for agents specifically*. For an agent, **the caller's context is the only
memory** — by design, documented in that comment.

Two independent reasons a clarified capture evaporates, and they compound:
1. `shouldPersistCapturePlan` (`services/capture-agent/capture-structure-to-graph.ts:34`)
   refuses ANY plan carrying a `followUp` — so even a human's clarified plan is
   not parked.
2. The `!structureAgentUserId` gate — so even a confident plan is not parked for
   an agent.

An agent hitting a follow-up fails BOTH. The MCP handler's `needsInput` envelope
(`handlers/capture.ts:648-707`) hands the draft back precisely because there is
nowhere else to put it.

This reframes the build cost of Option A downward: the persist path exists,
`submitCaptureGraph` is idempotent, and a "parked" state is a narrowing of two
existing conditions rather than new machinery. It also sharpens the volume
constraint — the human lane ALREADY files a proposal per offered plan
(`status: "awaiting_confirmation"`, `:665`), which is plausibly a contributor to
the 304-pending saturation. **Any Option A design must park agent drafts as
something that is NOT a proposal row**, or it will make the measured problem worse.

## Q3 — Does the 8000 cap REJECT or TRUNCATE? **It REJECTS. VERIFIED. Not the `knowledge_keys` class.**

`routers/capture.ts:906` — `text: z.string().max(8000).optional()`. Zod `.max()`
throws a validation error; it does not slice. A 9000-char capture is **refused
with an error**, not silently shortened. Honest.

I also chased the caller side, because a caller-side pre-slice would have
recreated the defect invisibly. **It used to exist and was already fixed** —
`handlers/capture.ts:468-470`:

> "The 8000-char slice that used to live here was one of THREE different
> caller-side caps; `submitCaptureGraph` now enforces RAW_SOURCE_MAX_CHARS itself."

And `services/capture-agent/capture-narrative.ts:19-28` records the whole
incident, including the reasoning I would want to see:

> "100_000 is the value kept because it is the only one that was ever ENFORCED —
> `CaptureGraphRawSourceSchema` REJECTS above it. Adopting MCP's 8_000 instead
> would have silently shortened the webhook bodies that path retains, **losing
> provenance to fix a duplicate**."

So provenance is bounded at `RAW_SOURCE_MAX_CHARS = 100_000` by one truncation
door, `boundRawSourceText` (`capture-narrative.ts:37-42`) — that one DOES slice,
but at 100k and in a single enforced place, documented as the one door.

**One residual, and it is the `--claim` pattern wearing the coat you predicted —
but in the CLI, not the pod.** `synap-cli/src/commands/knowledge.ts:70-82`:
`SMART_TEXT_MAX = 8000` (plus `CLAIM_MAX = 1000`, `WHY_MAX`, `EVIDENCE_MAX`) fed
to `guardLength`, which *"warns… and offers to truncate (interactive) or proceed
as-is"*. Interactive: the user is asked, so it is consented. **Non-interactive
(`--yes` / `--json`): it warns to stderr and proceeds UNCHANGED** — explicitly
"a heads-up, not a client-side hard block". That is the right call: it does not
truncate behind your back, it lets the pod's own `.max()` reject. A stderr warning
in a `--json` run is easy to miss, but nothing is silently lost.

**Net: no silent tail-truncation of capture content anywhere I looked. The
`knowledge_keys` 300-char class is NOT repeated in capture.** Say so plainly.

## Revised framing of the two asks

- **Ask #3 (clarification): SHIPPED** — and its `formSpec`-never-blocks rule
  (`structure.ts:760`) already encodes *structure is a consequence of capture,
  never a prerequisite*. Its defect is REACHABILITY (Q1), not existence.
- **Ask #2 (iterable / long-living): the real gap**, and it now has two named
  halves: nothing routes an answer back into a second `structure()` call, and the
  plan-parking that exists is switched off for exactly the caller that needs it.
