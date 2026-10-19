# Dive: Automation platform ecosystem — evidence report
**Status: COMPLETE. Read-only market research, 3 research passes. No code written.**

## Verified so far (with sources)

### State-between-runs: the hard numbers
| Platform | Native state primitive | Hard limit | Source |
|---|---|---|---|
| Make.com | Data Stores | **1 MB per store on Core; 10 MB on Pro/Teams**; 512 KB max per record; NOT available on Free | https://www.make.com/en/help/tools/data-store , https://community.make.com/t/data-store-pricing/361 |
| n8n | Data Tables (recent) | **200 MiB total per instance** (all tables); no Code-node programmatic access; "light to moderate data storage" | https://docs.n8n.io/build/work-with-data/data-tables |
| Zapier | Zapier Tables | fewer data types than Airtable, positioned for automation not data mgmt | https://zapier.com/blog/zapier-vs-airtable/ |

**Reading**: a 1–10 MB data store is not a database — it is a scratchpad. This is the strongest early evidence for the statefulness thesis. n8n's 200 MiB is an order of magnitude better but still explicitly framed as "light to moderate".

**Counter-evidence to flag**: all three incumbents have SHIPPED a state primitive. The gap is being closed, not ignored. n8n Data Tables is described by the community as "the MISSING feature in n8n has arrived" — i.e. the market recognised the gap and the incumbent responded.

### Template library scale
- n8n official template library: **11,741 templates as of Aug 2026**, of which **8,002 are in the AI category (~70%)**. Source: https://connectsafely.ai/articles/n8n-templates-workflow-automation-examples (secondary; needs primary verification against n8n.io/workflows).
- **n8n does not publish a measured popularity ranking of templates** — so any "top 10 most used" list found online is editorial, not measured. NOT FOUND: measured usage distribution.
- Zapier docs state: "Most Zap templates only need two steps — a trigger to watch for new/updated data in one app, and an action in another." Source: https://help.zapier.com/hc/en-us/articles/22234847450893-Zaps-quick-start-guide (vendor's own framing of the modal shape = 2 steps).

### Recurring pain (pass 1)
1. **Opaque failures** — "Node execution failed" with no detail; long-running/loop-heavy executions lose all failure detail; "Debug in editor" unusable on large payloads. Sources: https://community.n8n.io/t/execution-runs-for-a-long-time-confirmed-then-later-shows-error-in-6-8s-execution-was-interrupted-with-no-error-details-loop-heavy-workflow/256461 , https://community.n8n.io/t/unable-to-see-execution-error/111731
2. **Auth/token expiry** — expired OAuth token named as one of the top recurring root causes.
3. **Upstream API drift** — third-party changed its JSON; node deprecated after an n8n upgrade.

(more to come)

## Research pass 2 — AI authoring, HITL prior art, pricing

### Gumloop's human-in-the-loop (PRIMARY, closest prior art to Synap proposals)
https://docs.gumloop.com/core-concepts/human_in_the_loop
- Four approval modes: **"Ask each time" · "Ask for writes/deletes" · "Always allow" · custom per-tool**, plus **App Rules (CEL)** — conditional on the actual tool ARGUMENTS ("require approval only when the email recipient is outside my company domain").
- Stated default: **"Ask for writes/deletes is a great default for most apps."**
- Approval card shows: tool name+icon, **an intent line describing what the agent is trying to do**, key arguments, approve/reject, and a **"Don't ask again for this tool"** checkbox.
- Delivery: chat thread, notification bell, **Tasks page (a centralised approval queue)**, Slack DM.
- 🔴 **Hard limitation: the reviewer CANNOT EDIT the arguments — approve-or-reject only.**
- Rejections are non-destructive: the agent adapts and suggests an alternative rather than failing.

**Direct read for Synap**: this is a near-exact convergent design with Synap's proposal flow — an intent line, a queue, per-action granularity, and a write/delete floor. Two things Synap already has that Gumloop does NOT: (1) **editable/partial approval** (per-item dispositions), (2) rules stored as a governed, user-editable object with lineage rather than a per-tool toggle. Gumloop's CEL "App Rules" is the same idea as `governance_rules` — arriving independently at the same shape is corroboration that the 5-granularity rule store is the right primitive, not over-engineering.

### AI authoring: what the AI actually does
| Product | What the AI does | Evidence |
|---|---|---|
| n8n AI Workflow Builder (beta, launched **13 Oct 2025**) | **Authors** the workflow: "node selection, placement, and configuration". Credentials are NOT sent to the LLM; past executions are NOT sent. User "must review required credentials and other parameters" after generation. **No accuracy claims, no acceptance-rate data, no approval gate documented.** | https://docs.n8n.io/build/ways-of-building-workflows/ai-workflow-builder |
| Make AI Agents (announced 14 Apr 2025; open beta 2 Feb 2026; "next generation" Feb 2026) | **Runtime**: "agents decide at runtime which tools to invoke, in what order, and how many times, based on the goal you define". Authoring stays visual/human. | https://www.make.com/en/ai-agents , https://www.make.com/en/blog/announcing-next-generation-make-ai-agents |
| Zapier Agents (formerly/aka Central) | Runtime agents over the connector estate. In 2026 **AI steps, code steps, MCP and SDK calls all draw from the same task pool** as ordinary actions. | https://zapier.com/blog/zapier-agents-guide/ ; https://www.usecarly.com/blog/zapier-pricing/ |
| Lindy | Runtime autonomous "AI employee" + explicit HITL escalation for high-stakes actions | https://www.lindy.ai/lindy-vs-zapier |
| Relay.app | HITL is the **product thesis**: "a lot of real workflows shouldn't be fully autonomous" — AI drafts, a human approves/**edits**/rejects before it goes out | https://www.relay.app/blog/gumloop-alternatives , https://www.usecarly.com/blog/human-in-the-loop-automation-tools/ |

⚠️ **NOT FOUND**: no vendor publishes acceptance rates, edit rates, or failure-mode data for AI-generated workflows. Every claim about "AI authoring works / doesn't work" in the market is currently unfalsifiable marketing. Do NOT let anyone cite a number here.

