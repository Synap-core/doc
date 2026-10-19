# Market & prior-art research — September 2026

Four parallel evidence dives plus one internal design dive, run to answer a
single question: **the substrate is built; what is it for?**

Every claim in these reports is tagged VERIFIED / INFERRED / NOT FOUND, with
source URLs. Gaps are named rather than filled — see "What is NOT established"
below before quoting any of it.

| Report | Question |
|---|---|
| [dive-automation.md](dive-automation.md) | Can Synap be a credible automation platform, given it cannot win on connector breadth? |
| [dive-pkm.md](dive-pkm.md) | What do people actually build in personal knowledge tools, and why do they abandon them? |
| [dive-b2b.md](dive-b2b.md) | What do small teams run ops on, and what could configuration alone replace? |
| [dive-proposer.md](dive-proposer.md) | Prior art for an AI that proposes structure, and for onboarding-by-interview. |
| [project-members-design.md](project-members-design.md) | Internal: project members as a real access model (consolidation, not new build). |

---

## The one-line finding

**The constraint is reachability, not expressiveness — the missing ingredient
is an inbound feed.**

Obsidian can type nouns whose instances are *already files*. A person is not a
file until a human types one. So the ~15M downloads of the typed-data layer
(Dataview 4.9M, Templater 5.5M, Tasks 4.2M) and the ~3,063 downloads across
every CRM-named plugin have the **same cause**. Dataview is enormously
powerful and personal CRM still sits at 3,063 — so schema power is not the
binding constraint.

Confirming it: genuine people-plugins total ~46,729 (Google Lookup 19,703,
Contacts 8,580, VCF 5,764, iCloud 4,988, Sync Contacts 3,871, At People 3,823)
and **five of six are importers or syncers, none is a pipeline**. *Contact
importers outdraw personal CRMs 15:1.*

What people type is what the vault already holds: tasks, projects, daily notes,
books, games, movies, recipes, habits, exercise logs. Obsidian's own Bases
docs give exactly one worked example — "a base called 'Books'". People,
companies and deals appear once in five years of Dataview docs.

⇒ **This is an integrations-and-governance product wearing a knowledge-graph
coat, not the reverse.** The typed graph is the part competitors have or
approximate (Anytype properly; Obsidian now ships Bases natively). The
unclaimed part is *populating the noun-classes a filesystem cannot reach*.

### The governance claim, stated at its defensible width

⚠️ An earlier draft said "nobody has approval". **That was wrong** — Obsidian
Copilot ships a per-action "Permission required" card with temporary or
persistent allow/deny (inherited from the Claude Code CLI), and Claudian has
Plan Mode. Agents in this ecosystem are *already* creating structure: Copilot's
README lists skills for "Obsidian Markdown, **Bases**, Canvas, and the Obsidian
CLI" — a Bases skill is a skill for authoring database views.

