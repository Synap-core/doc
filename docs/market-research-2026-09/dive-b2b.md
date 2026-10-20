# Dive B2B — SMB / agency ops, client portals, and what Synap could replace with configuration

Read-only market research, 2026-09-06. **Deliverable first; the cited evidence appendix follows.**
Legend: **[V]** verified against a cited source · **[V-vendor]** verified but the source sells the thing · **[I]** my inference · **[NF]** looked for, not found.

---

## (a) The landscape, and who is closest to Synap

Four families, and they do not compete on the same axis:

| Family | Players | Data model | Automation ceiling | What forces teams off |
|---|---|---|---|---|
| Flexible tables | Airtable, SmartSuite, Baserow, NocoDB, Teable | Tables + links, per-base limits | Good within one base; breaks across bases | **Cost of external access**, record ceilings, "it became a database nobody owns" |
| Docs-as-database | Notion, Coda | Blocks + inline DBs | Weak; no invoicing/time/e-sign at all | Structure decays; no operational verbs |
| Work OS | monday, ClickUp, Asana | Rigid board/task | Recipe-style, per-board | Seat minimums, price rises, conceptual-model onboarding cost |
| Graph CRM | **Attio, Folk** | **Typed objects + relationships, self-serve custom schema** | Real workflow engine (Attio), deliberately thin (Folk) | Attio: learning curve + credit-metered AI. Folk: refuses depth by design |

**Closest to Synap: Attio.** It is the only commercial product shipping "define your own objects and relationships, no professional-services fee" as the headline. Pricing: Free ≤3 seats, **Plus $29/seat/mo, Pro $69/seat/mo** annual. **[V]** Its documented weaknesses map exactly onto Synap's stated strengths — fewer native integrations, reporting/automation gated to higher tiers, and enrichment/AI moved to a **monthly credit system** in 2026 so the per-seat sticker is no longer the whole cost.

**Folk is the more instructive one, because of what it refuses.** Folk "deliberately avoids the deep customization and reporting that data-hungry teams eventually want." **[V]** It is a *product decision* to stay a fast contact-capture surface. Comparisons of the two land on the same closing sentence about both: *"someone still has to put the data in."* **[V]**

> **[I] The strategic read.** Attio proved the typed-entity model sells; Folk proved that schema depth is not what small teams buy. Neither solves capture, and neither has a serious answer for the external party. Synap's differentiators against Attio are not "more configurable" — they are (1) **role-facets** (one entity, many hats), which Attio has no primitive for; (2) **the AI write-governance layer**, which is the answer to "someone has to put the data in"; and (3) **the project lens with real external membership**, which is where the actual money is (see (c)).
>
> **What Synap must NOT differentiate on: being a cheaper flexible table.** Baserow is MIT-licensed and self-hosts free with unlimited rows, users and storage. **[V]** That floor is zero.

---

## (b) What these teams automate, what they do by hand, and what blocks the rest

**Automated in practice** (well-served by Zapier/Make/native recipes): lead form → CRM row; e-sign completion → folder creation; calendar booking → reminder; recurring report *delivery*.

**Done by hand despite obvious automatability** — the interesting set:
- **Client onboarding checklists.** Named "mostly manual at a majority of agencies" in the insurance vertical alongside renewal pipeline and certificate issuance. **[V]**
- **Proposal → contract → invoice.** *"Neither Notion nor Airtable have invoicing, time tracking, contract signing, proposal creation, or other features necessary to run an entire client workflow from one place."* **[V]** So the chain is hand-carried across 3–4 tools.
- **Recurring client reporting.** Automatable in principle; SoDA's 2025 report puts reporting/proposal/onboarding automation at **12–18 recovered billable hours per employee per month** — implying it is largely *not* automated today. **[V-vendor-adjacent]**
- **Invoice chasing and renewal/deadline reminders.** Require a *state machine over a relationship* (who owes what, since when, escalating), not a trigger over a row.

**What blocks them — three named causes, in order of evidence strength:**

1. **The work spans tools that do not share an object.** This is the dominant blocker and it is *not* duplication — it is genuine capability gaps between products. The proposal lives in one tool, the signature in another, the invoice in a third. Nothing automates across a seam where no shared identity exists.
2. **Setup requires someone to learn a conceptual model first.** *"Most teams abandon project management software within three months… the problem is the model rather than the features. Before teams can track a single real task, someone has to understand the tool's conceptual model well enough to set it up correctly, usually a team lead already overextended."* **[V]** Automation is the *second* thing you configure; most teams churn before the first.
3. **Scale of the prize is real but the per-task ROI is small.** MarketingProfs (n=713): **63% of data-related work time** goes to partially/fully automatable tasks **[V]**. Agency Management Institute 2024 benchmark: **22–31% of staff time on non-billable admin without automation vs 11–16% with** **[V]**. The aggregate is huge; each individual automation saves 20 minutes a week, which is below most people's activation energy.

> **[I] The actionable conclusion.** The unautomated work is unautomated because the *entity is missing*, not because the trigger is missing. Synap's advantage is that a proposal, an invoice, a client, and a deadline can all be entities in one graph — so "chase every invoice >30 days on a project whose client-facet is in renewal" is expressible. That is the demo. Do **not** pitch "we have automations too."

---

## (c) The client-portal verdict

**Is it a real, paid-for need? Yes — but what is being bought is not a portal.**

Three things are verifiably true at once:

1. **Agencies pay real money for external client access.** Purpose-built portals: SuiteDash $19/$49/$99 per month **flat, unlimited client users, white-label on every plan**; Copilot $39–89/mo entry, Professional $189/mo (+$39/user past 3), full white-label at Advanced **$399/mo**; Service Provider Pro rebranded to Wayfront for productized shops. **[V]**
2. **The general-purpose tools tax it brutally.** Airtable's external access is a **paid Portals add-on** at ~$120–150/mo for 15 guests; an agency with ~50 client portals runs **$4,800–6,000/yr on top of** the base subscription, and for 30 edit-access clients the add-on **"can rival or exceed the cost of the underlying plan itself."** **[V]** This is the clearest commercial gap Synap's per-project membership walks into.
3. **The stated reasons agencies buy are: fewer status-update emails, faster approvals, and "higher perceived professionalism."** Vendors tie the third directly to retention and referrals — *"a branded portal signals that you run a real operation, not a one-person show working out of a Gmail inbox."* Claimed saving 8–12 hrs/week on status updates. **[V-vendor — every figure here is vendor-published; treat as positioning, not measurement.]**

**[NF]** No neutral study of portal abandonment or client login rates exists that I could find; forum-level discourse (r/agency, r/smallbusiness) would not surface through the available search tooling this session. The nearest analogue — enterprise Copilot adoption decaying 70–80% (week 1) → 40–50% (week 4) → **25–35% (month 3)** **[V]** — suggests optional destinations off the critical path settle near a third of licensed users. **[I] Shape-of-curve analogy only; do not quote it as a portal statistic.**

### Which principal model does prior art endorse?

**Unanimously: a distinct external principal pinned to specific resources, excluded from the org's grouping primitives, and not billed as a seat.**

- **GitHub**: an outside collaborator *"is not a member of your organization, but has access to one or more of your organization's repositories,"* with per-repo access level. The hard rule: **"Outside collaborators cannot be added to a team; team membership is restricted to members of the organization."** **[V]**
- **Slack**: the difference between a *guest* and *Slack Connect* is explicitly **who pays and where the person lives**. Guests get limited access to your workspace and **you pay for their account**; Connect lets the external org stay **in their own workspace** with **unlimited shared channels at no cost**. Slack's own guidance points clients/vendors/partners at Connect. **[V]**
- **Basecamp**: charges **only for internal people — guests and clients do not count toward billing.** Plus $15/user/mo; **Pro Unlimited flat $299/mo** regardless of team size. **[V]**

### The most important finding in this dive: Basecamp already tried the separate-client-zone model and walked it back