### Pricing
- **Zapier is per-task**: a task = "any successful action performed by a Zap after it triggers". Free = 100 tasks/mo. Professional $19.99/mo annual (750 tasks) / $29.99 monthly. Team $69/mo annual (2,000 tasks) / $103.50 monthly. **Overage billed at 1.25× base rate, hard cap 3× included tasks.** Annual saves 33%. Sources: https://www.nocode.mba/articles/zapier-pricing-2026 , https://www.usecarly.com/blog/zapier-pricing/
- **The 2026 change worth noting**: AI/MCP/SDK calls now consume the SAME task pool. Agentic usage is metered as automation volume — i.e. the incumbent monetises AI by making it *more* expensive per run, which is exactly the wrong shape for an agent that iterates.
- Airtable (the de-facto bolt-on DB) prices like a **database/seat**: free = 1,000 records/base + 100 automation runs; Team from $20/user/mo with 50,000 records/base + 25,000 automation runs. https://zapier.com/blog/zapier-vs-airtable/

### Versioning pain (recurs, unresolved)
- n8n **has no built-in workflow version control**. GitHub issue #26707 "Feature Request: Built-in Workflow Version Control System" — four stated pains: no visibility into who changed what, no rollback after a breaking change, no audit trail, production instability from unintended edits. **Status: pending triage, no official response, no assignee.** https://github.com/n8n-io/n8n/issues/26707
- Community thread on dev/staging/prod: "changes are made directly in the editor… hard to track, rollbacks painful, small edits accidentally break production." https://community.n8n.io/t/versioning-and-deploying-n8n-workflows-across-dev-staging-and-production/295660
- **Windmill's whole positioning is this pain**: scripts "versioned in Git and tested like real software". https://automationatlas.io/answers/n8n-vs-windmill-2026/

### AI-project failure base rates (context for the approval thesis)
- Deloitte 2026 Tech Trends: **89% of enterprise agent pilots never reach production**.
- Gartner (Jun 2025): **>40% of agentic AI projects cancelled by end-2027**; separately, **60% of AI projects abandoned by 2026 "due to lack of AI-ready data"**.
- MIT: **95% of GenAI pilots deliver no measurable P&L impact**.
Sources (secondary aggregators — the underlying reports are paywalled): https://www.digitalapplied.com/blog/ai-agent-adoption-2026-enterprise-data-points , https://www.beri.net/article/ai-agent-adoption-enterprise-2026-gartner-idc
⚠️ These are secondary citations of paywalled analyst reports. Treat as directional, not measured. **The Gartner "lack of AI-ready data" line is the single most on-thesis external datapoint in this report** — but it is a prediction, not a measurement.

## Research pass 3 — THE QUANTIFICATION (n8n Pulse node usage)

**Source: https://n8n-pulse.gui.do/nodes/** — third-party analytics over n8n's template library. "Estimated deployments" = node frequency in templates × how often those templates are actually used.

Top 10 official nodes by estimated deployments:
| # | Node | Est. deployments | Templates |
|---|---|---|---|
| 1 | **Sticky Note** | ~10.5M | 6.7K |
| 2 | HTTP Request | ~3.5M | 3.8K |
| 3 | Edit Fields (Set) | ~2.9M | 3.9K |
| 4 | Code | ~1.6M | 3.6K |
| 5 | OpenAI Chat Model | ~1.4M | 1.9K |
| 6 | AI Agent | ~1.4M | 2.6K |
| 7 | **Google Sheets** | ~1.3M | 2.3K |
| 8 | If | ~1.2M | 3.1K |
| 9 | Telegram | ~753K | 984 |
| 10 | Wait | ~714K | 1.2K |