The narrow, defensible claim is that every existing gate is **(1) a modal in a
client, (2) disclaimed by its own authors** ("your vault is the agent's working
directory, *not a security sandbox*"), **(3) ephemeral, and (4)
agent-specific.** What nobody has is a **durable, server-side, agent-agnostic
proposal record** — which is what `checkPermissionOrPropose()` is, and it gets
*more* valuable under Bring Your Own Agent, because "most agents show you the
script" is not a control when the agent is a cron job.

⚠️ **But it is ahead of demonstrated demand.** All 108 open issues across both
leading AI-plugin repos were read: the complaints are plumbing (Windows
crashes, CLI detection, API keys, MCP connectivity, lost conversations).
**"The AI wrote wrong structure into my knowledge base" is filed by nobody.**
The nearest signal is one request to "let users exclude vault paths from Agent
Mode file access" — users want scoping and it does not exist. Argue governance
as a **bet on where this goes**, not as a response to pain users are voicing
today.

## The community wedge — KILLED, argued (dive-community)

A fifth dive tested "the community operator is the best-shaped instance of the
rung-C wedge". **Verdict: distraction, not a wedge.** Four independent reasons;
any one survivable, all four together not:

1. **The budget map has one honest row.** Creators: no budget (median Skool
   community charges $27/mo; 44% of *thriving* paid communities have 1–100
   members; 56% of full-time US creators earn below a living wage).
   Associations: budget exists but is already spent on an AMS incumbent that
   does churn scoring. OSS: structurally non-paying. **Only B2B/DevRel has a
   real line item — exactly where three funded companies just lost.**
2. **The wedge has already been sold and found insufficient.** CMX 2026: CRM
   connectivity held steady while **ROI confidence DROPPED**. Their gloss:
   *"having the numbers isn't the same as making the case."* Connecting the data
   was **not** the binding constraint.
3. **The "richest inbound feed" premise is inverted where it matters.** Skool
   (~22,400 paying communities) has no public API, no webhooks, no content
   export — you cannot reach the data of the operator who most needs help.
   Circle has the API *and* sells you the analytics itself.
4. ⛔ **WITHDRAWN — "the success gradient points at becoming a GTM tool."** That
   gradient exists only when the buyer is a sales org. For a solo operator,
   user = budget holder and the community IS the business, so the
   Orbit/Common Room failure **does not transfer**. Argument defeated; the
   verdict does not rest on it.
5. ⭐ **THE KILL, on economics alone — independent of Orbit entirely.** Solo
   creator total tool spend across *all* tools: **$50–80/mo starting, $150–250/mo
   working full-time** (REPORTED; each source is itself a content-marketing
   roundup, so directional). **Skool is $99/mo flat. Circle Business — which
   unlocks the API *and* activity scores on the same gate — is $199/mo.**
   ⇒ **The community platform alone is 40–100% of the operator's entire tool
   budget, and it is the line that already holds the data.** A sovereign pod is
   therefore not a marginal add-on: it is a *second bill at platform-scale
   price*, competing for the largest line in a small budget, against the tool
   that holds the members, hosts the content and takes the payments — while the
   operator's alternative is to spend $0 and use the analytics tab they already
   pay for.
   **Circle resolves cleanly too:** one gate, not two ($199 Business for API +
   activity scores; $419 Enterprise for advanced analytics). So the pitch would
   be *"pay us instead of Circle's upgrade, and do the integration yourself"* —
   a price fight against a bundled incumbent. **Skool operators cannot reach
   their data at any price; Circle operators can, for $199. Unreachable-and-poor,
   or reachable-and-already-served. Neither is a buyer.**

**Why this is a distraction rather than a weak second choice:** where user =
budget holder *and* the budget is not pre-committed — that is the
already-ratified rung C. The individual technical operator self-hosts by
disposition, has no incumbent platform holding their data, and their spend is
not anchored to a community platform's price. **The community framing adds a
competitor and subtracts nothing.**

⚠️ **Unresolved, flagged not fudged:** crustapi advertises "Skool's 200,000+
communities" against an ARR-derived estimate of ~22,400 *paying* owners. Both
can only hold if most of the 200k are trial/inactive, and Skool has no free
owner tier. Either the vendor number is inflated or the Latka ARR is low.
**Quote neither as firm.**

**The extinction event (VERIFIED, three companies, one year):** Orbit ($22M+
raised) acquired by Postman April 2024 and **sunset in 90 days**; Common Room
pivoted March 2024 to a Customer Intelligence Platform; Commsor ($50M Series B
on a community-led thesis) pivoted to warm intros and was acquired. **Orbit's
entire product WAS the member graph.** The graph was not the problem — the
buyer was.

⚠️ **The framing error to avoid repeating:** the community hypothesis **does not
inherit the PKM dive's evidence.** They are opposite failure modes. PKM: *the
entity exists but nobody can type it.* Community: *the entity is trivially
typeable, the graph was built three times by funded teams with a named
methodology, and it still was not a business.* Building the graph better does
not change that outcome.

**Sovereignty appetite here is mostly founder projection.** Nearly every
"community data sovereignty" article is published by a vendor selling a
self-hosted platform. Operators experience Patreon's flat 10% fee and forced
profile merge as *pricing* pain and respond by **switching platforms, not taking
custody**. ~3,000 creators left Substack in 12 months **to other platforms, not
to self-hosting**. (Note: this is a finding about *creators*, not about the
ratified rung-C technical operator, who self-hosts by disposition.)

**What survives — carry the MECHANISM, not the segment:**

1. **Cross-platform identity resolution is the extractable mechanism.**
   Underneath every analytics complaint is a structural fact nobody solves: **a
   member is four different rows in four systems with no join key** — a Discord
   snowflake, a Circle member id, a ConvertKit subscriber, a Stripe customer.
   "Who paid but never showed up" is unanswerable not because analytics are
   weak but because *identity is not resolved across the stack*. That is
   graph-shaped, it is the part Orbit did well, no incumbent gives it to you,
   and Synap already ships it — `IdentityResolutionService`
   (`packages/database/src/services/identity-resolution-service.ts`) with
   strong-signal atoms (email/phone/url/handle/external-id). **Take it to a
   segment that can pay.**
2. **DevRel / B2B user communities stay on the board as a LATER beachhead**
   reached *through* the technical-operator wedge — a DevRel person *is* an
   individual technical operator running Claude Code — and never as "a community
   product". Real budget, rising measurement pressure, buyer adjacent to rung C.
   Caveat: 15% of DevRel professionals report layoffs, and the 2024–25 wave hit
   teams that could not show ROI (REPORTED, secondary).
3. ⭐ **Operators who break into their own data do it to ACT, not to
   understand.** The one authenticated Skool tool advertises eight use cases and
   **seven are WRITE-side**: bulk member approval *with AI screening*,
   auto-messaging new members, cross-posting content, bulk replies to unanswered
   posts, programmatic course publishing from markdown, moderation automation,
   member migration. Only one is analytics. **What this population wants is a
   governed agent with WRITE access to their community** — BYO agent +
   `checkPermissionOrPropose()` + typed entities, i.e. Synap's exact shape. A
   feature list written by the market, and it survives the segment's death.
4. **The spreadsheet-as-database pattern is present here but is NOT what this
   population does** — it shows up as Etsy KPI dashboards, Hivebrite's metrics
   template and stock Zapier Discord→Airtable templates, while the operators who
   actually reach their data are automating writes. The programme-wide pattern
   therefore scores **two-for-three, honestly** (n8n Sheets-vs-Postgres 26:1;
   Obsidian importers-outdraw-CRMs 15:1), not three-for-three. A pre-registered
   prediction by the lead that it would be three-for-three **failed and is
   recorded as failed.**

⚠️ **RETRACTED — "people are paying to reverse-engineer data they already own."**
That was the lead's framing and an earlier draft of this file, and it does not
survive reading the tool listings. Only ONE of the four Skool tools is
authenticated against the operator's own data (210 users, 66 MAU, ~$1.50/mo ≈
**~$100/month worldwide**, INFERRED arithmetic). The larger, healthier tools
scrape the **public discovery feed** to sell **lead lists of Skool owners to
people who want to sell them things** (crustapi 308 users/61 MAU; rigelbytes
3 users/2 MAU/0 bookmarks). That makes Skool operators a **target** market, not
a paying one — close to the opposite of a sovereignty signal. Keep the lock-in
as a rhetorical *illustration* only; a Discord/Skool bridge remains a fine
*capability*, and neither is a segment or a strategy.

