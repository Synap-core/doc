# Dive: AI-proposes-structure + onboarding-by-interview — prior art

**Read-only research. Final.** Every claim is **[VERIFIED]** (a source states it), **[INFERRED]** (my reading across sources), or **[NOT FOUND]** (searched, no evidence — stated rather than estimated). No number below is my estimate.

---

## (a) Who has shipped "AI proposes structure/automation", and what happened

### The published acceptance numbers — the only hard ones that exist

| System | What it proposes | Published acceptance | Source |
|---|---|---|---|
| GitHub Copilot | inline code completions | **~30%** (28.9% in first 3 months → 32.1% in next 3; telemetry over 934,533 users). By language: TypeScript/Terraform ~30%, **Java <5%** | [ITPro](https://www.itpro.com/technology/artificial-intelligence/github-30-of-copilot-coding-suggestions-are-accepted), [GitHub/Accenture](https://github.blog/news-insights/research/research-quantifying-github-copilots-impact-in-the-enterprise-with-accenture/) |
| Gmail Smart Reply | canned replies | **~12% of replies** on mobile Inbox (Google's own 2017 figure) | [Google blog](https://blog.google/products/gmail/save-time-with-smart-reply-in-gmail/), [Google Research](https://research.google/blog/efficient-smart-reply-now-for-gmail/) |
| Claude Code permission prompts | approve/deny an agent action | **93% approved** — and Anthropic treated this as a **defect**, not a success | [Anthropic engineering](https://www.anthropic.com/engineering/claude-code-auto-mode) |

**[VERIFIED] Calibration fact #1.** The two best-instrumented *suggestion* systems in the industry — both in-context, both zero-cost to dismiss — land at **12–30% acceptance**. A proposal system whose design assumes most proposals are accepted is designed against the evidence. **70–88% ignored is the normal, healthy case.**

**[VERIFIED] Calibration fact #2 — and this one is a trap.** Anthropic's own telemetry: *"Claude Code users approve 93% of permission prompts."* Their conclusion, verbatim: *"Over time that leads to approval fatigue, where people stop paying close attention to what they're approving."* They shipped auto-mode (a two-stage classifier that strips assistant messages and tool outputs to resist prompt injection) specifically to *reduce the number of prompts*.

> **Read this carefully, because it inverts the intuitive metric.** A **high** approval rate on a *governance gate* is evidence the gate is being rubber-stamped. A **low** acceptance rate on a *suggestion* is normal and fine. Synap's proposal queue is currently both things at once — it is a suggestion surface AND a permission gate — and **the same number means opposite things in the two roles.** If Synap's AI proposer succeeds, approval rate on proposals should fall (more speculative, more optional proposals) while approval rate on *governance-floor* items should be watched for climbing past ~90% as a rubber-stamping alarm. Reporting one blended number would be actively misleading.

**[VERIFIED] Calibration fact #3.** Copilot's acceptance varies **~6×** by language for the same model. Acceptance is a property of the *domain and surface*, not of model quality. A global "our proposals are X% accepted" hides the domain where the feature is pure noise. **Score per kind.**

### Who ships AI-proposes-STRUCTURE

- **Airtable Omni** (GA 2026) — closest live analogue to the founder's thesis. NL → **generates tables, fields, views, interfaces and automations** as a working base; absorbed the earlier **Cobuilder** (starter schemas only). The load-bearing design fact: *"Everything Omni creates is fully editable in Airtable"* — visually, in the same editors humans use. [Airtable](https://www.airtable.com/platform/app-building), [docs](https://support.airtable.com/docs/using-omni-ai-in-airtable), [independent review](https://www.nocode.mba/articles/airtable-omni-review)
  - **Read across:** the industry's answer to "AI-generated config" is *generate into the same editable substrate the human already uses* — no separate "AI-authored artifact" class. Synap's configuration-driven substrate already has this property. **This is Synap's strongest structural advantage and should be an explicit invariant, not an accident.**
- **n8n AI workflow builder** — generates workflow JSON from NL; agents create/update workflows via API; chat interfaces **propose automations for human import**. The published criticism is *exactly* Synap's governance thesis: *"Once an AI assistant can create or activate n8n workflows, you have a code-generation system connected to triggers, credentials, HTTP endpoints and business logic… Generated workflows are code and need review, sandboxing, permissions, validation, auditing, and a kill switch."* [DEV writeup](https://dev.to/hosseinhezami/n8n-can-now-build-its-own-workflows-what-could-possibly-go-wrong-5epa)
  - **[VERIFIED] external validation that propose-before-execute is correct architecture, not friction.** Synap has 6 of those 7 (review, permissions, validation, auditing, sandbox-by-proposal). **The missing one is the kill switch** — see R7.
- **Notion AI** — proposes *values*, not structure. Basic Autofill (summarise/tag/translate) vs Custom Agent Autofill (multi-step, credit-metered). Documented adoption pattern: *"start with one AI property in your most-used database, monitor, gather feedback, then expand."* [Notion Help](https://www.notion.com/help/autofill)
  - **[INFERRED]** Notion has **not** shipped AI-proposes-schema at the property-definition level — it fills existing columns. That is precisely the gap Synap would occupy.
- **Salesforce Einstein Next Best Action** — recommends actions in a rep's workflow. Vendor and consultancy sources claim conversion/CSAT lift; **[NOT FOUND]: no independent acceptance telemetry.** The consistently reported failure mode is *adoption, not accuracy*: NBA "introduces AI-driven prompts into workflows where reps previously relied on their own judgment," a behavioural shift needing training and change management. [Implementation guide](https://rizexlabs.com/salesforce-einstein-next-best-action-2026-guide/), [NBA overview](https://en.wikipedia.org/wiki/Next-best-action_marketing)
  - **Read across:** a proposal that *displaces a judgment the user considers theirs* gets resisted even when it is right.

**[NOT FOUND]** — no published acceptance rate or removal announcement found for: Zapier Zap suggestions, Microsoft Copilot's Power Automate suggestions, HubSpot AI, Coda AI, Gumloop, Lindy, Relay.app. Searches returned marketing and review content only. I am not estimating these.

---

## (b) Design rules for proposal surfacing — the actionable section

### Evidence base

**Proactive AI, controlled study (CHI 2025).** *Assistance or Disruption? Exploring and Evaluating the Design and Trade-offs of Proactive AI Programming Support* — within-subject, **n=18**, three variants (prompt-only / proactive / proactive + presence + context). **[VERIFIED]** Findings: proactive agents **increase efficiency vs prompt-only, but incur workflow disruptions**; **presence indicators and interaction-context support measurably alleviated the disruption**; more proactivity → more interruption, which *"in the absence of sufficient presence signals and a manageable local interaction scope, diminished users' ability to remain focused."* The paper's own stated principles: the user must be able to accept **and reject**, and **"the decision to accept or reject suggestions should influence future decisions of the proactive assistant."** [arXiv 2502.18658](https://arxiv.org/html/2502.18658v4) · [ACM](https://dl.acm.org/doi/10.1145/3706598.3713357). Companions: [Need Help? Designing Proactive AI Assistants for Programming](https://dl.acm.org/doi/10.1145/3706598.3714002), [Proactive AI Adoption can be Threatening: When Help Backfires](https://arxiv.org/pdf/2509.09309), [Developer Interaction Patterns with Proactive AI: A Five-Day Field Study](https://dl.acm.org/doi/10.1145/3742413.3789148).

**Alert fatigue.** Reported figures **[VERIFIED as reported — vendor-sourced, treat as directional not precise; Chuvakin himself notes alert fatigue is under-studied rigorously]**: ~62–67% of SOC alerts entirely ignored; ~40% never investigated; **61% of teams admit ignoring alerts that later proved critical**; false-positive rates routinely >50% (some orgs 80%); 71% of SOC staff report burnout. [Vectra](https://www.vectra.ai/topics/alert-fatigue), [CyberDefenders](https://cyberdefenders.org/blog/soc-alert-fatigue/), [Chuvakin](https://medium.com/anton-on-security/antons-alert-fatigue-the-study-0ac0e6f5621c)
  - **The transferable finding is the mechanism, not the number:** *a queue whose volume exceeds review capacity does not degrade gracefully — it inverts.* People stop reading, and then miss the important ones too. A proposal inbox **is** an alert queue. **[INFERRED, high confidence]** Once Synap's queue exceeds what the founder reads daily, its precision becomes irrelevant, because nothing is read.

**Clippy — and the lesson is usually mis-stated.** **[VERIFIED]** Post-mortems converge: Clippy was *prescriptive and interruptive, offering help whether wanted or not*; it *"lacks interpersonal intelligence… a disruptive mediator between its user and the world"*; it ran a static rule base with **no context memory**. Alan Cooper called it a *"tragic misinterpretation"* of the Reeves/Nass research. [Microsoft Research: Intelligent Failures](https://www.microsoft.com/en-us/research/publication/intelligent-failures-clippy-memes-and-the-limits-of-digital-assistants/) · [The New Stack](https://thenewstack.io/humanity-vs-clippy-lessons-from-microsofts-failed-virtual-assistant/)
  - **The precise lesson:** Clippy did not fail *because it was proactive.* It failed because it was proactive **with no memory of rejection** — dismissing it taught it nothing, so the same suggestion came back. **Non-learning is what converts a suggestion into harassment.**

### The rules

**R1 — Design for 10–30% acceptance, not 80%.** Rejection is the normal case. Dismissal must be one gesture, free, and never require a reason. No unread badges, no guilt, no blocking.

**R2 — Rejection MUST change future behaviour. Non-negotiable; ship this or ship nothing.** CHI 2025 states it as a principle; Clippy is the counterexample. Concretely: a rejected proposal *shape* (kind × trigger × subject-class) is suppressed or de-ranked, and the user can see and undo that suppression. Synap already has the substrate for this — governance rules are stored, user-editable rows. **A rejection should be able to write a suppression rule the same way an approval writes a widening rule.** That symmetry does not exist today and is the single highest-value addition.

**R3 — Presence over interruption. Pull, not push.** CHI 2025's *measured* mitigation was presence indicators + interaction context. Translation: an ambient, glanceable "3 patterns observed" the user opens on their own schedule beats a modal, toast, or notification. Never interrupt a session to propose structure.

**R4 — Cap the queue by reading capacity, not by confidence threshold.** From alert fatigue: precision is worthless past the point of unread. Surface a hard daily cap; rank and hold the surplus. Synap has a per-agent daily proposal cap — **this evidence reframes that cap as a UX feature tuned to human reading capacity, not merely a safety valve.**

**R5 — Propose into the chore, never into the judgment.** Einstein NBA's adoption problem. Wiring, repetition, missing structure, plumbing → welcome. "Who to call next", "what to prioritise" → resisted even when correct.

**R6 — Explain with the OBSERVATION, not the inference.** "You've manually tagged 14 emails from Acme as 'client' in 3 weeks" is a fact the user can check and dispute. "I inferred you value organisation" is an assertion they cannot. **Cite evidence, never traits.** (This rule is also what keeps (d) legally clean.)

**R7 — Reversibility is a precondition for proactivity.** n8n's own critics list ends with **kill switch**. Synap has approval; it needs *un-approval* — a one-click "undo this automation and everything it did" reachable **from the proposal that created it**. Approval without a matching undo makes every approval a higher-stakes decision, which slows review, which grows the queue, which triggers R4's failure mode.

**R8 — Score acceptance per kind, never globally.** Copilot's 6× language spread. A global rate would have hidden that Copilot-for-Java was noise.

**R9 — Watch approval rate in BOTH directions.** Suggestion acceptance climbing is good. Governance-gate approval climbing toward ~90% is the Anthropic rubber-stamping signal and means the gate has stopped functioning as review. **[INFERRED from Anthropic's own reasoning]** These are different meters and must never be one number.

---

## (c) Onboarding-by-interview: the evidence

### How many questions people will answer

**[VERIFIED, but note the domain caveat]** Survey completion by length: **1–3 questions → ~83% completion; 4–8 → ~65%; 9–14 → ~56%; 15+ → ~42%.** [Lensym benchmarks](https://lensym.com/blog/survey-completion-rates-drop-off/), [Survicate](https://survicate.com/blog/survey-completion-rate/). ⚠️ **These are survey-research benchmarks (largely HR/feedback context), not product-onboarding telemetry.** I searched for published product-onboarding question-count telemetry and **[NOT FOUND]** anything first-party. Treat the shape of the curve as reliable, the exact percentages as directional.

**The one robust structural finding: branching logic.** *"Personalized paths feel shorter and maintain relevance."* **[VERIFIED]** — length is perceived, not counted. Five relevant questions beat three irrelevant ones.

### What the products that got this right actually ask

- **Notion** — asks essentially **two things**: *personal / team / school* and *your role*. That answer selects the initial workspace content and **5 recommended templates**, pre-populated with example content *"so users can see how everything fits together without starting from scratch."* [Candu teardown](https://www.candu.ai/blog/how-notion-crafts-a-personalized-onboarding-experience-6-lessons-to-guide-new-users), [Appcues](https://goodux.appcues.com/blog/notions-lightweight-onboarding)
- **Duolingo** — *what language*, *first time or already know some* (→ optional placement test), and **one motivation question** (Travel / Career / Brain Training) whose sole job is *"to personalize future nudges without being intrusive."* [Appcues](https://goodux.appcues.com/blog/duolingo-user-onboarding), [UserGuiding](https://userguiding.com/blog/duolingo-onboarding-ux)
  - **[VERIFIED] The most transferable design fact in this whole section:** Duolingo asks *one* motivation question and uses it **only to tune the proactive channel** — the notification voice. That is the exact shape of what Synap needs: a small number of answers that calibrate *how and when the proposer speaks*, not what the schema is.
- **Superhuman — the famous one, and the honest reading.** 30-minute 1:1 concierge onboarding. Reported outcomes: **NPS 65+ post-onboarding, >90% 12-month retention among onboarded users, and "without onboarding, churn ate half the user base within 3 months."** [First Round Review](https://review.firstround.com/superhuman-onboarding-playbook/), [Flowjam teardown](https://www.flowjam.com/blog/superhuman-onboarding-teardown-30-minute-wow-session), [Omega Point](https://omegapoint.systems/case-studies/superhuman-concierge-onboarding). **[VERIFIED as reported — these are secondary case-study sources, not a Superhuman-published dataset; the 50%-churn-without figure in particular should be treated as founder-narrative.]**
  - **[VERIFIED] They did NOT remove it.** Contra the common telling, Superhuman *kept* the 1:1 calls and *added process around them*. [Brian Balfour, "Concierge Onboarding — Is It Scalable?"](https://brianbalfour.com/quick-takes/concierge-onboarding-is-it-scalable) is the canonical skeptical read: it works, and it only pencils out at high LTV / premium price.
  - **Why it worked — and this is the part that transfers:** the value was **not** the data collected. It was a human watching you work and configuring the tool *for* you, live, so you reached value before you had to learn anything. An AI proposer is the only thing that can plausibly deliver that at zero marginal cost. **Superhuman is the strongest argument for Synap's thesis that exists** — it is the demonstrated ceiling of what configure-it-for-them buys, and the demonstrated reason nobody else does it.
- **Motion vs Reclaim — the natural experiment on setup cost.** **[VERIFIED]** *"Motion's setup cost is real, requiring days of input to define all tasks, estimate durations, set priorities, and configure work preferences,"* whereas *"Reclaim's ambient, low-decision design minimizes setup friction, making it the easiest tool to get started with."* [Temporal comparison](https://temporal.day/blog/motion-vs-reclaim-vs-clockwise-vs-akiflow-vs-sunsama), [Skedul](https://skedul.ai/blog/sunsama-vs-motion-vs-reclaim)
  - Both shipped. Both have users. **[INFERRED]** The lesson is not "low friction wins" — it is that **the interview must be repaid immediately and visibly.** Motion gets away with days of input because the payoff (auto-scheduling) is impossible without it. Synap must not ask a question whose payoff the user cannot see within the same session.

### What it buys

**[NOT FOUND]** — I could not find published, first-party evidence that answering onboarding questions *causally* improves retention in a product context. The claims are universally vendor case-study shaped. **Do not build a business case on "onboarding questions improve retention."** The defensible claim is narrower and well-supported: **answers let you skip the blank canvas**, and the blank canvas is the documented killer (Notion pre-populates; Duolingo places; Superhuman configures).

---

## (d) The psychological-profiling idea — direct verdict

### Verdict: **don't. And you don't need to.**

Three independent reasons, in order of how much they should weigh:

**1. It measurably backfires — with a controlled number.** [Triggering the Personalization Backfire Effect (Behav. Sci., 2025)](https://pmc.ncbi.nlm.nih.gov/articles/PMC12561546/) — 3 (personalization: generic / **contextual-nonPII** / **PII-based**) × 2 (situational privacy concern) between-subjects, **n=360**. **[VERIFIED]**:
  - Low privacy concern: medium (M=6.23) and high (M=6.43) both beat generic (M=5.79), p=0.03 / p=0.001.
  - **High privacy concern: medium personalization (M=5.91) beat BOTH low (M=5.45, p=0.03) AND high (M=5.58).** High personalization was *no more effective than generic*. Interaction F(2,354)=3.21, p=0.042, η²ₚ=0.018.
  - **The shape is an inverted U, and the peak is at CONTEXTUAL, non-identifying personalization.** Deeper is not better; deeper is worse the moment privacy is salient — and in a *sovereign personal data pod*, privacy is permanently salient by construction. **Synap's own positioning makes it the high-privacy-concern condition by default.** Corroborating: [Inverted U-Shaped Effect of Personalization](https://www.researchgate.net/publication/390164403), [When AI advice backfires (J. Retailing & Consumer Services)](https://www.sciencedirect.com/science/article/pii/S0969698926001256) — personalized responses raise helpfulness attribution *and* intrusiveness simultaneously, partially cancelling.

**2. It is legally exposed in the EU, factually.** **[VERIFIED]** EU AI Act **Article 5(1)(c)** prohibits AI systems for *"the evaluation or classification of natural persons… based on their social behaviour or known, **inferred or predicted personal or personality characteristics**"* where the resulting score leads to detrimental treatment. Art. 5(1)(f) prohibits emotion inference in workplace and education contexts (biometric-derived). [WilmerHale deep dive](https://www.wilmerhale.com/en/insights/blogs/wilmerhale-privacy-and-cybersecurity-law/20240408-prohibited-ai-practices-a-deep-dive-into-article-5-of-the-european-unions-ai-act), [Commission guidelines](https://www.insideprivacy.com/artificial-intelligence/european-commission-guidelines-on-prohibited-ai-practices-under-the-eu-artificial-intelligence-act/), [FPF on emotion recognition](https://fpf.org/blog/red-lines-under-eu-ai-act-unpacking-the-prohibition-of-emotion-recognition-in-the-workplace-and-education-institutions/)
  - **Honest scoping:** a single-user tool inferring your own traits to configure your own workspace is **not** what Art. 5(1)(c) targets (there's no detrimental social score). **[INFERRED]** The prohibition doesn't obviously bite. But two things do: **(i)** Synap has a *team/workspace* dimension — the moment an inferred trait about person A is visible to person B in a shared workspace, you are in the Art. 5(1)(c)/workplace neighbourhood; **(ii)** inferred psychological characteristics stored in a pod are personal data under GDPR with all that entails (access, rectification, erasure — of an *inference*, which is a genuinely hard thing to honour).

**3. It is unnecessary — and the substitute is strictly better.** The literature's own framing is that psychographics *explain* while behaviour *measures*: *"engagement strategies built purely on usage data can feel impersonal, while strategies based only on perceived motivations lack measurable signals."* [Velaris](https://www.velaris.io/articles/psychographic-vs-behavioral-segmentation) **[VERIFIED]**

### The defensible alternative — and it's the same rule as R6

**Adapt to what the user DOES, stated as an observation they can check. Never to what they ARE, stated as an inference they cannot.**

| Don't store / say | Do store / say |
|---|---|
| "User is detail-oriented / high-conscientiousness" | "User has renamed 6 of 8 auto-generated view titles" |
| "User prefers structure" | "User created 3 custom properties on `client` in 2 weeks" |
| "User is overwhelmed" | "12 proposals unread for 9 days" |
| "User is a visual thinker" | "User opens the whiteboard 4× more than the table view" |

Every right-hand row is: falsifiable, correctable by the user, deletable, explainable in one sentence, and **outside** the "inferred personality characteristics" language entirely. It is also *more useful*, because it points at a specific action rather than a vibe.

**One concession to the founder's instinct, made safe:** the *interview* may legitimately ask about **preference and working style, declared by the user** — "do you want me to suggest things, or stay quiet until asked?", "how often is too often?". That is Duolingo's motivation question. Declared preference ≠ inferred trait. It is consented, editable, visible, and it calibrates exactly the thing that needs calibrating (R3/R4: the proactive channel). **[INFERRED]** This gets ~all the value of the psychological idea with none of its exposure.

---

## (e) What makes a template library composable — Home Assistant blueprints as the working model

**Home Assistant blueprints** are the closest shipped analogue to Synap's substrate, and they are worth copying almost literally. [Schema docs](https://www.home-assistant.io/docs/blueprint/schema/), [tutorial](https://www.home-assistant.io/docs/blueprint/tutorial/) **[VERIFIED]**:

- **A blueprint = metadata + a domain-specific schema.** Required: `name`, `domain` (one of `automation` / `script` / `template`). Optional: `description` (*"highly recommended… describe what the blueprint does and describe the inputs it requires"*), `author`, `source_url`, `homeassistant.min_version`.
- **Typed, declared inputs.** Each input has `name`, `description`, `default`, and a **`selector`** — *"a selector defines how the input is displayed in the frontend UI."* Entity selectors filter by domain and device class; target selectors constrain what can be acted on. **The selector is what makes the parameter safe AND makes the UI free.**
- **`!input` is the substitution mechanism** — a template placeholder resolved at instantiation. *"Write once, configure many times."*
- **Sections** (2024.6.0+) group inputs visually, with `icon`, `description`, and **`collapsed`** to hide optional inputs by default — progressive disclosure built into the schema.
- **`min_version` declares a capability floor**, so a blueprint using sections won't silently half-load on an older install.
- **Gotcha worth knowing:** blueprint inputs are **not** automatically available as template variables; they must be explicitly re-exposed via a `variables` step. **[VERIFIED]** A real seam between "the parameter the user set" and "the value the logic can read" — the kind of thing that produces silent inert config.

**The generalisable pattern, cross-checked against Terraform:** *"reusable units of configuration: input variables in, output values out, encapsulated resources in between"*; **"treat the inputs and outputs as a versioned contract"**; SemVer + a registry so teams **pin, upgrade on their own schedule, and roll back**; and *"a good module should do one thing well rather than model an entire architecture."* [Terraform modules](https://developer.hashicorp.com/terraform/language/modules/configuration), [Scalr](https://scalr.com/learning-center/terraform-modules-explained), [Spacelift](https://spacelift.io/blog/terraform-modules-at-scale)

### The five properties that separate an ingredient from a fixture

1. **Declared, typed inputs** — not "edit the YAML after install". A parameter with no declared type is not a parameter.
2. **A selector/constraint per input** — this is the piece most libraries skip, and it is what buys you a generated UI *and* validation *and* an AI that can fill the slot correctly. **This is the highest-leverage single thing on this list for Synap.**
3. **Declared outputs** — without them nothing can consume the thing downstream, and you have a pile, not a library.
4. **Versioned contract + capability floor** — SemVer on the interface; `min_version` for what the host must support.
5. **Narrow scope** — one thing well. A template that models a whole workspace can only ever be installed, never composed.

**[INFERRED, and it is the answer to the founder's actual question]** *"Composable" is not a property of the library — it is a property of the INTERFACE each item declares.* An AI cannot mix templates that do not declare what they need and what they emit; it can only paste them. If Synap wants AI-composed configuration, **the work is on the template schema (typed inputs + selectors + declared outputs), not on the model.** Everything else follows.

**The counter-example that proves it: Apple Shortcuts.** **[VERIFIED]** Shortcuts *"remains a niche tool used primarily by power users"*; users face *"lack of discoverability, inconsistent app support, and fragile workflows"* — *"if applications tweak, add, or remove App Intents, entire shortcuts can break."* [Medium teardown](https://tylerhackbart.medium.com/apple-shortcuts-powerful-but-falls-short-for-mainstream-users-a9da7b8181fb), [MacStories](https://www.macstories.net/stories/shorcuts-in-ios-16-the-potential-of-app-shortcuts-for-everyone/) — a giant gallery with an unversioned, undeclared interface produced fragility, not composition. Apple's own fix, in flight, is *"describe what you want your shortcut to do"* → auto-build. [9to5Mac](https://9to5mac.com/2026/05/18/with-ios-27-shortcuts-is-about-to-become-what-it-was-always-meant-to-be/) — i.e. **the industry is converging on exactly Synap's thesis**, which is both validation and a clock.

---

## (f) Paths prior art says are WRONG

1. **Interrupt-to-suggest (Clippy).** Verified failure. Not because proactive is wrong, but because interrupting *without memory of rejection* is. → R2, R3.
2. **Auto-applying config without approval.** n8n's own community: generated workflows are code touching triggers, credentials and business logic; they need review, sandboxing, permissions, auditing, kill switch.
3. **A permission gate as the primary safety mechanism, at volume.** Anthropic's 93% is the receipt: at volume the gate becomes a rubber stamp and *stops being a control while still looking like one.* **This is the most under-appreciated finding in this report and it is aimed directly at Synap's core mechanism.** The mitigation is to reduce prompt *volume* (auto-approve the boring, propose the consequential), not to make the prompt more informative.
4. **Long up-front questionnaires.** Completion falls off a cliff past ~8 questions; the products that won ask **1–3** and repay them immediately.
5. **Inferring personality/psychological traits.** Backfires under privacy salience (n=360, inverted U peaking at *contextual, non-identifying*), and sits adjacent to EU AI Act Art. 5(1)(c) language on "inferred or predicted personality characteristics".
6. **AI-generated config the user cannot read or edit afterwards.** Airtable's explicit counter-design (everything Omni makes is editable in the normal editors). A config the user cannot edit is a config they cannot trust, and the first surprise makes them abandon the feature permanently.
7. **A single blended proposal-quality metric.** Copilot's 6× language spread; and suggestion-acceptance vs gate-approval mean *opposite* things.

---

## (g) Proposed design: Synap's AI proposer loop

### What it observes — **behaviour only, and only what it can cite**
Repetition and friction in the user's own actions: repeated manual property edits on one kind; the same filter re-applied; entities of a kind consistently getting the same facet attached; a manual step recurring after the same trigger; renamed generated titles; unread/aged proposals. **Never** a trait, mood, or disposition. Every observation must render as one sentence with a count and a time window (R6).

### What it may propose — ranked by the chore/judgment axis (R5)
- **Tier 1 (freely propose):** a property def, a view, a facet attach, a filter saved, a rename, an automation whose action the user has already done manually ≥3×. Pure plumbing.
- **Tier 2 (propose with a visible diff):** a new kind, a playbook, a capability wiring, a governance widening.
- **Tier 3 (never auto-propose; only on request):** anything that reorders the user's priorities, judges their work, or asserts something about them. Governance floors (delete / admin / scope change) stay where they are — proposals never touch them.

### When it surfaces — **pull, capped, ambient** (R3, R4)
An ambient count in the shell — *"4 patterns observed"* — that never interrupts and never badges red. Opening it is the user's move. A hard cap on surfaced proposals per day tuned to what the founder actually reads; surplus is ranked and held, and the held count is visible so the cap is honest rather than hidden. **No modal, no toast, no push, ever, for a structure proposal.**

### How it explains itself
Three lines, in this order:
1. **The observation, with numbers:** "You've attached the `client` facet by hand to 7 entities in 12 days."
2. **The proposal, as a diff against current config**, in the same language the settings UI uses — not prose, not a reasoning chain.
3. **The undo, named up front:** "Approving creates 1 automation. Undo removes it and reverts anything it did."

### How the user corrects it — **four verbs, and the third is the one that matters**
- **Approve** → applies; writes lineage back to the proposal.
- **Edit then approve** → lands in the normal editor (Airtable's rule: the artifact is ordinary config, with no AI-authored class).
- **Reject** → **writes a suppression for this proposal SHAPE (kind × trigger × subject-class), visible and undoable in settings.** This is R2, and it is the piece that does not exist today. Rejection must be as generative as approval: today an approval can mint a governance rule; a rejection should be able to mint a suppression rule through the same door.
- **"Not now"** → defers without teaching anything. Users need an exit that isn't a verdict, or they will reject things they actually want and poison the signal.

### What it must never do
- Interrupt a working session to propose structure.
- Propose the same shape after rejection, without the user lifting the suppression.
- Apply anything at a governance floor (delete, admin, scope change) — the proposer widens nothing that the policy engine floors.
- Store, display, or act on an inferred trait about a person. Observations only, citable and deletable.
- Create config the user cannot open in the normal editor.
- Exceed the daily cap, even when confident.

### What to instrument from day one
- **Acceptance rate per kind** (never global) — expect 10–30%, and treat >80% on *speculative* proposals as evidence the proposer is only proposing the obvious.
- **Governance-gate approval rate**, tracked separately, with **climbing past ~90% as a rubber-stamping alarm** (Anthropic's finding, inverted into a metric).
- **Suppression count and lift rate** — how often users lift a suppression tells you whether rejections are being over-generalised.
- **Held-vs-surfaced ratio** — if the cap is holding most proposals, either quality or the cap is wrong; the number tells you which.
- **Time-to-first-open of the ambient indicator** — the honest measure of whether pull actually works, and the one that will tell you early if R3 was wrong for this product.

### The onboarding that feeds it — three questions, no more
1. **What are you keeping track of?** (free text or a few chips) → selects the starting kinds and a pre-populated example, Notion-style. Blank canvas is the documented killer.
2. **Who else touches this?** (just me / a small team / clients) → sets entity scope and workspace defaults.
3. **How chatty should I be?** (suggest freely / only when I ask / weekly digest) → **calibrates the proactive channel.** This is Duolingo's motivation question, and it is the *entire* legitimate content of "understand the person": a **declared preference** about the proactive channel, editable forever in settings, not an inferred trait.

Everything else the system needs, it learns from what the user does — which is both the more accurate signal and the only defensible one.

---

## Sources

[ITPro — Copilot 30%](https://www.itpro.com/technology/artificial-intelligence/github-30-of-copilot-coding-suggestions-are-accepted) ·
[GitHub/Accenture research](https://github.blog/news-insights/research/research-quantifying-github-copilots-impact-in-the-enterprise-with-accenture/) ·
[Google — Smart Reply 12%](https://blog.google/products/gmail/save-time-with-smart-reply-in-gmail/) ·
[Google Research — Efficient Smart Reply](https://research.google/blog/efficient-smart-reply-now-for-gmail/) ·
[Anthropic — Claude Code auto mode (93%)](https://www.anthropic.com/engineering/claude-code-auto-mode) ·
[Anthropic — How we contain Claude](https://www.anthropic.com/engineering/how-we-contain-claude) ·
[Airtable Omni](https://www.airtable.com/platform/app-building) ·
[Airtable Omni docs](https://support.airtable.com/docs/using-omni-ai-in-airtable) ·
[No Code MBA — Omni review](https://www.nocode.mba/articles/airtable-omni-review) ·
[n8n self-building workflows critique](https://dev.to/hosseinhezami/n8n-can-now-build-its-own-workflows-what-could-possibly-go-wrong-5epa) ·
[Notion AI autofill](https://www.notion.com/help/autofill) ·
[Einstein NBA guide](https://rizexlabs.com/salesforce-einstein-next-best-action-2026-guide/) ·
[Next-best-action marketing](https://en.wikipedia.org/wiki/Next-best-action_marketing) ·
[CHI 2025 — Assistance or Disruption? (arXiv)](https://arxiv.org/html/2502.18658v4) ·
[CHI 2025 — ACM DL](https://dl.acm.org/doi/10.1145/3706598.3713357) ·
[CHI 2025 — Need Help?](https://dl.acm.org/doi/10.1145/3706598.3714002) ·
[Proactive AI Adoption can be Threatening](https://arxiv.org/pdf/2509.09309) ·
[IUI 2026 — Five-Day Field Study](https://dl.acm.org/doi/10.1145/3742413.3789148) ·
[Vectra — alert fatigue](https://www.vectra.ai/topics/alert-fatigue) ·
[CyberDefenders — SOC alert fatigue](https://cyberdefenders.org/blog/soc-alert-fatigue/) ·
[Chuvakin — Alert Fatigue: The Study](https://medium.com/anton-on-security/antons-alert-fatigue-the-study-0ac0e6f5621c) ·
[MSR — Intelligent Failures: Clippy Memes](https://www.microsoft.com/en-us/research/publication/intelligent-failures-clippy-memes-and-the-limits-of-digital-assistants/) ·
[The New Stack — Humanity vs Clippy](https://thenewstack.io/humanity-vs-clippy-lessons-from-microsofts-failed-virtual-assistant/) ·
[Lensym — survey drop-off benchmarks](https://lensym.com/blog/survey-completion-rates-drop-off/) ·
[Survicate — completion rates](https://survicate.com/blog/survey-completion-rate/) ·
[Candu — Notion onboarding](https://www.candu.ai/blog/how-notion-crafts-a-personalized-onboarding-experience-6-lessons-to-guide-new-users) ·
[Appcues — Notion onboarding](https://goodux.appcues.com/blog/notions-lightweight-onboarding) ·
[Appcues — Duolingo onboarding](https://goodux.appcues.com/blog/duolingo-user-onboarding) ·
[UserGuiding — Duolingo UX](https://userguiding.com/blog/duolingo-onboarding-ux) ·
[First Round — Superhuman onboarding playbook](https://review.firstround.com/superhuman-onboarding-playbook/) ·
[Balfour — Concierge onboarding, is it scalable?](https://brianbalfour.com/quick-takes/concierge-onboarding-is-it-scalable) ·
[Flowjam — Superhuman teardown](https://www.flowjam.com/blog/superhuman-onboarding-teardown-30-minute-wow-session) ·
[Omega Point — Superhuman concierge](https://omegapoint.systems/case-studies/superhuman-concierge-onboarding) ·
[Temporal — Motion vs Reclaim vs Sunsama](https://temporal.day/blog/motion-vs-reclaim-vs-clockwise-vs-akiflow-vs-sunsama) ·
[Skedul — auto-planner comparison](https://skedul.ai/blog/sunsama-vs-motion-vs-reclaim) ·
[Personalization Backfire Effect (n=360)](https://pmc.ncbi.nlm.nih.gov/articles/PMC12561546/) ·
[Inverted U-Shaped Effect of Personalization](https://www.researchgate.net/publication/390164403_The_Inverted_U-Shaped_Effect_of_Personalization_on_Consumer_Attitudes_in_AI-Generated_Ads_Striking_the_Right_Balance_Between_Utility_and_Threat) ·
[When AI advice backfires (JRCS)](https://www.sciencedirect.com/science/article/pii/S0969698926001256) ·
[Velaris — psychographic vs behavioural](https://www.velaris.io/articles/psychographic-vs-behavioral-segmentation) ·
[WilmerHale — EU AI Act Art. 5](https://www.wilmerhale.com/en/insights/blogs/wilmerhale-privacy-and-cybersecurity-law/20240408-prohibited-ai-practices-a-deep-dive-into-article-5-of-the-european-unions-ai-act) ·
[Inside Privacy — Commission guidelines](https://www.insideprivacy.com/artificial-intelligence/european-commission-guidelines-on-prohibited-ai-practices-under-the-eu-artificial-intelligence-act/) ·
[FPF — emotion recognition red lines](https://fpf.org/blog/red-lines-under-eu-ai-act-unpacking-the-prohibition-of-emotion-recognition-in-the-workplace-and-education-institutions/) ·
[Home Assistant — blueprint schema](https://www.home-assistant.io/docs/blueprint/schema/) ·
[Home Assistant — blueprint tutorial](https://www.home-assistant.io/docs/blueprint/tutorial/) ·
[Terraform — module configuration](https://developer.hashicorp.com/terraform/language/modules/configuration) ·
[Scalr — Terraform modules](https://scalr.com/learning-center/terraform-modules-explained) ·
[Spacelift — modules at scale](https://spacelift.io/blog/terraform-modules-at-scale) ·
[Shortcuts falls short for mainstream users](https://tylerhackbart.medium.com/apple-shortcuts-powerful-but-falls-short-for-mainstream-users-a9da7b8181fb) ·
[MacStories — App Shortcuts](https://www.macstories.net/stories/shorcuts-in-ios-16-the-potential-of-app-shortcuts-for-everyone/) ·
[9to5Mac — iOS 27 Shortcuts](https://9to5mac.com/2026/05/18/with-ios-27-shortcuts-is-about-to-become-what-it-was-always-meant-to-be/)