Database & Storage category: **Airtable ~134.3K (#1) · Notion ~78.7K (#2) · Postgres ~56.9K (#3)**.

### Three findings fall straight out of this table

**(1) The bolt-on-database pattern is REAL and it is roughly 26:1.**
Consumer bolt-on stores (Google Sheets 1.3M + Airtable 134K + Notion 79K ≈ **1.51M**) vs the actual database (Postgres 57K) ≈ **26:1**. Google Sheets alone outranks every real database by ~23×, and outranks `If` — i.e. **a spreadsheet is used more often than a conditional**. When an n8n workflow needs to remember something, it overwhelmingly writes to a spreadsheet.
⚠️ *Caveat, stated honestly*: this measures the TEMPLATE corpus weighted by template popularity, not production runtime. It over-represents shareable/demo workflows. It is the best public measure that exists; there is no vendor-published runtime distribution. **NOT FOUND: any measured runtime node distribution.**

**(2) The single most-deployed node in the whole ecosystem is a COMMENT.**
Sticky Note at ~10.5M is 3× the next node. Authors annotate these graphs more than they do anything else. That is a **legibility** finding: the artifact does not explain itself, so humans paper over it. It is also a warning about node-graph authoring (see anti-patterns).

**(3) The modal flow is glue, not logic.**
HTTP Request, Set, Code, If — the top of the table is almost entirely *plumbing*, not domain semantics. The most common real work is: call an API → reshape fields → branch once → write to a spreadsheet.

### Connector breadth (the axis Synap concedes)
- **Zapier: 9,000+ apps** (Jun 2026) — but Zapier counts each trigger/action variation separately (an app with 5 triggers + 10 actions = 15 "integrations").
- **Make: ~1,500–2,000**. **n8n: 1,000+ nodes** (counted per app, not per operation).
Sources: https://automationatlas.io/guides/zapier-vs-n8n-2026-comparison/ , https://vps.us/blog/how-many-n8n-integrations/ , https://tech-insider.org/n8n-vs-zapier-2026/
**Read**: the headline gap (9,000 vs 1,000) is partly an artifact of counting method — but n8n still competes on breadth, and does it via the escape hatch (HTTP Request node = 3.5M deployments, #2). **Nobody wins connector breadth from a standing start in 2026. Correct to concede.**

### n8n pricing model change (2026) — the most informative vendor move
- **April 2026: n8n removed all active-workflow limits on every plan.** Every Cloud plan now has **unlimited workflows and unlimited users — only execution volume is billed.** Cloud: Starter €24/mo (2,500 executions), Pro €60/mo (10,000), Business €800/mo (40,000 + 30 concurrent). Self-hosted Community Edition: free, unlimited executions, ~$5–20/mo VPS.
Source: https://automationatlas.io/answers/n8n-pricing-self-hosted-vs-cloud-2026/ , https://sliplane.io/blog/n8n-pricing
**Read**: the market moved AWAY from charging for the *configuration* and toward charging for the *run*. Config is free; compute is metered. And n8n meters per **execution** while Zapier meters per **task (=per successful action)** — n8n's unit is ~an order of magnitude cheaper for a multi-step flow. Zapier's 2026 decision to draw **AI/MCP/SDK calls from the same task pool** goes the other way and makes agentic use punitively expensive.

### Zapier Canvas — CORRECTION to a plausible assumption
I expected Canvas to be a diagram-only tool (which would have been evidence against node graphs). **It is not.** Canvas both diagrams AND executes: "immediately transform your plan into an automated solution in the same spot", plus on-Canvas field mapping "without having to jump to the Zap editor", and an AI asset builder that turns Canvas copy "into a Zap, interface, chatbot, or table". Source: https://zapier.com/blog/zapier-canvas-guide/
So Zapier now runs **two** authoring surfaces: a linear step list (primary, for non-technical users) and a canvas (for systems-level planning + execution). The linear list remains the default. **Do not claim Zapier rejected the canvas — it added one, and kept the list as the default.**

---
# THE ANSWERS

## (a) What people actually build — the shape distribution

**Honest framing first: no vendor publishes a measured shape distribution.** n8n explicitly does not publish a popularity ranking of templates. Zapier publishes no usage share. Every "top 10 templates" article found is editorial. So the distribution below is **reconstructed from three independent measurable proxies**, and I label each inference.

**Proxy 1 — Zapier's own words on the modal shape (VERIFIED):** "Most Zap templates only need two steps, with a trigger to watch for new or updated data from one app, and an action to do something with that data in another app." (https://help.zapier.com/hc/en-us/articles/22234847450893-Zaps-quick-start-guide). Also: the Zapier **free plan only permits two-step Zaps** — you cannot build a multi-step Zap without paying. A vendor puts the paywall exactly where the value cliff is; the cliff is at step 3.

**Proxy 2 — n8n node deployments (VERIFIED, template-weighted):** the top of the table is plumbing (HTTP, Set, Code, If), and the most-used *destination* is a spreadsheet.

**Proxy 3 — Zapier's own "14 popular ways" list (VERIFIED as a list, no usage numbers):** RSS→social, form→sheet, form→email, lead→sheet/email, X→to-do, webhook→anything, X→Slack, PM tool→calendar, email attachment→storage, email→task, digest→email/Slack, survey→email, AI email triage, news monitoring→repository.

### The ten shapes, as reconstructed
1. **Notify** — event in app A → message in Slack/Telegram/email. (Pure fan-out, 2 steps.)
2. **Log** — event in app A → append a row to Google Sheets/Airtable. (The single most common *stateful-looking* shape, and the one that is really a bolt-on DB.)
3. **Sync/mirror** — record created/updated in A → create/update in B. (Perpetually broken by pagination and dedup.)
4. **Intake** — form/email/webhook → create a record + acknowledge the sender.
5. **Schedule + digest** — cron → fetch N things → summarise → post once. (The `Wait` and `If` nodes live here.)
6. **Content fan-out** — one artifact (RSS item, blog post, video) → N destinations with per-channel reformatting.
7. **Enrich** — a new record → call 1–3 external lookups → write the enriched fields back.
8. **Triage/classify** — inbound item → LLM classification → route to one of K destinations. (The genuinely new 2025–26 shape; `AI Agent` ~1.4M.)
9. **Scrape/ingest → vector store** — the RAG-ingest shape; ~70% of n8n's library is tagged AI.
10. **Approval gate** — draft something → pause for a human → continue. (The rarest and the one every AI-native vendor is now racing to own.)

### Trivial-glue vs genuinely multi-step
**Estimate, LABELLED AS INFERENCE, not measured:** shapes 1–4 are 2–4 steps and plausibly the majority of *instances*; shapes 5–9 are 5–15 steps and are the majority of *templates* in a shareable corpus (templates are written to be impressive). The template library systematically over-represents complexity relative to what people run. I could not find data to convert this into a number and **will not invent one**. What IS verified is the direction: Zapier's own product paywalls step 3, and its own docs call two steps the norm.

**The single most important implication for Synap:** the modal automation's *destination* is a spreadsheet acting as a database, and its *trigger* is an event in someone else's SaaS. Synap owns the destination natively and does not own the trigger. That asymmetry is the whole strategic problem, and also the whole opportunity — see (c).

---

## (b) Recurring pains, ranked by recurrence

1. **Opaque failure / undebuggable runs.** "Node execution failed" with no detail; loop-heavy or long executions lose ALL failure detail; "Debug in editor" unusable on large payloads. Most-repeated forum complaint class. (https://community.n8n.io/t/execution-runs-for-a-long-time-confirmed-then-later-shows-error-in-6-8s-execution-was-interrupted-with-no-error-details-loop-heavy-workflow/256461 , https://community.n8n.io/t/unable-to-see-execution-error/111731)
2. **No versioning, no rollback, no audit trail, no dev→staging→prod path.** GitHub #26707, still **pending triage with no official response**; a community thread describing exactly this on a multi-environment install; and Windmill's entire market position is "versioned in Git and tested like real software". A pain that a *competitor is built around* is a confirmed pain.
3. **Auth/token expiry.** Expired OAuth named as a leading recurring root cause of silent breakage.
4. **Upstream drift.** A third-party changed its JSON shape, or a node was deprecated by a platform upgrade — the flow was correct yesterday and is wrong today with no code change.
5. **State/memory.** Addressed below in (c). The evidence that it recurred is that all three incumbents shipped a store, and n8n's community greeted Data Tables as "the MISSING feature".
6. **Cost at volume.** Zapier's per-*task* meter with 1.25× overage and a 3× hard cap; the 2026 decision to draw AI/MCP/SDK from the same pool. n8n's countervailing move (unlimited workflows, meter executions only; free self-host) is why "over 1,000 teams" reportedly moved to managed self-hosted n8n.
7. **Data semantics / array handling.** "Lost client data because I didn't understand how n8n handles arrays"; days lost to a missing comma. This is the tax of untyped JSON flowing between untyped nodes.
8. **Legibility.** Inferred from Sticky Note being the #1 node at ~10.5M — 3× the runner-up. Nobody asks for this in a forum post; they just paper over it.

**The discipline the founder asked for — what vendors advertise fixing vs what actually recurs:**
- Vendors advertise: *connector count*, *AI agents*, *speed of building*.
- What recurs: *debuggability*, *versioning*, *auth rot*, *upstream drift*, *cost*.
**None of the top four pains are about building the automation. They are all about OWNING one over time.** The market sells authoring; the pain is operations. That is the gap.

---

## (c) VERDICT on the statefulness gap

### The case FOR ("automation over your own graph" is a real differentiated position)
- **Quantified**: 26:1 ratio of consumer bolt-on stores to real databases in the n8n corpus. Google Sheets is the #7 node overall and more used than `If`. The bolt-on is not an edge case; it is the default.
- **Quantified**: the native stores are toys. **Make: 1 MB per data store on Core, 10 MB on Pro** — that is not a database, it is a cookie jar, and it is *absent entirely on Free*. n8n: 200 MiB per instance, no Code-node access, self-described as "light to moderate".
- **Structural**: in the modal flow, *both* the trigger and the target are things the pod already models as first-class typed entities. On n8n you pay a connector round-trip, an auth token, a rate limit, and a schema-drift risk for each. On a pod those are local reads/writes against a typed graph you own.
- **Corroborating**: Gartner's stated reason for predicted AI-project abandonment is **"lack of AI-ready data"** — not lack of connectors, not lack of models.
- **The pains rank in Synap's favour**: #2 (versioning/audit/rollback) is nearly free when the automation is a *stored, governed config object* with proposal lineage rather than a JSON blob in an editor. #3 and #4 (auth rot, upstream drift) largely evaporate for flows whose endpoints are internal.

### The case AGAINST (it's a rationalisation)
- **The gap is closing in public.** n8n shipped Data Tables; Zapier shipped Tables; Make has Data Stores. If "stateless pipes" was the wedge, the incumbents have already conceded it and have 9,000 connectors on the other side of the trade.
- **Google Sheets' 1.3M is NOT purely a memory pattern.** A large share is *reporting* — the sheet is the human-readable output, not the automation's working memory. Attributing all 1.3M to "the platform lacks a database" over-reads the data. A pod does not obviously beat "my boss can open the spreadsheet".
- **The bolt-on isn't experienced as pain.** People do not complain about using Airtable; they *like* Airtable. A gap nobody is angry about is a weak wedge. Contrast with #1 and #2, which generate real forum anger.
- **The trigger side is unowned.** Synap owns the destination. Almost every valuable automation *starts* outside the pod. "Automation over your own data" with no inbound events is a cron over a database — which is a feature of every database, not a product.
- **The 26:1 number measures templates, not runtime**, and I cannot upgrade it.

### COMMITTED VERDICT
**It is a real position, but not the one as stated. "Automation over your own accumulated graph" is a rationalisation. "Automation whose STATE, HISTORY and GOVERNANCE are first-class objects you own" is the real, defensible axis — and it wins on pains #1, #2 and #5, not on statefulness alone.**

Reasoning: the statefulness gap alone loses the argument, because incumbents shipped stores and users don't resent Airtable. But state is not one thing. There are two kinds, and the incumbents only closed the first:
- **Working state** (a counter, a last-seen cursor, a dedupe key) — n8n/Make/Zapier now handle this adequately. **Concede this. Synap wins nothing here.**
- **Accumulated, typed, cross-run, cross-automation state that is ALSO the subject of the automation** — a `deal` whose stage moved, a `person` who acquired a `client` facet, a `session` that closed with three outputs. No incumbent has this and none can retrofit it, because their data model is "rows in a side table", not "the domain".

The second kind is what makes pains #1 and #2 solvable rather than merely mitigated:
- **Debuggability (#1)**: on n8n a failed run is a JSON payload in a log. On a pod, a run is a *session* against *entities*, and "what did this change" is a query over the graph, not an archaeology of payloads. Synap already has the run/receipt session projection and proposal lineage to answer that.
- **Versioning (#2)**: n8n's #1 unmet request is workflow version control. Synap's automations are already stored, user-editable configs with proposal-based mutation and `source_proposal_id` lineage. **Synap has, as a by-product of its governance model, the feature that is n8n's oldest un-triaged ask.**

**Therefore the honest positioning is NOT "we're the stateful one." It is: "your automations are objects in your graph, with the same history, permissions, and review as your data — so you can debug them, roll them back, and let an agent change them safely."** Pitching statefulness invites the reply "n8n has Data Tables". Pitching *governed, versioned, auditable automations over typed domain objects* has no incumbent reply, because giving it to you would require them to own your data model — which is precisely what their customers won't let them do.

**And be honest about the concession**: Synap does not own the trigger side. A pod-native automation platform without inbound events is a cron. **Inbound event ingestion is the prerequisite, not the differentiator** — and any use case below that starts with an external trigger inherits every auth-rot and upstream-drift pain that n8n has.

---

## (d) AI-authoring prior art and its lessons

**What the AI actually does, by product (VERIFIED, table in pass 2):**
- **Authoring**: n8n AI Workflow Builder (beta since 13 Oct 2025) and Zapier Copilot / natural-language Zap builder (still in Beta per Zapier's own help article title). Both *draft a structure a human then reviews*. Neither is autonomous.
- **Runtime**: Make AI Agents (agents choose tools/order/count at runtime), Zapier Agents, Lindy. The AI is a *step*, not an author.
- **Approval-first**: Relay.app (HITL is the thesis), Gumloop (four-mode approval + CEL argument rules).

### Lesson 1 — NOBODY has abandoned NL-to-workflow, but NOBODY has graduated it either.
Zapier's natural-language Zap builder is **still labelled Beta** and framed as generating an *outline*: "create outlines of your Zaps more quickly." n8n's builder is **still Beta** and its docs say you "must review required credentials and other parameters" after generation. Two of the three largest players have had NL authoring in beta for years and neither has made it the default entry point. **That is the finding: it is a permanent assistive draft mode, not a replacement for the editor.**
⚠️ **NOT FOUND: any published acceptance rate, edit rate, or failure-mode analysis for AI-generated workflows, from any vendor.** If someone quotes one, ask for the primary source.

### Lesson 2 — The industry independently converged on Synap's exact governance shape.
Gumloop's design, arrived at from a completely different starting point, is: a **write/delete floor as the default**, **per-tool overrides**, **argument-conditional rules (CEL)**, an **intent line** on the approval card, and a **centralised approval queue**. That is `decideAgentPolicy` + `governance_rules` + the proposal card + the proposals queue, feature for feature. Convergent evolution is the strongest available evidence that the shape is right.

### Lesson 3 — Synap is AHEAD on one specific thing, and should say so.
**Gumloop's reviewer cannot edit the arguments — approve or reject only.** Synap already supports per-item dispositions (partial approval). Relay.app's differentiation is precisely "approve, **edit**, or reject". So editability is a known axis of competition, and Synap already has the capability while Gumloop does not. **Exposing partial approval is a competitive feature, not just hygiene.**

### Lesson 4 — Design the "don't ask again" affordance, because everyone ships it.
Gumloop's approval card has a **"Don't ask again for this tool"** checkbox. This is the same object as a `governanceRules.create`. The lesson from prior art on approval fatigue (93% of permission prompts approved) is that a gate everybody clicks through is not a gate. **The one-click widen-this-lane affordance ON the approval card is the design that prior art validates.** Synap's version is better because widening writes a *rule with lineage* rather than a hidden toggle, and because the floors (delete/admin/scope) can never be widened.

### Lesson 5 — The AI-project base rate says the approval step is the product, not the tax.
89% of agent pilots never reach production; >40% of agentic projects predicted cancelled; 95% of GenAI pilots show no P&L impact. **The bottleneck is trust and data-readiness, not capability.** Every vendor that started autonomous (Lindy, Gumloop) has bolted on HITL. Nobody started with governance and had to remove it.

---

## (e) Anti-patterns — paths prior art says are wrong

**AP1 — "Describe your automation and we'll build it" as the PRIMARY door.** *(Verified, with a nuance.)* Not abandoned — but after 3+ years, both Zapier and n8n keep it in **Beta** and scoped to *drafting an outline that a human then completes*. n8n's docs literally instruct the user to review credentials and parameters afterwards. n8n's own guidance is that accuracy is higher when the AI builds **one component at a time**. **The lesson is scope, not rejection: an AI should propose ONE step or ONE rule change against an existing config, not author a whole flow from a sentence.** ⚠️ Honest correction: I could not find evidence anyone *retired* NL-to-workflow. Do not claim they did.

**AP2 — Fully autonomous agents with no approval step.** *(Verified by unanimous retreat.)* Gumloop added four-mode approval with "ask for writes/deletes" as the **stated default**. Lindy added HITL escalation. Relay.app made HITL the entire pitch. Zapier's agents still route through governed connectors. **Not one vendor is defending unsupervised action on writes.** The base rates (89%/40%/95%) explain why. **Corollary anti-pattern: the approve-or-reject-only gate.** Gumloop's reviewer cannot edit; that turns every imperfect proposal into a rejection and a re-run, which is how approval fatigue starts.

**AP3 — The node graph as the primary surface for non-technical users.** *(Supported, but I must state a correction.)* Zapier — the largest and most consumer-facing — keeps a **linear step list as its default editor** and added the canvas as a *second* surface. That is the revealed preference of the vendor with the most non-technical users. Supporting evidence: **Sticky Note is n8n's #1 node at ~10.5M deployments, 3× the runner-up** — a graph that needs that many hand-written annotations is not self-explaining.
⚠️ **CORRECTION to a claim I expected to make**: Zapier Canvas is **not** diagram-only. It executes, does on-canvas field mapping, and turns plans into Zaps. So "even Zapier's canvas can't run anything" is **false** — do not use it.
**Synap-specific**: this matches the memory-recorded finding that the industry cut *node-graph authoring on phones*, not rule authoring, and that Shortcuts authors at scale with the most closed grammar. **A sentence with typed chips is a form, and a form beats a canvas for the modal 2–4-step flow.**

**AP4 (bonus, well-evidenced) — Metering AI the same as actions.** Zapier in 2026 draws AI steps, code steps, MCP and SDK calls from the same **per-task** pool, with overage at 1.25× and a 3× hard cap. Meanwhile n8n went the other way in April 2026: **unlimited workflows, unlimited users, meter executions only.** An agent that iterates is economically punished under Zapier's model. **Do not meter reasoning as if it were an outbound API call.**

**AP5 (bonus) — Shipping a "data store" that is a cookie jar.** Make's 1 MB/10 MB stores are the anti-pattern of conceding a gap without closing it: it satisfies the roadmap and not the user, and it hands the "actually you still need Airtable" objection to every competitor.

---

## (f) Five to ten shippable marketplace templates

Format: **trigger → steps → entity kinds assumed → why a pod wins (and where it does not).**
The honest filter applied: **anything whose trigger is external gets no pod advantage on the trigger** — the advantage is always downstream, in the typed target, the accumulated history, and the governed change.

### 1. Inbound person → identity resolution → facet attach → owner briefing
- **Trigger**: inbound email / form / calendar invite from an unrecognised address (external — no pod advantage here).
- **Steps**: `IdentityResolutionService` strong-signal match (email/phone/url) → if matched, propose `attach_facet` for the new role (`prospect`, `client`) on the EXISTING entity; if unmatched, propose `create_entity` → link to the originating `channel`/`document` → post a briefing to the owner's channel with the entity's prior history.
- **Kinds**: `person`, role-facets, `channel`, `document`, `link`.
- **Why the pod wins**: this is *exactly* the operation n8n cannot do. On n8n, "is this a new person?" is a Google Sheets lookup on an email string, and the answer is a row. Here it is a governed identity decision over strong-signal atoms, and the output is a role attached to a real entity with cascade semantics. **The 26:1 spreadsheet ratio is this use case being done badly, 1.3M times.**
- **Where it does NOT win**: inbox connectivity. Gmail/Outlook ingestion is table stakes Synap must build and n8n already has.

### 2. Stalled-object sweep → proposal, not a nag
- **Trigger**: cron (fully pod-native).
- **Steps**: query entities of kind K where `status` unchanged for N days AND no linked `session` closed in that window → for each, open a `proposal` with the object-action title and the evidence → route to the owner's queue.
- **Kinds**: any kind with a lifecycle status; `session`, `proposal`.
- **Why the pod wins**: "has nothing happened here" requires joining an object's state to its *activity history*. n8n has neither; the workaround is a `last_touched` column a human must remember to update. Synap derives it. And the output is a reviewable proposal with lineage, not a Slack message that gets ignored.
- **Honest note**: this is the single highest-value pod-native template and it needs **zero connectors**. Ship it first.

### 3. Weekly review digest assembled from the graph
- **Trigger**: cron Friday.
- **Steps**: gather `session`s closed this week (kind=`work`), the `proposal`s approved/rejected, the `entity` rows created, the automations that fired → compose a document → attach as a session output → publish to a channel.
- **Kinds**: `session`, `proposal`, `run`, `document`, `artifact`, `channel`.
- **Why the pod wins**: shape #5 (digest) is one of the ten most common flows, and on n8n it means N API calls to N SaaS tools, each with an auth token that will expire. Here it is one query. **Pain #3 (auth rot) is structurally absent.**
- **Where it does NOT win**: if the user's week actually happened in Jira and Linear, the pod's digest is empty. This template's value is proportional to how much of the user's work already lives in the pod — which is the honest limit on the whole thesis.

### 4. Governed enrichment run over a kind
- **Trigger**: manual/playbook launch over a selected set, or on `entity.created` for kind K.
- **Steps**: for each entity, call an enrichment `capability` → diff proposed field values against current → emit ONE proposal carrying per-field dispositions → on approval, apply.
- **Kinds**: any; `capability`, `proposal`, `run`.
- **Why the pod wins**: **this is the partial-approval story made concrete.** n8n's version writes 200 rows and you find out later it was wrong; Gumloop's version is approve-or-reject on each. Synap can present 200 changes as one reviewable batch with per-item accept/reject, and record the lineage. That is a demo no competitor can currently reproduce.
- **Where it does NOT win**: the enrichment provider is someone else's API. Connector parity applies.

### 5. Meeting → entities → follow-ups
- **Trigger**: calendar event ends / transcript document lands (external).
- **Steps**: extract mentioned people/companies/commitments → resolve identity per (1) → propose `task` entities with owners and dates → link every one to the source `document` with a provenance edge → open a `session` for the follow-up block.
- **Kinds**: `person`, `company`, `task`, `document`, `session`, `link`.
- **Why the pod wins**: provenance. Every created object points back at the sentence that caused it. On n8n the output is a row in a sheet with no back-link, which is why nobody trusts it. **Trust is the 89%-of-pilots-fail problem, and provenance is the answer to it.**

### 6. Automation health warden (the meta-template)
- **Trigger**: cron + `run.failed` events.
- **Steps**: scan `run`s for failures, silent no-ops (fired but changed nothing), and automations with zero fires since creation → propose a disable/repair with the failing evidence attached.
- **Kinds**: `automation`, `run`, `proposal`.
- **Why the pod wins**: **this attacks recurring pain #1 head-on, and it is only possible because automations are ENTITIES.** n8n cannot ship this — a workflow is not an object its own workflows can query. Synap's automations are stored config in the same graph, so an automation can supervise automations.
- **Strategic note**: ship this as the flagship. It is the clearest thing the incumbents structurally cannot copy, and it is the pain users are angriest about.

### 7. Capability-drift / template convergence watch
- **Trigger**: cron after a marketplace package update.
- **Steps**: compare installed containers against their template version → list what drifted → propose the reconcile with a per-field diff → human approves.
- **Kinds**: `capability`, `package`, `proposal`.
- **Why the pod wins**: this is pain #2 (versioning/rollback) and pain #4 (upstream drift) in one, and Synap already has the comparator + version machinery. n8n's answer is issue #26707, still un-triaged.
- **Honest note**: this is an infrastructure template, not a customer-facing one. Ship it for the dogfood story, not the marketplace front page.

### 8. Approval-lane widening scorecard
- **Trigger**: daily cron.
- **Steps**: score agent proposal outcomes (weighted by *interaction*, not bare status) → for agents past the gate, open a `governance.widen_lane` proposal → on approval insert a `governance_rule` with `source_proposal_id`.
- **Kinds**: `agent`, `proposal`, `governance_rule`.
- **Why the pod wins**: this is the productised answer to Gumloop's "Don't ask again" checkbox — same job, but as an earned, reviewable, revocable rule with lineage and hard floors, instead of a hidden per-tool toggle. **Prior art validates the need; Synap's version is strictly better-shaped.**

### 9. Digest-to-decision loop (channel-native)
- **Trigger**: cron or threshold on a `signal`.
- **Steps**: assemble the N items needing a decision → post ONE message with inline approve/defer per item → each disposition writes back to the underlying object.
- **Kinds**: `channel`, `proposal`, `signal`.
- **Why the pod wins**: shape #10 (approval gate) is the shape every AI-native vendor is racing to own, and the pod already models the queue, the item, and the write-back. **Where it does NOT win**: getting this into Slack/Teams is a connector problem, and that is the incumbents' home turf.

### 10. Cross-workspace duplicate/hygiene sweep
- **Trigger**: cron.
- **Steps**: strong-signal match across the graph → propose merges with a side-by-side diff → apply on approval.
- **Kinds**: any; `proposal`.
- **Why the pod wins**: dedup across a typed graph beats dedup across a spreadsheet, and the prior-art note in memory (six scattered dedup implementations, all wrong) says the one-door `IdentityResolutionService` version is genuinely hard to reproduce.
- **Where it does NOT win**: Airtable and HubSpot both ship dedup. This is parity, not advantage — ship it because its absence is conspicuous, not because it sells.

### Ranking for the marketplace front page
**#6 (automation health warden) → #2 (stalled sweep) → #1 (identity+facet) → #4 (governed enrichment) → #5 (meeting→entities).**
Rationale: the first two need **zero connectors** and attack the #1 and #2 recurring pains. They are demonstrable on day one against a pod with data in it, and no incumbent can copy them without owning the customer's data model.

---

## Appendix — what I could NOT verify (do not let these be quoted as measured)
- Measured share of 2-step vs multi-step automations, on any platform. **NOT FOUND.**
- Any vendor-published acceptance rate / edit rate / failure taxonomy for AI-generated workflows. **NOT FOUND.**
- Runtime (as opposed to template-derived) node usage distribution. **NOT FOUND** — n8n Pulse is template-weighted.
- Zapier Central's exact fate: the FAQ uses "Central" and "Zapier Agents" interchangeably and an internal Slack channel is named `#product-central-ai-assistants`. **Strongly suggests a rename, but no dated announcement found. Do not assert a sunset.**
- Whether any vendor retired NL-to-workflow. **No evidence of retirement — both major ones are still shipping it, still in Beta.**
- n8n category-level template counts (the site shows categories without counts; total was 12,125 at fetch time, vs a secondary source's 11,741 for Aug 2026 — the totals move weekly, so cite with a date).
- The Deloitte/Gartner/MIT figures are **secondary citations of paywalled reports**; directional only.

---
# ADDENDUM (requested by team-lead)

## A1 — The connector concession, with the arithmetic

### Raw counts (verified)
| Platform | Integrations | Counting method |
|---|---|---|
| Zapier | **9,000+** (Jun 2026) | counts **each trigger/action variation separately** — an app with 5 triggers + 10 actions = 15 "integrations" |
| Make | **~1,500–2,000** | per app |
| n8n | **1,000+** | **per app** (one node regardless of operation count) |
| **Synap** | **NOT VERIFIED — I did not count the installed capability/tool estate.** Do not quote a number until someone greps it. | — |

Sources: https://automationatlas.io/guides/zapier-vs-n8n-2026-comparison/ , https://vps.us/blog/how-many-n8n-integrations/ , https://tech-insider.org/n8n-vs-zapier-2026/
**First correction to the raw gap**: 9,000 vs 1,000 is not a 9× capability gap; the units differ. Normalise Zapier to apps and the gap narrows materially. Nobody publishes Zapier's app count separate from its operation count. **NOT FOUND.**

### The question that actually matters: how head-heavy is usage?
Computed from the n8n Pulse category breakdown (https://n8n-pulse.gui.do/nodes/), **counting only third-party app connectors** — core nodes (Sticky Note, HTTP Request, Set, Code, If, Wait, Merge, triggers, AI model nodes) excluded, because those are not integrations.

**Top 20 connectors by estimated deployments:**
Google Sheets 1.30M · Telegram 753.1K · Google Drive 474.5K · Gmail 440.0K · WhatsApp Business Cloud 260.1K · Telegram Trigger 188.5K · Airtable 134.3K · Facebook Graph API 125.7K · Slack 101.9K · Google Docs 82.3K · Notion 78.7K · Google Drive Trigger 78.1K · RSS Feed Read 67.7K · Google Calendar 66.6K · X (Twitter) 61.2K · Postgres 56.9K · Redis 55.8K · Supabase 48.4K · GitHub 48.3K · WordPress 38.8K
**Sum ≈ 4.46M deployments.**

**Every other connector visible in the source, summed ≈ 0.12M.** That includes the entire CRM, Productivity, E-Commerce, Marketing, CMS and Developer-Tools long tail.

**Answer: the top 20 connectors account for ~90% of connector usage.**
Honest band and method: the source publishes a global top-10 plus a **top-5 per category**, so ranks 6+ inside the larger categories are hidden. Worst-case bound (assume every hidden node sits at its category's rank-5 value): top-20 share floors at **~65%**. Best-case (tail decays as the visible tail does): **~97%**. The visible distribution is a clean power law, so **~90% is the defensible figure, with the band stated.** ⚠️ Template-weighted, not runtime. This is an estimate with a disclosed method, not a measured statistic.

### The number that settles it better than the percentage
- **The entire CRM & Sales category tops out at HubSpot ~17.6K — 74× below Google Sheets.** Salesforce ~7.3K. Pipedrive ~5.8K. Zoho ~1.5K.
- **The entire Marketing category tops out at Mautic ~3.4K.** ActiveCampaign ~73. Customer.io ~52. ConvertKit ~51.
- **LinkedIn: 100. Bitbucket Trigger: 100. Contentful: 30. Read PDF: 6.**

**Those are the 8,000 connectors Zapier has and Synap does not. They are statistically dead.** The connectors that carry real usage are: a spreadsheet, a chat app, a file store, an inbox, a calendar, a social API, a database, a code host, a CMS. That is **a two-digit list, not a four-digit one.**

### So the concession, stated precisely
**"We ship ~400–1,000 fewer integrations" is true and nearly irrelevant. "We cannot serve the common case" would be false — IF Synap covers roughly: Gmail/Outlook, Google Sheets, Google Drive, Google Calendar, Slack, Telegram/WhatsApp, Notion, Airtable, a webhook, and a generic HTTP door.** That is ~10 connectors plus an escape hatch, and it covers the head of the distribution.

Two caveats that keep this honest:
1. **The escape hatch is doing enormous work in n8n**: HTTP Request is the **#2 node overall at ~3.5M**, above every named connector. A generic authenticated HTTP capability is not a consolation prize — in the corpus it is the most-used integration there is. **If Synap ships one good generic HTTP door, it buys more coverage than 500 named connectors.**
2. **Breadth is a sales objection, not a usage problem.** The buyer compares 9,000 to your number on a feature grid before ever running a flow. The arithmetic above wins the *technical* argument and loses the *procurement* one. Plan the answer for the grid separately from the answer for the user.

---

## A2 — THE VERDICT, sharpened and moved to the front

> ### The briefed hypothesis was REJECTED.
> The brief proposed: *"automation over your own accumulated graph"* as the differentiated axis. **On the evidence, that framing is a rationalisation and should not be used.** It loses on contact with two facts: **(1)** all three incumbents have already shipped a state primitive — n8n Data Tables, Zapier Tables, Make Data Stores — so "we're the stateful one" has an immediate incumbent reply; and **(2)** nobody resents the bolt-on. Users do not file angry forum posts about Airtable; they like Airtable. **A gap nobody is angry about is not a wedge.**
>
> ### What replaces it
> **Not "automation over your own data." Automations whose STATE, HISTORY and GOVERNANCE are first-class objects you own — reviewable, versioned, and safely changeable by an agent.**
>
> ### Why this one survives
> **Because none of the top four recurring pains are about authoring.** Ranked by recurrence: (1) opaque, undebuggable failures; (2) no versioning, rollback, or audit trail; (3) auth/token rot; (4) upstream schema drift. **The market sells building an automation. The pain is owning one.**
> - n8n's oldest unmet request — **GitHub #26707, workflow version control, still pending triage with no assignee and no official response** — is something Synap has as a *by-product* of proposal lineage. Windmill's entire market position is "versioned in Git, tested like real software." A pain a competitor is built around is a confirmed pain.
> - On n8n a failed run is a JSON payload in a log. On a pod a run is a **session against entities**, so "what did this change" is a graph query, not payload archaeology.
> - Pains #3 and #4 are structurally absent for flows whose endpoints are internal.
>
> ### The distinction that makes it hold
> State is not one thing, and the incumbents only closed the first kind:
> - **Working state** — a counter, a cursor, a dedupe key. n8n/Zapier/Make now handle this adequately. **Concede it. Synap wins nothing here.**
> - **Accumulated, typed, cross-run state that is ALSO the subject of the automation** — a `deal` whose stage moved, a `person` who gained a `client` facet, a `session` that closed with three outputs. No incumbent has this and **none can retrofit it**, because their data model is "rows in a side table", not "the domain". Giving it to you would require them to own your data model — exactly what their customers refuse.
>
> ### The concession that must ship alongside it
> **Synap owns the destination, not the trigger.** Almost every valuable automation starts outside the pod. **Inbound event ingestion is a prerequisite, not a differentiator** — without it, a pod-native automation platform is a cron over a database, which is a feature of every database.

*(The Sheets-vs-Postgres numbers are supporting evidence for the diagnosis, not the positioning. Lead with the verdict; the 26:1 is the footnote that explains why the naive framing was tempting.)*

---

## A3 — The two zero-connector templates, specified

### Template #6 — Automation Health Warden (the flagship)

**Why it is a category difference, not a feature gap:** in n8n a workflow is a JSON document in an editor. It is not an object that another workflow can query. **n8n cannot ship this without re-architecting workflows into first-class records.** In Synap automations, playbooks, runs and proposals are already entities in the same graph, so an automation can supervise automations. This is the first thing in the research that no incumbent can copy.

**What it watches (four finding-shapes, each independently detectable today):**
1. **Silent failure** — runs terminating in error, *including the mid-stream-death case where `finishReason` still reads "stop"*. (Memory records this exact defect: a failure scored as a success blinds the health check built to catch it. The warden must not inherit that blindness — it should assert on *observed effects*, not on the reported terminal status.)
2. **Silent no-op** — the automation fired, completed "successfully", and **changed nothing**. This is the class that produced three no-ops in one template and 40 runs that never reached the AI step. Detectable as: run completed ∧ zero writes attributable to the run.
3. **Zero-run automation** — enabled, non-draft, and **never fired since creation**. This catches the whole "built with zero producers" class: a trigger advertised in the authoring grammar that no producer ever emits, or a `.requested` rule where only `.completed` is hardcoded downstream.
4. **Orphaned trigger** — the trigger's subject no longer matches anything: the profile/kind was retired or converted to a facet, the referenced view or capability was deleted, the WHERE clause compiles to `undefined` (which **silently widens** the rule rather than failing).
5. **Schedule drift** — a cron whose actual fire interval diverges from its declared one, or which has been firing against an empty workspace (the recorded case: a hygiene cron running daily against an empty workspace since a duplicate install).

**What it proposes:** never "here is a log". Always a **disposition with the evidence attached** — disable, repair the trigger binding, re-point at the surviving workspace, or narrow a widened WHERE clause — with the failing runs linked as provenance.

**What it needs from the graph, all of which exists:** `automation` / `playbook` as entities · `run` + `session` (kind `run`) with the work/run/receipt partition · the events spine · `proposal` with `source_proposal_id` lineage · `links` for run→subject provenance.

**Gap to close first (be honest):** finding-shapes 1 and 2 depend on run records being *truthful*. The recorded defect — a mid-stream death logged as success — means **the warden would currently under-report exactly the failures it exists to catch.** Fix the run-outcome producer before shipping the warden, or the warden becomes another self-certifying stamp.

### Template #2 — Stalled-Object Sweep

- **Trigger**: cron. Zero connectors.
- **Detection**: entities of kind K whose `status` has not changed for N days **AND** which have no `session` closed against them in that window **AND** no pending proposal already awaiting a human. The third clause is what stops it re-nagging about something already queued.
- **Proposal**: one grouped proposal per *reason*, carrying the stalled objects as per-item dispositions (advance / defer with a date / close as dead / reassign).
- **Kinds**: any kind with a lifecycle status; `session`, `proposal`, `link`.
- **Why the pod wins**: "has nothing happened here" is a join of an object's state to its *activity history*. n8n has neither side — the workaround is a `last_touched` column a human must remember to update, which is the failure mode it was meant to prevent. Synap derives it.
- **Why it ships now**: **zero connectors, and its value is proportional to data already in the pod.** It is demonstrable on day one.

### Queue design — applying the sibling dive's acceptance-rate finding

Given only two publicly verifiable acceptance rates exist (**Copilot ~30%, Gmail Smart Reply ~12%**), **70–88% ignored is the normal operating regime, not a failure.** Design consequences:

1. **Group by finding-shape, never one proposal per finding.** The measured collapse of 304 pending items into 9 fingerprints is the target ratio. A warden that files per-finding turns a 200-object sweep into a dead queue on day one. **One proposal per fingerprint, with per-item dispositions inside it** — which also plays to the partial-approval capability Gumloop lacks.
2. **Rank by blast radius, not by recency.** With ~80% ignored, the ordering *is* the product. The top item must be the one whose non-review is most expensive.
3. **Cap the warden's own footprint.** It is a meta-producer; it must never be able to saturate the queue it is diagnosing.

### Breaking the `recommend-tighten` circularity

**The defect, restated:** the rejection-feedback loop (≥5 rejects of a motif at ≥90% reject rate → file a lane-narrowing proposal) emits **a proposal that itself needs approval**. On a saturated queue it never gets read, so the mechanism that unsaturates the queue is disabled precisely when it is needed. It is a governor wired downstream of the thing it governs.

**My opinion: break it on the asymmetry between widening and narrowing.**

> **Widening a lane requires human approval. Narrowing a lane does not.**

Rationale: the two are not symmetric risks. Widening increases what an agent may do unattended — it must be a human decision, and Synap already gates it correctly with `governance.widen_lane` + lineage. **Narrowing is monotonically safety-increasing.** Its worst case is that an agent now asks permission for something it previously did unattended — which is inconvenient, never dangerous, and is *already* the system's default posture for anything unrecognised. Requiring approval to become safer is a category error, and it is the reason the loop deadlocks.

**Concrete shape:**
- `recommend-tighten` **applies** the narrowing rule directly, with `source: 'auto_tighten'` and full lineage (the ≥5 rejected proposals as evidence).
- It emits a **notice, not a proposal** — "this lane narrowed itself because you rejected 5 of these at 90%+; here is what changed, here is undo."
- **Undo is one click and requires no approval** either, because reverting to the *previous* lane width is not a widening beyond what a human already sanctioned.
- The existing floors are untouched: auto-tightening can never widen anything, so it cannot reach the 2/2.1/2.5/2.6 floors, and the rung-2.8 placement already guarantees it cannot auto-approve a delete/admin/scope change.
- **Tripwire to add**: assert that the auto-tighten path can only ever produce a rule strictly narrower than the one it replaces — i.e. it can emit `propose` where `auto` stood, never the reverse. That single invariant is what makes skipping approval safe, and it is mechanically checkable.

This also generalises: **any governance mutation that strictly reduces agent authority should be self-applying with an undo.** Only expansions of authority need a human. Right now both cost the same approval, which prices safety and risk identically — and on a saturated queue, that means safety loses.