⚠️ **Deliberately NOT delivered:** the five community use cases with entity kinds
and inbound feeds. The hypothesis died, so writing them would be "a fabrication
dressed as a plan". Available on request as a DevRel-specific contingency.

## Hypotheses these dives REJECTED

Recorded because a rejected brief is worth more than a confirmed one.

- **"Automation over your own accumulated graph."** Rejected as a
  rationalisation — all three automation incumbents shipped a state store and
  nobody resents Airtable. The defensible axis is *automations whose state,
  history and governance are first-class objects you own*: the top four
  recurring pains (opaque failures, no versioning/rollback, auth rot, upstream
  drift) are operational, not authoring. n8n's oldest un-triaged feature
  request is workflow version control.
- **"No duplication" as the lead pain.** A founder hypothesis. Observed churn
  is *cost* and *conceptual-model setup cost*. Lead with tool overload.
- **"AI proposes structure" as unclaimed ground.** Dated — Notion shipped it.
- **"Typed databases over notes" as a differentiator.** Obsidian shipped Bases.
- **NL-to-workflow was abandoned by the market.** False. Zapier's and n8n's
  builders are both still in Beta, scoped to "draft an outline a human
  completes". The lesson is scope, not rejection.
- **"Zapier Canvas can't execute."** False — it executes and does on-canvas
  field mapping.