Basecamp 3 originally shipped **"Clientside" — an entirely separate part of a project where all client-facing communication lived.** 37signals' own retrospective: *"while it made conceptual sense, it was **inflexible and not collaborative enough**, working well for some but missing the mark for many."* The replacement rule is **everything private by default; you expressly grant the client permission to see specific things — private work and shared work in the SAME project.** **[V]** And Basecamp 4's current help doc goes one step further: clients **never create an ID or password and never log in at all** — updates go out by email, clients reply by email, and the reply lands in the project record. **[V]**

> **Verdict for Synap.**
> - ✅ **Free/flat external members** — never a seat. The entire market has priced them at zero marginal cost; Airtable is the outlier and it is the one people quote as painful.
> - ✅ **A distinct principal type** (`client-collaborator`), not "an internal member with narrow permissions". Excluded from workspace-level groupings by construction, exactly like a GitHub outside collaborator.
> - ⚠️ **"Give the client their own project" is the model Basecamp abandoned.** A whole project is too coarse and too separate. Prior art endorses **per-item visibility inside one shared project, private by default.** If Synap's per-project membership grants a client an entire project wholesale, it is re-implementing Clientside v1.
> - 🔴 **Do not build a destination.** Build the record, and make **email the client's default surface** — notification out, reply in, threaded onto the entity. The portal is the *fallback* view for the client who wants it, not the mechanism. This is the difference between Basecamp's model and the 25–35% decay curve.

---

## (d) Is "no duplication" a top-three pain, or a founder's hypothesis?

**Mostly a founder's hypothesis — but a very close cousin of it is real and measured.**

What is verified:
- **88% of SMB leaders feel overwhelmed by too many business tools** (Salesforce SMB Trends, confirmed on their own page). **[V]**
- Salesforce's own top-challenge line on that page is **"46% say keeping pace with technology is their top challenge"**; 75% feel behind competitors on tech. The page as published **does not rank duplication or silos above cost, hiring, or growth.** **[V]**
- The widely-repeated *"more than half of SMB leaders deal with frequent data inconsistencies caused by silos"* is attributed to the same research but **I could not confirm it on Salesforce's own page.** **[V-secondary — flag it if you quote it.]**
- Volume context: ~9 cloud tools per SMB; +15–20 SaaS apps/yr vs −5–8 retired; **51% of purchased licenses unused**. **[V]**