## Findings that should change what we build

1. **Airtable took the template gallery OFF THE SIGNUP PATH** — it did not
   delete it. ⚠️ An earlier draft of this README said "deleted"; that was
   overstated and is corrected here. What is actually verified:
   `airtable.com/templates` is live in 2026 (9 use-case, 6 industry, 4 feature
   categories — one of which is Portals), and its own CTA defers to AI only as
   a *fallback*: "Not finding a template that fits your needs? Build it with
   AI." What changed is the *entry*: signup is now email+SSO into chat-with-Omni
   beside a live prototype, **7 screens cut to 4**, with templates relocated and
   personalised into a "role-aware gallery of app ideas". Omni produces a real
   working artifact (fields, tables, automations, interfaces), "fully editable",
   free to build. Airtable then shipped **"Built with Omni"**, a community
   gallery — i.e. **the choosing surface reappeared one level up**.
   ⚠️ *"Editing is easier than choosing"* is a product-strategy blogger's
   formulation, **not** an Airtable statement — do not attribute it to them.
   **No published activation data exists.**
   The defensible lesson is narrower than "galleries are dead": the gallery is
   not the *first* thing a new user meets, and generation and curation coexist.
2. **Composability is a property of the interface, not the library.** Home
   Assistant blueprints — typed inputs with a *selector* per input — are the
   model. An AI cannot MIX templates that don't declare what they need and
   emit; it can only paste them. **The work is on the template schema, not the
   model.**
3. **Two meters on the proposal queue.** Anthropic treated "93% of permission
   prompts approved" as a *defect* (approval fatigue) and cut prompt volume.
   A gate and a suggester want opposite numbers: >90% on the gate is an alarm;
   10–30% on suggestions is healthy (Copilot ~30%, Smart Reply ~12%). Score
   **per kind** — Copilot varies 6× by language.
4. **Rejection must be as generative as approval.** Approval can mint a
   governance rule; rejection mints nothing. That asymmetry is the precise
   Clippy failure — not that it was proactive, but that it had no memory of
   rejection. Also missing: a kill switch (six of seven on the critics' list).
5. **Structure must be a consequence of capture, never a prerequisite.** The
   #2 churn mechanism is "the system becomes the project". "Users define their
   own kinds and properties" is the highest-grade fuel for it.
6. **Do not profile users psychologically.** A controlled study (n=360, 3×2)
   finds an inverted U peaking at *contextual, non-identifying*
   personalisation; under high privacy salience, PII-based was no better than
   generic. A sovereign-data-pod product *is* that condition by construction.
   Adapt to what the user DOES, as a citable observation, never to what they
   ARE.
7. **The client portal is per-item exposure inside a container — a hybrid, not
   a choice between the two.** Verified against `basecamp/bc3-api`:
   `PUT /recordings/{id}/client_visibility.json` with
   `visible_to_clients: true|false`, where **only designated visibility-bearing
   kinds control their own setting and dependents INHERIT from their parent**
   ("individual to-dos inherit the visibility of the to-do list"), and the API
   returns **403 rather than silently no-opping** when a recording does not
   control its own visibility.
   So `visible_to` is the exposure primitive and `project_members` **survives as
   the tenancy boundary** — "which engagement is this". What failed in
   Clientside v1 was container-*as*-exposure (a separate zone you copy things
   into), not the container itself. A long-running retainer is exactly a durable
   project with a stable roster.
   Building this needs three things we do not have: a **closed registry of
   visibility-bearing kinds**, **inheritance resolution** for dependents, and a
   **package-level default** (37signals ships client access authored in a
   template: "New projects created from the template will maintain your
   visibility settings").
   Principal model is unanimous (GitHub outside collaborator, Slack Connect,
   Basecamp guests): **a distinct external principal, excluded from org
   grouping, never a seat.**

## Where the market gaps are

- **Boutique recruiting** (3–15 recruiters) — needs the facet model literally:
  the same human is a candidate at one client and a hiring manager at another.
- **Grant-funded nonprofits** — Salesforce NPSP has **no native Grant object**;
  the sector models grants as sales Opportunities at $5k–$50k implementation.
- Deprioritised: MSPs (rigid because genuinely standardised) and research labs
  (the pain is GL/grants reconciliation, not modelling).

## What is NOT established — read before quoting

- **Reddit was unreachable** from the research environment. r/ObsidianMD,
  r/Notion and r/PKMS were not mined, so the PKM churn section is a *mechanism
  analysis, not a measurement*. Highest-value follow-up; needs a human browser.
- **Readwise retention: no published figure exists.** The "1,724 other readers"
  string on their pricing page is a testimonial carousel, not a subscriber
  count.
- **Mem's pivot is unconfirmed.**
- Notion's template marketplace was not retrieved, so the "ten most common
  structures" ranking is Obsidian-biased and skews technical. ⚠️ **This is the
  caveat that most threatens the headline**: the reachability mechanism above is
  *Obsidian-specific* and does not transfer to Notion unchanged, and Notion's
  audience skews likelier to build CRMs and client trackers. Check this before
  the finding drives a roadmap.
- The CRM census method, so it can be attacked: name+description concatenated,
  case-insensitive, word-bounded literal `\bCRM\b` — not a judgement call about
  what a plugin does. Returns exactly four plugins. Contrast uses the same
  method: tasks/todos/kanban = 11,989,596 across 445 plugins. A broader
  "deals/pipeline" aggregate was **discarded** because it matched *Regex
  Pipeline* and *File Cooker*. Known weakness: a Dataview+Templater CRM needs no
  plugin, so 3,063 undercounts — the asymmetry survives it, because Tasks has
  4.18M despite markdown checkboxes being free.
- Logseq, Capacities, Reflect and Roam were deliberately skipped rather than
  sourced from SEO affiliate pages.
- **No first-party evidence** that answering onboarding questions causally
  improves retention. The defensible claim is narrower: answers let you skip
  the blank canvas, and the blank canvas is the documented killer.
- n8n Pulse node counts measure the **template corpus weighted by popularity**,
  not runtime. No vendor publishes runtime distribution. The "~90% of connector
  usage is in the top 20" figure is an **estimate with a stated method** (band
  65–97%), not a measured statistic.
- **No neutral client-portal abandonment data exists.** A 25–35% figure appears
  in the b2b report as an explicit *shape-of-curve analogy* borrowed from the
  Microsoft Copilot adoption decay curve. It is **not** a measurement of portals
  and must not travel as one.
- **The Basecamp "Clientside was inflexible and not collaborative enough" quote
  403'd on direct fetch** and reached us via a search summary of the Signal v.
  Noise post. The *mechanics* were subsequently verified against Basecamp's own
  API spec and help docs, so the substance stands on primary sources; the
  verbatim quote does not.
- **"Clients never create a login" is Basecamp 3, not current.** Basecamp 5
  clients demonstrably post messages, to-dos and files, implying an account.
  Email round-trip is a proven default *surface*; do not cite it as current
  Basecamp auth behaviour.
- **No published activation data for Airtable Omni**, and the "editing is easier
  than choosing" line is a blogger's formulation, not Airtable's.
- ⛔ **VOID — the membership-churn numbers (5.8%/mo ≈ 51%/yr; "32% of
  cancellations from low engagement").** RetentionCheck states its own
  provenance verbatim: *"RetentionCheck editorial estimate, anchored to
  published industry ranges."* Solo-built site ("Built solo, in public") selling
  churn software; no sample, no timeframe, no sources. These are **not
  measurements of anything** — one person's editorial estimate. They may only
  ever appear alongside that sentence. The widely-quoted community-founder line
  about not knowing their own churn sits on the same vendor page with no primary
  source: an illustration with **zero evidentiary weight**.
- **Synap's own connector estate**: 17 distinct tools across 25 capability
  templates (measured), against a "common case" of ~10 — gaps are Slack, Notion,
  Airtable. This counts the *seeded template estate*, is a floor not a ceiling,
  and does not verify what `google` decomposes into.