What cuts against the duplication thesis:
- The professional-services stack is **not** duplication. *"Neither Notion nor Airtable have invoicing, time tracking, contract signing, or proposal creation."* **[V]** Those are four genuinely different capabilities. The client record appearing in the CRM and again in the invoicing tool is a *symptom* of that, not the disease.
- The observed churn reasons are **cost** (monday's 3-seat minimum then buckets of 5 — a team of six pays for ten; +18% price rise Feb 2026) **[V]** and **the conceptual-model setup cost** (abandonment within three months) **[V]**. Duplication does not appear in either.

> **[I] Honest ranking of what SMBs actually feel, best-evidence order:** (1) cost per seat and pricing-floor games, (2) "I have to understand your model before I get value", (3) tool overload / context switching, (4) **data inconsistency across tools**, (5) explicit duplicate data entry.
>
> **Positioning consequence:** "no duplication via one graph with facets" is a *mechanism*, and users do not buy mechanisms. It is the fourth-order pain. The saleable framing of the same fact is **"one client record that your proposal, your project, your invoice and your client's own view all read from"** — which is felt as *tool overload* and *inconsistency*, the pains that do rank. Lead with overload, deliver via the graph.

---

## (e) Best-fit verticals

Screening criterion the founder named: **a long tail of near-identical-but-not-identical process** over a **stable entity model** with **bad tooling**. Three qualify, ranked.

### 1. Boutique recruiting / staffing agencies (3–15 recruiters) — the strongest fit
- **Explicitly underserved**: *"Bullhorn was built for large staffing firms — 50+ recruiters… you're paying Bullhorn prices for a system designed at 10x your scale."* Complaint verbatim: *"doesn't bill you **$150 per seat per month** for a system you're mostly using as an expensive shared spreadsheet."* **[V]**
- **The need is literally the facet model**: *"handle two-sided relationships: candidates on one side, client companies on the other."* **[V]** A person is a candidate at one client and a hiring manager at another — the same human, two hats. This is the one vertical where Synap's role-facet primitive is not a nicety but the requirement, and where every incumbent forces two records.
- **The client surface is already the demand**: *"lets you share shortlists with clients cleanly."* **[V]** A shortlist is a scoped, per-project, client-visible view — exactly what per-project membership produces.
- Long tail: fee structures, **split placements between consultants**, contract vs perm, timesheets. Near-identical, never identical.

### 2. Grant-funded nonprofits and small foundations — the strongest *shape-mismatch* evidence
- **Salesforce NPSP has no native Grant object.** The sector's dominant system of record makes you model a grant as an **Opportunity with custom record types** — i.e. as a sales deal. **[V]**
- NPSP "remains supported but is no longer receiving new features"; grants/volunteer/program tracking need customisation or paid add-ons; **outcome reporting is manual**. **[V]**
- Cost of entry: implementation **$5,000 basic to $50,000+ complex**; orgs that treat the 10 free licenses as free Salesforce and skip implementation "rarely get value." **[V]**
- Trajectory: *"a donor spreadsheet that works at 500 contacts and breaks at 5,000."* **[V]**
- Long tail: **every funder wants a near-identical-but-not-identical report.** That is the definitional case for configuration over code. Plus a natural external principal — the **funder/programme officer** given exactly one project.

### 3. Independent consultancies and productized service shops
- The stack gap is documented and expensive: Notion + Airtable + separate invoicing/time/e-sign, wired together by consultants at **$5,000–$25,000**. **[V]**
- Entity model is stable and small: client, engagement/SOW, deliverable, invoice, person.
- The whole category already pays for external client access (SuiteDash/Copilot/Wayfront exist because of it).
- **[I] Weaker than the first two** because the incumbents are adequate and the differentiator is consolidation, not modelling.

### Explicitly deprioritise
- **MSPs.** Well served at both ends; entity model (client/site/asset/ticket/contract) is rigid *because it is genuinely standardised*, and flat-rate options (Syncro, Atera) already serve <10-tech shops. **[V]** Rigidity here matches a real standard — a configurable graph has no edge.
- **Research labs / core facilities.** The named breaking point is **reconciliation with grants-management and general-ledger systems** — an integration problem into finance systems Synap does not touch, not a modelling problem. **[V]**
- **Real estate.** **[NF]** — not researched to a conclusion in this dive; do not assume.

---

## (f) Anti-patterns — paths prior art says are wrong

**1. Ship a marketplace of templates as the front door. ❌ VERIFIED WRONG — the category leader just reversed on this.**
Since its AI-native relaunch in July 2025, **Airtable's onboarding centres on Omni and there is no template gallery to browse**: you describe what you want to track and it builds a working base with data, automations and interfaces. Airtable's own page: *"creates production-ready apps with data, automations, and interfaces… Everything Omni creates is fully editable."* Building is **free**; only analysis questions cost credits. **[V]** The articulated principle: **"editing is a much easier cognitive task than choosing."** Notion's variant is the same direction — don't show the gallery, preload from signup answers, surface ~5 personalised picks. **[V]**
> **For Synap:** the package substrate is right, the *catalogue as entry point* is the thing that was abandoned. The front door should be *"describe your business → a generated, editable workspace,"* with packages as the artifact underneath. A marketplace of 24 packages is the choosing problem Airtable spent a relaunch escaping.

**2. Per-project permission schemes. ❌ VERIFIED WRONG at scheme granularity; right at membership granularity.**
Documented Jira environments run **>50 permission roles for ~250 people** — practitioners call it "significantly off"; permission complexity "runs out of control over time"; and **too many permission schemes is a named source of Jira performance problems.** Counter-evidence: far larger orgs operate on **5–15 roles and fewer than 10 schemes total**, reused. Atlassian's structural answer is that **Project Admins manage users and roles within a project** so they self-serve without a global-admin bottleneck. **[V]**
> **For Synap:** ship a **small closed set of project roles** (owner / member / client-collaborator / client-viewer) reused across every project, with project owners assigning people. **Never a per-project ACL editor.** Membership per project = good. Schemes per project = the documented failure.

**3. Compete with entrenched CRMs on features. ❌ VERIFIED WRONG.**
*"Most CRMs sold today are horizontal… when a bloated, one-size-fits-all CRM is implemented, diligently-crafted processes get disrupted."* There are a few horizontal CRM companies and **thousands of vertical CRMs**; vertical ones win on precise terminology and industry workflow. SaaStr's advice is blunt: at $1–2M ARR in one vertical, **don't expand verticals — it dilutes.** Veeva IPO'd without ever leaving Pharma. **[V]**
> **For Synap:** the configurable graph is the *engine*; the go-to-market is **one vertical's vocabulary**, shipped as a package. Recruiting or grants, not "flexible CRM."

**4. Give the client their own separate space. ❌ VERIFIED WRONG — see (c).** Basecamp built exactly this ("Clientside"), found it *"inflexible and not collaborative enough,"* and replaced it with per-item visibility inside the shared project. **[V]**

**5. Bill external members as seats. ❌ VERIFIED WRONG by market consensus.** Basecamp: guests don't count toward billing. Slack Connect: unlimited external channels at no cost. SuiteDash: flat fee, unlimited client users. Airtable, the one that charges, is the one being quoted at $4.8–6k/yr in add-ons. **[V]**

**6. [I] Assume schema power drives adoption.** Both Attio and Folk comparisons close on *"someone still has to put the data in."* **[V]** A better schema does not fill itself. The governed-AI-write layer is the answer to this and should be positioned as the *capture* story, not as an AI feature.

---

## (g) Ten shippable B2B use-case packages

Each: entity kinds → facets → automations → client surface → what it replaces → today's cost.
Ranked; **1–3 are the ones I would build.** Cost figures cite the evidence appendix.

### 1. Boutique Recruiting Desk ⭐ best fit
- **Kinds**: `person`, `company`, `role` (the open req), `submission`, `placement`, `interview`, `invoice`
- **Facets on `person`**: `candidate`, `hiring-contact`, `referrer`, `past-placement` — *the hero demo: one human who is a candidate at Client A and the hiring manager at Client B.* On `company`: `client`, `prospect`, `target-employer`.
- **Automations**: submission → shortlist view refresh + client notify; interview scheduled → prep reminder to candidate; placement → invoice draft + guarantee-period deadline; no-activity-14d on an open role → nudge the owning consultant; split-placement fee allocation on placement create.
- **Client surface**: a **shortlist** — per-role, client-scoped, comment-and-decide by email round-trip. The single highest-value external artifact in the vertical.
- **Replaces**: Bullhorn / Recruiterflow / Crelate + a shared sheet + email shortlists.
- **Costs today**: cited complaint of **$150/seat/mo** for enterprise ATS at boutique scale; a 6-person desk ≈ **$10.8k/yr**.

### 2. Grant Portfolio (nonprofit / small foundation) ⭐ strongest shape-mismatch
- **Kinds**: `grant`, `funder`, `programme`, `report` (deliverable), `budget-line`, `person`, `organisation`
- **Facets**: on `organisation` → `funder`, `grantee`, `partner`, `fiscal-sponsor`; on `person` → `programme-officer`, `board-member`, `donor`.
- **Automations**: award → generate the funder's specific report schedule; **T-30 report deadline escalation**; spend vs budget-line threshold alert; renewal window opens → task the programme lead.
- **Client surface**: a **funder/programme-officer view** — one project, showing their grant's reports and outcomes only. Textbook external principal.
- **Replaces**: Salesforce NPSP with grants modelled as **Opportunity record types** + spreadsheets + manual outcome reporting.
- **Costs today**: NPSP implementation **$5k–$50k+**, plus add-ons for grants/volunteer/program tracking.

### 3. Agency Client Delivery ⭐ the flagship demo
- **Kinds**: `client`, `engagement`, `deliverable`, `approval`, `invoice`, `person`
- **Facets**: on `person` → `client-contact`, `approver`, `billing-contact`, `freelancer`; on `client` → `retainer`, `project-based`, `at-risk`.
- **Automations**: deliverable ready → approval request **emailed** to the approver, reply lands on the entity; approved → invoice draft; invoice >30d → escalating chase; retainer month rollover → recurring report assembled from real project state (not re-typed).
- **Client surface**: private-by-default project with **per-item client visibility** + email round-trip. Deliberately Basecamp's *revised* model, not its first one.
- **Replaces**: Airtable + Portals add-on, or SuiteDash/Copilot, plus the status-update email thread.
- **Costs today**: Airtable Business $45/seat + Portals **$120–150/mo per 15 guests** (~**$4.8–6k/yr** at 50 clients); or SuiteDash $99/mo; or Copilot $189–399/mo.

### 4. Proposal → Contract → Invoice spine
- **Kinds**: `opportunity`, `proposal`, `contract`, `invoice`, `payment`
- **Facets**: on `company` → `prospect`, `client`, `churned`, `partner` (the same account moving through hats without a second record).
- **Automations**: proposal sent → follow-up ladder; signature webhook → contract + kickoff checklist + first invoice; payment received → close the chase loop.
- **Client surface**: proposal review + signature status, emailed.
- **Replaces**: the documented gap — *Notion/Airtable have no invoicing, time tracking, contract signing or proposal creation*, so this is 3–4 tools + a wiring consultant.
- **Costs today**: Notion consulting to wire the stack runs **$5,000–$25,000**; plus the point tools.

### 5. Client Onboarding Runbook
- **Kinds**: `client`, `onboarding-run`, `step`, `asset-request`, `access-grant`
- **Facets**: `onboarding` on `client`; `blocked-on-client` on `step`.
- **Automations**: contract signed → instantiate the runbook; step assigned to a client contact → email with reply-to-complete; stalled >5d → escalate to account lead; all steps done → close and hand to delivery.
- **Client surface**: the client's own outstanding items, by email, no login.
- **Replaces**: a checklist template that gets copied and drifts.
- **Justification**: named as **"mostly manual at a majority of agencies"** alongside renewals and certificate issuance. **[V]**

### 6. Retainer Health & Renewal
- **Kinds**: `retainer`, `period`, `hours-logged`, `renewal`, `qbr`
- **Facets**: on `client` → `at-risk`, `expansion-candidate`, `renewal-window`.
- **Automations**: scope burn >80% mid-period → alert; two consecutive under-delivered periods → flag at-risk; renewal T-60 → assemble the QBR from actual delivered work.
- **Client surface**: the QBR itself, generated from the record rather than re-typed into slides.
- **Replaces**: spreadsheet burn tracking + a manually built QBR deck.

### 7. Split-Placement / Partner Revenue Share
- **Kinds**: `deal`, `participant`, `split`, `payout`
- **Facets**: `partner`, `referrer`, `sub-contractor` on the same `company`/`person` that is also a `client`.
- **Automations**: deal closed → compute splits → payout tasks; referral source attribution on entity create.
- **Why it earns a slot**: **[I]** it is the clearest case where a role-facet is load-bearing — the same firm is simultaneously client, partner and referrer, and every rigid CRM forces three records. Cited explicitly as a boutique-recruiting need (*"split placements between consultants"*). **[V]**

### 8. Advisory / Fractional Portfolio (solo professional services)
- **Kinds**: `client`, `engagement`, `session`, `note`, `commitment`, `invoice`
- **Facets**: on `person` → `client`, `investor`, `advisor`, `referrer` — the solo consultant's network where one person is genuinely all four.
- **Automations**: session ends → extract commitments → tasks; commitment overdue → nudge; month end → invoice from sessions.
- **Client surface**: the client's own commitments and session record.
- **Replaces**: Folk/Attio + Notion notes + a manual invoice — and note the shared verdict on both CRMs: *"the context behind those contacts — what was said, what was promised — still lives in your head or your inbox."* **[V]**

### 9. Vendor & Subcontractor Ledger
- **Kinds**: `vendor`, `agreement`, `work-order`, `insurance-cert`, `invoice`
- **Facets**: `subcontractor`, `supplier`, `also-a-client` on `company`.
- **Automations**: certificate/insurance expiry T-30; work order → PO → invoice match; agreement renewal reminder.
- **Justification**: **certificate-of-insurance issuance is named as mostly manual** in the insurance-agency vertical. **[V]** **[I]** The same shape generalises to any agency managing subcontractors.

### 10. Board & Investor Reporting (grant-funded and startup variants)
- **Kinds**: `stakeholder`, `report-period`, `metric`, `update`, `commitment`
- **Facets**: on `person` → `board-member`, `investor`, `advisor`, `funder`.
- **Automations**: period close → assemble update from live metrics; unanswered board question → track to resolution.
- **Client surface**: per-investor/per-funder scoped project — **[I]** the cleanest test of the external-principal model, because each stakeholder must see their own slice and nothing else.
- **Replaces**: a hand-written monthly email + a spreadsheet of metrics.

---

## Confidence summary — read this before quoting anything

| Claim | Status |
|---|---|
| Airtable Portals add-on cost, ~$4.8–6k/yr at 50 clients | **[V]** secondary but specific and consistent |
| Attio / Folk / monday / ClickUp / Notion / Basecamp / SuiteDash / Copilot / Baserow / NocoDB pricing | **[V]** |
| Basecamp charges only internal people; guests free | **[V]** |
| Basecamp's Clientside was revised for being "inflexible and not collaborative enough" | **[V]** 37signals' own retrospective (Medium article itself returned 403; claim comes from a summary of it — **re-verify before publishing a direct quote**) |
| Basecamp 4 clients never create an ID/password | **[V]** basecamp-help.com |
| GitHub outside collaborator definition + team exclusion | **[V]** docs.github.com, direct |
| Slack guest vs Connect (who pays, where they live) | **[V]** slack.com |
| Airtable Omni replaced the template gallery; building free | **[V]** airtable.com, direct |
| "Editing is easier than choosing" | **[V]** product-strategy secondary sources, not Airtable |
| Jira >50 roles / schemes as a performance problem | **[V]** Atlassian community + docs |
| 88% of SMB leaders overwhelmed by too many tools | **[V]** salesforce.com, direct |
| "More than half of SMBs face silo-caused data inconsistencies" | **[V-secondary]** — NOT confirmed on Salesforce's page |
| NPSP has no native Grant object | **[V]** |
| Bullhorn "$150/seat/mo" boutique complaint | **[V]** but a vendor blog quoting a practitioner sentiment |
| 63% of data work automatable / 22–31% vs 11–16% admin time / 12–18 hrs recovered | **[V-vendor-adjacent]** direction solid, decimals soft |
| Portal 8–12 hrs/week saved, "perceived professionalism" → retention | **[V-vendor]** positioning, not measurement |
| Client-portal abandonment rate | **[NF]** — the Copilot 25–35% decay curve is an **analogy**, not a portal measurement |
| Real-estate vertical fit | **[NF]** — not researched to a conclusion |

---
---

# EVIDENCE APPENDIX — raw findings with sources

## Running notes (raw findings, will be organised into the deliverable sections)

### Airtable — the portal tax is the headline number [V]
- Team $20/user/mo annual ($24 monthly), Business $45/user/mo annual ($54 monthly), Enterprise Scale ~$60+/seat custom. (Vendr, CheckThat, TinyCommand — see Sources)
- **External client access is a paid add-on ("Airtable Portals"), not a seat.** Reported at ~$120–150/mo for 15 guests; an agency with ~50 client-facing portals runs ~$4,800–6,000/yr *on top of* the base subscription; for 30 external clients needing edit access, portal cost "can rival or exceed the cost of the underlying plan itself." (noloco.io/blog/airtable-pricing)
- This is the single most Synap-relevant economic fact found so far: **the incumbent charges separately, and steeply, for exactly the thing Synap just shipped (per-project membership for an external party).**

### Attio — closest commercial analogue to Synap's typed-entity model [V]
- Free (≤3 seats), Plus $29/seat/mo, Pro $69/seat/mo annual, Enterprise custom.
- Custom objects + flexible schema are self-serve (no professional-services fee) — the deliberate anti-Salesforce move.
- 2026 shift: enrichment and "Ask Attio" AI moved to a **monthly credit system**, so per-seat is no longer the whole cost.
- Documented weaknesses: fewer native integrations than mature platforms; steep learning curve on advanced features; reporting + advanced automation gated to higher tiers.

### Folk — deliberately refuses depth [V]
- Positioned as fast contact capture for small teams; **"deliberately avoids the deep customization and reporting that data-hungry teams eventually want."** That refusal is a product decision, not a gap.
- Shared limitation of both Attio and Folk, stated plainly in comparisons: *"someone still has to put the data in."* Schema power does not solve capture.

### Basecamp Clientside — the canonical portal prior art, and it argues AGAINST portals [V]
- Basecamp's client-facing feature works so clients **never create an ID/password and never log into the account**: updates go out by email, clients reply by email, replies land in the project. (3.basecamp-help.com/article/118-using-the-clientside)
- i.e. the most successful agency-client tool in the category concluded the winning client surface is **email round-trip with a durable record behind it**, not a destination the client must visit.
- Corroborating anecdote: a designer publicly abandoned a Notion client portal because they "craved simplicity and more rigid structure" — the opposite of the flexibility they built it for. (launchthedamnthing.com)

### Client-portal vendors — the market has already priced external users at ZERO marginal [V]
- **SuiteDash**: $19/mo (Start), $49 (Thrive), $99 (Pinnacle) — **flat monthly fee regardless of how many client users**, white-label on every plan. Explicitly favours agencies with large client rosters.
- **Copilot**: $39–89/mo entry; Professional $189/mo (+$39/user past 3); custom domain needs Professional; full white-label needs Advanced at $399/mo. Wins on SOC 2.
- **Service Provider Pro → rebranded to Wayfront**, strongest for *productized* service shops (fixed-scope orders, not bespoke projects).
- **[I] Reading:** two pricing philosophies coexist — Airtable taxes each external guest, purpose-built portals give unlimited client users for a flat fee. Agencies who tried the first route are exactly the ones being quoted the $4.8–6k/yr portal add-on. **Charging per external member is the losing model.** Synap's per-project membership should be priced/architected as "client members are free or flat", never as a seat.

### Airtable killed its template gallery — the blank-canvas answer is GENERATION, not a catalogue [V]
- Since the AI-native relaunch (July 2025) Airtable's onboarding centres on **Omni**: you describe what you want to track and it builds a working base — data + automations + interfaces. Airtable's own page: *"Prompt Omni, iterate, and watch your ideas and data turn into powerful, connected business apps in real time… creates production-ready apps with data, automations, and interfaces… Everything Omni creates is fully editable."* Building with Omni is **free**; only *analysis* questions cost credits (10/response).
- The articulated principle (product-strategy write-ups): **"Editing is a much easier cognitive task than choosing."** A generated, editable draft beats both an empty workspace *and* a template gallery.
- Notion's variant: don't show the full gallery — use signup answers to preload a workspace / offer ~5 personalised templates.
- **Direct implication for Synap:** a marketplace of packages is the *choosing* model that Airtable just walked away from. The package substrate is right; the *entry* should be "describe your business → generated workspace, editable" with packages as the underlying artifact, not the front door.

### Jira permission schemes — the documented cost of per-project permission modelling [V]
- Documented real environments with **>50 permission roles for ~250 people**, described by practitioners as "significantly off"; permission complexity "runs out of control" over time; **too many permission schemes is a named source of Jira performance problems**.
- Best-practice counter-evidence: much larger orgs run fine on **5–15 roles and <10 schemes total**, reused across projects.
- Atlassian's structural answer: **Project Admins can modify users and roles within a project** so they self-serve without a global-admin bottleneck; scheme *shapes* stay few and central.
- **[I] Rule Synap should adopt:** per-project *membership* is fine; per-project *permission schemes* are the trap. Ship a small closed set of project roles (e.g. owner / member / client-viewer / client-collaborator) reused everywhere, with project owners assigning people — never a per-project ACL editor.

### What agencies automate vs. do by hand [V, with caveats]
- MarketingProfs survey (n=713 marketers): **63% of data-related work time goes to tasks that could be partially or fully automated.**
- Agency Management Institute 2024 Benchmark: agencies **without** systematic automation spend **22–31% of total staff time on non-billable admin**, vs **11–16%** for those with workflow automation.
- SoDA 2025 Agency Digital Operations Report: agencies automating client reporting, proposal workflows and onboarding recover **12–18 billable hours per employee per month**.
- Insurance-agency vertical (2026): renewal pipeline, certificate-of-insurance issuance and new-client onboarding are named as **"mostly manual at a majority of agencies"** despite being obviously automatable.
- **[NF]** A clean per-workflow automated/manual split (lead intake vs invoicing vs reporting) from a neutral primary survey. The numbers above are the closest available and several come via vendor-adjacent reporting — treat the *direction* as solid, the *decimals* as soft.

### MSP tooling [V]
- Segmentation is by contract complexity, not size alone: flat-rate Syncro/Atera for <10 techs; ConnectWise/Autotask for "mature operators with complex contracts"; HaloPSA wins on time-to-value for ~10-person MSPs because "a small team is less likely to stall on configuration."
- **[I]** The MSP market is *well* served at both ends and the entity model (client, site, asset, ticket, contract, agreement) is rigid but genuinely standardised — this is a *worse* fit for a configurable graph than it first looks, because the incumbents' rigidity matches a real standard.

### Nonprofit / grant-funded — the strongest "shape mismatch" evidence found [V]
- **Salesforce NPSP has no native Grant object.** The standard workaround is the **Opportunity object with custom record types** — i.e. the sector's dominant system of record makes you model a grant as a *sales deal*.
- NPSP "remains supported but is no longer receiving new features"; grants/volunteer/program tracking require customisation or paid add-ons; outcome reporting handled manually.
- Implementation costs **$5k (basic) to $50k+ (complex)**; orgs that "treat the 10 free licenses as free Salesforce and skip proper implementation rarely get value."
- Common trajectory: "a donor spreadsheet that works at 500 contacts and breaks at 5,000."
- **[I]** This is textbook long-tail-near-identical process: every funder wants near-identical-but-not-identical reporting, and the incumbent forces a borrowed object shape plus a five-figure consultant.

### Basecamp's client model was REVISED — and the revision is the real lesson [V]
- Basecamp 3 originally shipped **"Clientside": an entirely separate part of a project where all client-facing communication lived.** 37signals' own retrospective: *"while it made conceptual sense, it was inflexible and not collaborative enough, working well for some but missing the mark for many."*
- The replacement rule: **everything is private by default; you expressly grant a client permission to see something — private work and shared work live in the SAME project.**
- Basecamp 4's current help doc goes further: clients **never create an ID or password and never log into the account at all** — updates go out by email, clients reply by email, replies land in the project record.
- **Pricing**: Basecamp charges only for internal people. **Guests/clients do not count toward billing.** Free plan (1 project), Plus $15/user/mo, Pro Unlimited flat **$299/mo** (annual) regardless of team size.
- **[I] This is the single most load-bearing prior-art finding in the dive.** The canonical tool tried the "separate client zone" (≈ "give the client their own project") and *walked it back* to per-item visibility inside one shared project, plus an email round-trip so the client need not visit at all.

### Client portals — why agencies actually pay [V, vendor-sourced]
- Consistently reported benefits: fewer status-update emails, faster approvals, **"higher perceived professionalism"** — vendors tie this directly to retention and referrals. *"Clients judge agencies on presentation as much as on output; a branded portal signals that you run a real operation, not a one-person show working out of a Gmail inbox."*
- Claimed time saving: **8–12 hours/week** eliminated in status updates; status requests named "one of the biggest time sinks for account managers."
- ⚠️ **Every one of these figures is vendor-published.** No neutral study of portal *adoption* or abandonment rates was found.
- **[NF]** Hard data on client-portal abandonment. Reddit/forum searches (r/agency, r/smallbusiness) returned nothing usable — the search tool would not surface Reddit threads for these queries in this session. The one first-hand abandonment account found is a web designer publicly ditching a Notion client portal because they "craved simplicity and more rigid structure."
- **[I] Corroborating pattern from an adjacent category**: enterprise Copilot deployments show 70–80% try in week 1 → 40–50% by week 4 → **25–35% by month 3**. Optional destinations that are not on the critical path of someone's work decay to roughly a third of licensed users. A client portal is a *more* optional destination than that. Treat this as a shape-of-curve analogy, **not** a measurement of portals.

### Principal model for external parties — the prior art is unanimous in shape, split in mechanism [V]
- **Slack**: two models, and the difference is explicitly *who pays and where the person lives.* **Guests** = limited access *to your workspace*, **you pay for their account**, they log into your workspace. **Slack Connect** = the external org stays **in their own workspace**, joins a shared channel, no new login, **unlimited shared channels/DMs at no cost.** Slack's own guidance: Connect is the better fit "when you're working with external organizations like clients, vendors or partners."
- **GitHub**: an **outside collaborator** is *"not a member of your organization, but has access to one or more of your organization's repositories,"* with per-repository access level. The one hard exclusion: **"Outside collaborators cannot be added to a team; team membership is restricted to members of the organization."**
- **[I] The consistent shape across all three (Slack, GitHub, Basecamp):** an external party is a **distinct principal type pinned to specific resources**, explicitly *excluded from the org's grouping/role primitives*, and **not billed as a seat.** Nobody models the client as "an internal member whose permissions happen to be narrow."

### The "too many tools" pain — measured, and it is NOT primarily about duplication [V]
- **Salesforce SMB Trends: 88% of SMB leaders feel overwhelmed by too many business tools.** (verified on salesforce.com/small-business/smb-trends)
- Same report, top-of-mind challenge: **46% say "keeping pace with technology" is their top challenge**; 75% feel behind competitors on tech adoption; 51% worry about falling behind. The report as fetched does **not** publish a ranked list putting duplication above cost or hiring.
- Secondary reporting attributes to the same Salesforce research: *"more than half of SMB leaders deal with frequent data inconsistencies caused by silos."* **[V-secondary]** — I could not confirm this sentence on Salesforce's own page; the fetched page did not address silos.
- Volume: SMBs juggle ~9 cloud tools on average; orgs add 15–20 SaaS apps/yr while retiring 5–8; **51% of purchased SaaS licenses go unused** — the highest waste rate recorded.
- Professional-services reality check: *"Neither Notion nor Airtable have invoicing, time tracking, contract signing, or proposal creation."* The stack is not duplication-by-accident — **it is genuinely different tools with real capability gaps between them.** Notion consulting to wire it together runs **$5,000–$25,000**.

### Why teams leave PM/ops tools — the model, not the features [V]
- *"Most teams abandon project management software within three months… the problem is the model rather than the features. Before teams can track a single real task, someone has to understand the tool's conceptual model well enough to set it up correctly — usually a team lead already overextended."*
- Pricing floor games matter: **monday.com** Basic $9/seat with a **3-seat minimum, then buckets in multiples of 5** — a team of six pays for ten; raised prices 18% in Feb 2026. **ClickUp** $7/seat, no minimum. **Notion** $10/member. 10-person team: ClickUp $840/yr vs monday $1,080/yr.

### Recruiting — the two-sided-relationship vertical [V]
- Boutique agencies (3–15 recruiters) are explicitly described as underserved: *"Bullhorn was built for large staffing firms — 50+ recruiters… you're paying Bullhorn prices for a system designed at 10x your scale."*
- The stated need is exactly a facet problem: *"handle two-sided relationships: candidates on one side, client companies on the other,"* plus fee structures, **split placements between consultants**, timesheets, invoicing — and *"lets you share shortlists with clients cleanly."*
- The complaint verbatim: *"doesn't bill you $150 per seat per month for a system you're mostly using as an expensive shared spreadsheet."*

### Research labs / core facilities — weaker fit than expected [V]
- The named breaking point is **reconciliation, not modelling**: *"the scheduling record and the billing record have to reconcile with each other and, ultimately, with the institution's grants-management and general-ledger systems."*
- iLab (Agilent) is the institutional incumbent, built for 50+ instruments and complex chargeback; UI "dense" and "corporate."
- **[I] Verdict: deprioritise.** The pain is integration into finance systems Synap does not touch — a configurable graph does not address it.

### The self-hosted / open-source floor [V]
- **Baserow**: MIT core, **self-hosting free with unlimited rows, users and storage**; cloud from $10/user/mo. **NocoDB**: free self-host; cloud Plus $12/seat (50k records), Business $24, Scale $45 with 3-seat minimum.
- **[I]** This sets a hard price floor on "flexible tables" as a category. Synap cannot win on being a cheaper Airtable — Baserow already gives it away. The differentiator has to be the graph + governance + external-party model, not the table.


---

## Sources

**Flexible tables / pricing**
- https://noloco.io/blog/airtable-pricing — Airtable Portals add-on cost, agency portal maths
- https://www.vendr.com/marketplace/airtable · https://tinycommand.com/blogs/airtable-pricing-explained · https://checkthat.ai/brands/airtable/pricing — Airtable seat pricing 2026
- https://www.airtable.com/platform/app-building — **primary**: Omni conversational app building, no template gallery, free to build
- https://www.softr.io/blog/airtable-alternatives · https://cloudzy.com/blog/best-self-hosted-airtable-alternatives/ · https://teable.ai/blog/best-nocodb-alternatives — Baserow / NocoDB / SmartSuite / Coda positioning and pricing

**Graph CRM (closest analogue)**
- https://marketbetter.ai/blog/attio-crm-pricing-breakdown-2026/ · https://checkthat.ai/brands/attio/pricing — Attio pricing + credit model
- https://www.authencio.com/blog/attio-crm-review-features-pricing-customization-alternatives · https://www.stacksync.com/blog/attio-crm-2025-review-features-pros-cons-pricing — Attio custom objects, learning curve, limits
- https://efficient.app/compare/attio-vs-folk · https://lightfield.app/blog/attio-vs-folk · https://tomba.io/blog/attio-vs-folk — Folk's deliberate refusal of depth; "someone still has to put the data in"

**Client portals + external principals**
- https://3.basecamp-help.com/article/118-using-the-clientside — **primary**: clients never create an ID/password, email round-trip
- https://medium.com/signal-v-noise/launch-a-brand-new-way-to-work-with-clients-in-basecamp-3-6a78b1175c5d — the Clientside retrospective (⚠️ returned HTTP 403 on direct fetch; quote reached me via search summary — re-verify before publishing verbatim)
- https://basecamp.com/pricing · https://www.usecarly.com/blog/basecamp-pricing/ — flat $299 Pro Unlimited; guests/clients not billed
- https://docs.github.com/en/organizations/managing-user-access-to-your-organizations-repositories/managing-outside-collaborators/adding-outside-collaborators-to-repositories-in-your-organization — **primary**: outside collaborator definition, cannot be added to a team
- https://slack.com/resources/slack-for-admins/guests-vs-channels-in-slack-connect · https://slack.com/solutions/use-cases/collaborate-externally — **primary**: guest (you pay, your workspace) vs Connect (their workspace, free)
- https://suitedash.com/best-client-portal-software/ · https://www.plutio.com/compare/suitedash-vs-copilot · https://www.rock.so/blog/client-portal-software — SuiteDash / Copilot / Wayfront pricing
- https://noloco.io/blog/best-custom-client-portal-for-agencies · https://worklenz.com/blog/client-portal-software-complete-guide-agencies-2026/ — why agencies buy (vendor-published)
- https://launchthedamnthing.com/blog/web-designer-client-portals-options — first-hand Notion-portal abandonment

**Adoption / churn / onboarding**
- https://lovex.dev/blog/why-teams-abandon-pm-tools — abandonment within 3 months; "the model, not the features"
- https://get-alfred.ai/blog/monday-pricing · https://www.usecarly.com/blog/monday-pricing/ · https://tech-insider.org/clickup-vs-monday-2026/ — monday 3-seat minimum + buckets of 5, Feb 2026 +18%; ClickUp/Notion seats
- https://wyndomb.medium.com/how-notion-solved-the-blank-page-problem-686b2e73ae57 · https://www.candu.ai/blog/how-notion-crafts-a-personalized-onboarding-experience-6-lessons-to-guide-new-users — "editing is easier than choosing"; Notion preloading
- https://lemonlearning.com/blog/measuring-copilot-adoption-beyond-licences · https://www.getpanto.ai/blog/microsoft-copilot-statistics — 70–80% → 40–50% → 25–35% decay curve (used as analogy only)

**Permissions anti-pattern**
- https://community.atlassian.com/forums/Jira-questions/How-to-Simplify-Permission-Management-in-Jira-Challenges-and/qaq-p/2872139 · https://confluence.atlassian.com/jirasoftwareserver/permissions-overview-939938996.html · https://www.tempo.io/blog/jira-permission-scheme · https://thejiraguy.com/2022/04/27/jira-permissions-top-to-bottom/

**Tool overload / duplication**
- https://www.salesforce.com/small-business/smb-trends/ — **primary**: 88% overwhelmed; 46% "keeping pace with technology" top challenge
- https://blog.analysisgpt.ai/data-silos-small-business/ · https://speakwiseapp.com/blog/saas-overload-statistics · https://www.bettercloud.com/monitor/saas-statistics/ — ~9 tools, +15–20/yr, 51% licenses unused, silo inconsistency claim
- https://thedigitalprojectmanager.com/tools/airtable-vs-notion/ · https://notionalize.com/notion-consulting — no invoicing/time/e-sign in Notion or Airtable; $5k–$25k consulting

**Automation distribution**
- https://blogsync.io/blog/agency-workflow-automation · https://swellsystem.com/business-automations-agencies/ — MarketingProfs 63%, AMI 22–31% vs 11–16%, SoDA 12–18 hrs
- https://ustechautomations.com/resources/blog/automate-state-of-insurance-automation-2026 — renewals / COI / onboarding "mostly manual"

**Verticals**
- https://treegarden.io/blog/best-ats-recruiting-agencies-2026/ · https://recruiterflow.com/blog/best-applicant-tracking-software/ · https://oneupsales.com/blog/the-best-ats-for-recruitment-agencies — boutique ATS gap, two-sided relationships, $150/seat complaint, split placements
- https://idealistconsulting.com/blog/salesforce-grant-management-nonprofits-npsp-vs-nonprofit-cloud · https://www.formassembly.com/blog/how-nonprofits-use-salesforce-npsp-to-manage-grant-applications-and-reporting/ · https://cyntexa.com/blog/salesforce-for-nonprofits/ — no native Grant object, Opportunity record types, $5k–$50k implementation
- https://scopable.io/blog/best-msp-psa-software-2026 · https://scopable.io/blog/connectwise-vs-halopsa-comparison — MSP segmentation
- https://casrai.org/guides/core-facility-management-software — core-facility reconciliation with grants/GL systems

**Vertical vs horizontal**
- https://zoho.com/blog/developer/vertical-crm-zoho.html — horizontal CRM disrupts crafted processes; thousands of vertical CRMs
- https://www.saastr.com/when-selling-saas-would-you-rather-sell-into-multiple-verticals-assuming-product-fit-or-one-strong-vertical-what-are-risk-factors-of-each/ — don't expand verticals at $1–2M ARR; Veeva
- https://www.bvp.com/atlas/founders-guide-to-vertical-software

---
---

# ADDENDUM — round 2 (2026-09-07)

Four asks from team-lead. **Two of my round-1 claims changed materially under primary-source verification. Both corrections are downward.**

## 🔴 CORRECTION 1 — the Airtable template gallery was NOT deleted. My round-1 framing was wrong.

I said Airtable "deleted its template gallery." **That is false as a statement about the product.** Verified directly:

- **https://www.airtable.com/templates is live in 2026 and fully browsable** — dozens of templates across **9 use-case categories** (Project Management, Marketing, Product, Sales & CRM, HR & Recruiting, Finance & Legal, Design & UX, IT & Ops, Supply Chain), **6 industry categories** (incl. Education & Nonprofit, Real Estate, Small Business, Startup & VC), and **4 feature categories** — one of which is **Portals**. Framing: *"Ready-to-use apps that are fully customizable."* **[V — primary]**
- The gallery's CTA now **defers to AI as the fallback, not the entry**: *"Not finding a template that fits your needs? Build it with AI."* **[V — primary]** Note the direction: templates first, AI when templates miss.

What *is* true, narrowly and verifiably:

- **The gallery was removed from the SIGNUP/onboarding path.** The onboarding teardown is explicit that this is a flow change, not a product deletion: the old path (dashboard → "how do you want to start?" modal → base) is bypassed; signup is now email + SSO into a two-panel chat-with-Omni + live-prototype builder. **7 onboarding screens reduced to 4** to reach the aha moment, with account creation moved *before* the AI build. **[V]**
- Templates did not vanish from onboarding either — they were **relocated and personalised**: *"Before users ever touch the builder, Airtable presents a role-aware gallery of app ideas,"* reshuffled by user context (e.g. "Marketing team at a Series B SaaS"). **[V]**
- Omni genuinely produces a **working, editable artifact**, not a suggestion: it "generates working solutions using Airtable components… add fields, tables, automations, interfaces… generate the entire app," and *"Everything Omni creates is fully editable."* Building with Omni is **free**; only analysis questions cost credits (10/response). **[V — primary, airtable.com]**
- Airtable's own framing of July 2025 was a **"refounding moment"**, relaunching as an AI-native app platform. **[V]**

**[NF] Published evidence that it worked.** No activation, retention or conversion data has been published. The teardown explicitly offers none — only the screen-count reduction. Airtable also shipped **"Built with Omni"**, a community gallery for sharing Omni-made apps — **[I]** which is a *new curated catalogue of examples*, i.e. the choosing-surface reappearing one level up.

> ### Corrected verdict for Synap
> The defensible claim is **not** "Airtable deleted the catalogue." It is: **Airtable moved the catalogue off the critical path of a first session and put a generated, editable, working artifact there instead — while keeping the catalogue as the browse/fallback surface, and personalising the version that does appear in onboarding.**
>
> That is a **weaker but more useful** finding than my round-1 version, and it changes the recommendation from *replace* to *re-rank*:
> - ❌ Do **not** delete the package marketplace. The category leader kept its gallery, added a second one, and points users at it by category — including a **Portals** category.
> - ✅ Do **remove the package catalogue from the first-run path.** Nobody's first session should begin with choosing among 24 packages.
> - ✅ First run should produce **a working, editable workspace from a description** — packages as the artifact underneath, exactly as Omni composes Airtable's own primitives.
> - ✅ Where a catalogue does appear in onboarding, make it **role-aware and short** (Airtable personalises; Notion narrows to ~5 from signup answers). **[V]**
> - ⚠️ **"Editing is a much easier cognitive task than choosing"** is a product-strategy-blogger formulation, **not** an Airtable statement and **not** backed by published activation data. It is a good design heuristic. **Do not present it as measured.**

## ✅ CONFIRMED + SHARPENED — Basecamp's per-item model, resolved to the API

**Your reading is confirmed: the primitive to build the portal on is the per-item exposure edge, not the container.** But the precise shape matters, and it is a *hybrid*, which answers your first sub-question directly.

**Is it per-item or per-item-type? Neither alone — it is per-recording, with typed inheritance.** Verified against Basecamp's own public API spec (`basecamp/bc3-api`, `sections/client_visibility.md`):

- Endpoint: **`PUT /recordings/{id}/client_visibility.json`**, parameter **`visible_to_clients: true|false`**. **[V — primary]**
- **"Recordings that control their own visibility can toggle the setting."**
- **"Individual to-dos inherit the visibility of the to-do list they belong to, and individual cards inherit the visibility of their card table."**
- **"This endpoint will return `403 Forbidden` if the recording provided doesn't control its client visibility."** **[V — primary]**

So: a *closed, per-type decision about which objects are visibility-bearing*. Messages and lists carry their own flag; to-dos and cards inherit from their container. The 403 is the enforcement — the API refuses to let you set the flag on a dependent object at all.

- **Default is private**, stated in Basecamp's own help: *"Everything in a client project is private to your team by default, and you decide what to make visible."* UI affordance: **blue lock = private to your team, yellow eye = visible to client.** **[V]**
- **Defaults are authored in templates.** 37signals shipped *client access on templates*: toggle "Work with clients" in a template, choose what clients can access, and *"New projects created from the template will maintain your visibility settings."* **[V — primary, updates.37signals.com]**
- Clients are **full participants within their slice** — they can post messages, comments, events, to-dos, files, and use Pings like a regular member — *"but they'll only see the items you made visible to them."* **[V]** This is what "not collaborative enough" got fixed into.

> ### Answers to your three sub-questions
>
> **1. Per-item or per-item-type? → Per-item, but only for types you designate as visibility-bearing; everything else inherits from its parent.** So you need **both**, and neither is a UI-per-object:
> - a **closed list of visibility-bearing kinds** (Synap's analogue of message/list/card-table) — everything else resolves through its parent;
> - a **default rule authored at the template/package level**, so a project spun from a package arrives with the right things already exposed;
> - a **per-item toggle** only on the bearing kinds, plus a hard refusal (Basecamp returns 403) on dependents — do not silently no-op.
>
> `visible_to` is the right substrate and `accessScopeWhere → [VISIBLE_TO]` is the right portal-guest lens. The missing pieces are the **bearing-kind registry**, the **inheritance resolution**, and the **package-level default**. **[I]**
>
> **2. "Client never logs in" — is the portal often not a portal?** Largely yes, and this is a **version difference I must flag, not smooth over.** Basecamp *3*'s help documented clients who never create an ID or password, working entirely by email round-trip. The current **Basecamp 5** client documentation I could fetch covers adding/removing clients and company associations but **[NF] does not state the authentication method** — I could not confirm the no-login path still holds in BC5, and BC5 clients demonstrably act as participants (posting, completing to-dos), which implies an account. **Corrected position:** email round-trip is a *proven and still-valuable default surface*, but I can no longer claim the current product has no login. Build the record + email round-trip as the default; the viewable surface is the fallback. Do **not** cite "clients never log in" as current Basecamp behaviour without re-verifying against BC5.
>
> **3. Does the container model survive anywhere? → Yes, as the outer boundary — it is the *sole* client surface that was abandoned.** Basecamp did not delete the client project; it kept the project as the container and made visibility per-item *inside* it. The container answers "which engagement is this?"; the edge answers "can they see this thing?" **Keep `project_members` as the tenancy boundary** (a long-running retainer is exactly a durable project with a stable client roster) and **stop treating it as the exposure mechanism.** The failure mode Clientside v1 hit was container-as-exposure: a separate zone you must copy things into, which is why it read as "inflexible and not collaborative enough." **[V for the mechanics; [I] for the two-layer framing.]**

## ⚠️ WEAKER THAN I IMPLIED — the "conceptual model is the barrier" claim

You asked for my strongest citation because a founder will argue with it. **Honest answer: I do not have a strong one, and you should not put this in front of him as measured.**

- My round-1 quote — *"Most teams abandon project management software within three months… the problem is the model rather than the features. Before teams can track a single real task, someone has to understand the tool's conceptual model well enough to set it up correctly, usually a team lead already overextended"* — is from **a single vendor-adjacent blog (lovex.dev)** with **no underlying study cited**. **[V-weak]** It is a well-put assertion, not evidence.
- Best adjacent numbers found, all consultant/vendor white-papers rather than primary research: **70% of software rollouts fail and only 49% of features get used**; **80% of companies report failure at user adoption**, with the common characteristic being *"a focus on technology instead of users."* **[V-vendor]**
- The most credible *framing* found is behavioural rather than statistical: adoption fails because orgs *"treat it as a training problem when it is a behaviour problem"* — existing work runs on System 1 autopilot while a new tool demands System 2 effort, so users route around it. **[V-secondary]** Academic literature exists (Rogers diffusion, Davis TAM, TOE framework) but addresses enterprise adoption determinants, **not** the specific "setup burden of a configurable tool" claim.
- **[NF]** Any primary study measuring time-to-first-value or abandonment attributable to schema/setup burden in flexible tools.

> **Corrected standing.** The **cost** half of my (d) answer is solid and quantified (monday's 3-seat minimum then buckets of 5 — a team of six pays for ten; +18% Feb 2026; Airtable Portals add-on; Bullhorn at boutique scale). The **conceptual-model-setup** half is **a plausible, widely-repeated practitioner belief with no measurement behind it.** It happens to be *corroborated by a decision*, not a study: Airtable rebuilt onboarding to put a working artifact before any modelling choice, and cut 7 screens to 4. Present it that way — "the category leader bet its relaunch on this" — not as a statistic.

## 📈 GRANT PORTFOLIO — the highest-value marginal finding, given the founder already runs grant work

Researching the **grant consultant** (someone administering grants *for clients*) rather than the grantee nonprofit changes the picture, and it lands directly on the primitive you shipped.

**The category already named per-project membership as its headline feature.** Verbatim from the segment's own literature: **"Multi-Client Portfolio Management allows grant consultants to manage multiple clients' portfolios in one account while giving each client access only to their specific data."** **[V]** That is `project_members` + `visible_to`, described by the incumbent segment as the thing consultants buy.

**The named pains, in the segment's own words:**
- *"Managing each aspect of the grant process is challenging even for grant managers working for a single organization; this is even more difficult for consultants who have to manage multiple grants for multiple different clients."* **[V]**
- *"A single missed deadline can cost you a client, and as a freelancer you're tracking deadlines across many organizations at once, and they don't coordinate with each other."* **[V]**
- The stated requirement is a **cross-tenant view**: *"one unified deadline view, every client's grant deadlines, with internal milestones, in a single place — not one calendar per client that you check separately, so you can see when three clients' proposals collide in the same week."* **[V]**
- Spreadsheet breaking point: *"information lives in multiple versions, deadlines slip through cracks… once you're managing ten or more active grants across multiple programs, manual tracking breaks down."* **[V]**

**Pricing / what it costs today [V]:**
| Tool | Price | Fit |
|---|---|---|
| Grant Frog Essentials | **$99/mo** | entry |
| Entry-level category generally | **$99–179/mo** | small teams |
| **Instrumentl** | **~$162/mo** | *explicitly* "small to mid-sized nonprofits **and grant consultants**" — discovery + application + tracking |
| Good Grants | **$3,200/yr+** | mid |
| **Fluxx** | **$10,000+/yr**, custom | large foundations / government |
| Submittable, SmartSimple, Blackbaud, AmpliFund | custom/enterprise | large |
| Salesforce NPSP route | **$5k–$50k+ implementation**, and **no native Grant object** — grants modelled as sales **Opportunities** | the default that doesn't fit |

> ### Why this is now my #1 recommended vertical, above recruiting
> 1. **The founder is standing in it** — a live grant-client workspace with real automations is a dogfooding loop no other vertical here offers.
> 2. **The buyer is the consultant, not the nonprofit** — which dodges the sector's worst trait (no budget, long sales cycles) and lands on someone with per-client revenue.
> 3. **The pain is explicitly cross-tenant** — one operator, many client tenancies, needing *both* an aggregated deadline view *and* per-client isolation. **[I] This is the one shape that Airtable's per-guest pricing punishes hardest and that Synap's two composable lenses answer natively: workspace = the consultancy, project = the client, `visible_to` = what that client sees.**
> 4. **The incumbent's shape is provably wrong** — NPSP has no Grant object; the sector models a grant as a sales deal. **[V]**
> 5. **Reporting is the long tail** — every funder wants a near-identical-but-not-identical report on a near-identical-but-not-identical schedule. Configuration over code, exactly.
> 6. It aligns with the sibling automation dive's conclusion: the deliverable is **deadline/reporting automations whose state, history and governance are first-class owned objects** — a missed funder deadline is the canonical case where an opaque, unversioned, silently-drifted automation costs a client.
>
> **Revised Package #2 → "Grant Consultant Portfolio"** (supersedes round-1's grantee-facing "Grant Portfolio"):
> - **Kinds**: `client-org`, `grant`, `funder`, `application`, `report` (deliverable), `budget-line`, `person`
> - **Facets**: on `organisation` → `client`, `funder`, `fiscal-sponsor`, `partner`; on `person` → `programme-officer`, `ED`, `board-member`, `grant-writer`
> - **Cross-tenant surface (the hero)**: **one deadline board across every client**, with collision detection — "three clients' proposals collide the week of the 14th"
> - **Automations**: award → generate that funder's specific report schedule; T-30/T-7 report escalation; application deadline collision alert; spend-vs-budget-line threshold; renewal window → task the lead
> - **Client surface**: each client-org sees exactly its own grants, applications and reports — `project_members` for tenancy, `visible_to` for what's exposed, email round-trip for approvals/signoffs
> - **Replaces**: Instrumentl (~$162/mo) or Grant Frog ($99/mo) plus a spreadsheet, or an NPSP build at $5k–$50k with grants shoehorned into Opportunity records

## Sources added in round 2
- https://www.airtable.com/templates — **primary**: gallery live 2026, 9+6+4 categories incl. Portals, "Not finding a template? Build it with AI"
- https://www.candu.ai/blog/airtable-vibecoding-onboarding — signup-flow change, role-aware gallery of app ideas, 7→4 screens, no activation data
- https://www.airtable.com/newsroom/introducing-the-ai-native-airtable · https://www.reworked.co/digital-workplace/airtable-relaunches-as-ai-native-app-platform-with-omni/ · https://www.maginative.com/article/airtable-bets-big-on-ai-agents-with-omni-reboots-as-an-ai-native-app-platform/ — "refounding moment", what Omni generates
- https://community.airtable.com/announcements-6/introducing-built-with-omni-create-share-and-get-inspired-46939 — the new community gallery
- https://github.com/basecamp/bc3-api/blob/master/sections/client_visibility.md — **primary**: `PUT /recordings/{id}/client_visibility.json`, `visible_to_clients`, to-dos/cards inherit, 403 on non-bearing recordings
- https://5.basecamp-help.com/article/1081-working-with-clients — private by default, per-item badges; **does not state auth method**
- https://3.basecamp-help.com/article/263-what-clients-can-see-and-do — blue lock / yellow eye; clients post messages, comments, to-dos, files, Pings
- https://updates.37signals.com/post/new-in-basecamp-client-access-on-templates — **primary**: client visibility authored in templates, inherited by new projects
- https://www.suebehaviouraldesign.com/en/blog/why-software-adoption-fails/ · https://www.batonsimulations.com/wp-content/uploads/2019/05/Baton-Why-software-adoption-fails.pdf · https://lemonlearning.com/blog/digital-adoption-challenges — adoption-failure figures (all vendor/consultant, no primary study)
- https://www.instrumentl.com/blog/grant-consulting-client-management — **multi-client portfolio management, per-client data isolation**
- https://www.grantboost.io/blog/freelance-grant-writer-toolkit/ — unified cross-client deadline view, collision weeks, "a single missed deadline can cost you a client"
- https://www.grantbite.com/en/blog/best-grant-management-software · https://grantfrog.com/5-best-grants-management-software/ · https://www.softwareadvice.com/nonprofit/fluxx-profile/ — grant tooling pricing tiers
