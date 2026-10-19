# Design Prompt: Synap Proposal Review Queue

**For:** Designer AI / Figma AI / visual product exploration  
**Stage:** Pre-implementation concept validation  
**Goal:** Create high-fidelity desktop-first screens for a calm, evidence-first review experience for AI-proposed writes in Synap Browser.

> This is a design brief, not an implementation specification. It establishes the
> user story, information hierarchy, and variants that engineering will validate
> against the proposal lifecycle.

---

## The Product and the User Story

Synap is sovereign personal data infrastructure: people capture information,
AI organizes it into durable structure, and every consequential AI mutation is
reviewable and reversible.

The user has started a focus session, for example **“Research the European
stablecoin market”**. Their own agent has found sources, created entities,
proposed links, and suggested a few changes. The user needs to understand one
proposal at a time, decide safely, and continue their work without becoming an
operator of an AI control room.

The emotional outcome is:

> “I immediately understand what Synap wants to do, why, and what will happen
> if I approve it. I remain in control without being buried in internals.”

---

## Product Model: Two Complementary Surfaces

Do **not** merge these into one screen.

| Surface | Object | Primary question | Default action |
| --- | --- | --- | --- |
| **Inbox** | A person’s attention | “What needs me now?” | Open / read / defer; open a proposal to review it |
| **Review queue** | Pending AI proposal | “What will this write change, and should I allow it?” | Understand → Apply, Request changes, or Reject |
| **Proposal detail** | One proposal and its evidence | “Is this safe, useful, and correctly scoped?” | Make one auditable decision |

Inbox is not a compressed admin console. Proposal review is not a notification
drawer. A proposal may be announced in Inbox, but its evidence and decision
live in Review Queue.

---

## The Mental Model: Synap's Change-Control Plane

The proposal system is the **control plane for changes to a person's Synap**.
It is not a generic activity feed, a collection of API events, or the entire
operating system. Its job is to turn work performed by an AI, automation, or
person into a decision the person can genuinely understand and own:

> “Given this goal and this evidence, Synap wants to make this bounded change.
> Here is the resulting state, what it touches, and what follows if I allow it.”

This preserves Synap's core rule: **AI proposes; the user disposes.** It also
gives reports, agent work, automations, playbooks, entities, and the graph one
coherent governance language without pretending that they are the same object.

### Three objects, deliberately not one overloaded `Proposal`

| Object | Meaning | Can the user decide it? | Example |
| --- | --- | --- | --- |
| **Work** | The activity that produced a result: a focus session, agent run, automation run, or user message. | No. It is context and provenance. | “Research the European stablecoin market.” |
| **Proposal** | One versioned, bounded consent boundary: an intended state transition with a truthful preview and a decision. It can contain several dependent operations when they form one coherent, atomic outcome. | Yes: Apply, Request changes, Reject. | “Create the EUR stablecoin landscape: 8 entities and 14 verified links.” |
| **Proposal bundle** | A reading/coordination view over related proposals from one piece of work. It is never a disguised approval mechanism. | Only each contained proposal is decided. | “Results from Market research: 3 changes ready for review, 1 report draft.” |

An AI's **suggested next step** is neither a hidden write nor a pre-approved
child proposal. It is a recommendation such as “Create a weekly monitoring
automation.” Choosing it starts new work or creates a separate proposal, with
its own scope and review. This keeps a useful chain of thought from becoming a
chain of accidental permissions.

### Surface boundary: Proposal inspector versus Work result

The visual exploration's “work-to-change dossier” is valuable, but it does not
render the same object as the normal queue inspector.

| Surface | Renders one | Primary question | Entry |
| --- | --- | --- | --- |
| **Review Queue inspector** | Proposal | “Can I safely allow this bounded change?” | Select a queue row or Inbox handoff |
| **Work result** | Work / bundle | “What did this session, run, or automation accomplish, and what remains?” | Open the session, correlation, agent-run, or bundle lens |

The Work result may show trigger, goal, work summary, source material, artifact
previews, and several related proposals. Its proposal rows open the **same**
canonical Proposal inspector—there are not two decision implementations.

For ordinary, single-field proposals, the queue inspector must lead with the
change and keep “work context” as a compact provenance door. For a substantial
compound proposal, it can elevate a concise goal and work summary because they
materially help a person evaluate the intended outcome. It must still lead with
the bounded change, not a retrospective dashboard of agent activity.

### One proposal dossier, many domain renderers

Every proposal must carry the same human-facing dossier. Renderers vary by what
is changing; the questions do not.

```text
trigger → goal → work performed → proposed state transition → decision → outcome → next options
```

1. **Trigger** — the user message, focus session, automation condition, or
   agent instruction that started the work.
2. **Goal** — what the work was trying to achieve in the user's words.
3. **Work performed** — a concise account of sources read, checks run, or
   transformations made; never fabricated implementation theatre.
4. **Proposed state transition** — the exact result if approved: objects,
   graph relations, configuration, content, permissions, or external effect.
5. **Decision conditions** — risk, scope, reversibility, dependencies, and
   what has changed since the proposal was prepared.
6. **Outcome** — applied, rejected, revised, withdrawn, or failed, with an
   auditable event trail and undo/recovery path where one exists.
7. **Next options** — quiet, non-binding recommendations that may start a new
   piece of work.

The current record already has useful factual anchors for this: source message,
command run, event/correlation chain, session, automation step/node, project,
agent, and workspace. Those fields must remain factual references; a pleasant
AI-written explanation complements them but must not replace them. The current
generic `proposalType` plus JSON `data` payload also means the dossier needs a
versioned semantic contract before the UI can promise every one of these
readings consistently.

### Proposal families — a small stable vocabulary, not a screen per API verb

| Family | Covers | Primary preview |
| --- | --- | --- |
| **Knowledge** | create/update/merge entities, parent overrides, sources, tags, fields | before → after and object cards |
| **Graph** | create/remove/change relations and multi-entity graph imports | relationship map plus affected-object list |
| **Artifact** | create/update/publish a document, report, or slide deck | actual document/slide preview and publishing consequence |
| **Operational** | automation, playbook, capability, agent configuration | plain-language rule summary, trigger, and affected resources |
| **Access & policy** | workspace access, capability grants, credentials, inherited-policy overrides | exact scope, duration, data/external consequence, and strongest confirmation |
| **External effect** | send, sync, create outside Synap, connector action | destination, recipient/system, payload summary, and irreversibility |

The family chooses the preview renderer. It must not change the action grammar
or remove the dossier. Raw verbs such as `entity.import.graph` remain technical
details, not a human-facing category.

An artifact preview is not automatically a change-control screen. A report or
deck may be read in its native markdown or slide renderer as evidence of the
work. The proposal governs the consequential transition around it—for example
creating a durable shared artifact, replacing a published report, linking it to
the knowledge graph, sending it externally, or activating the automation it
recommends. This avoids turning every useful draft into a permission prompt.

### Atomicity, compound work, and editing boundaries

- A compound proposal is allowed when its operations are one intended outcome
  and must succeed or fail together, for example a researched graph whose
  entities and links are mutually dependent.
- A heterogeneous *work bundle* may contain several independent proposals; it
  is navigated as a unit but is not approved as a unit.
- Excluding or editing an operation is only honest if the backend can recompute
  dependencies, policy, preview, and version. Until then, use `Request changes`
  rather than presenting a fake editable checklist.
- For sensitive access/policy changes, or a graph whose side effects cannot be
  expressed as one stable outcome, split the work into separate proposals.
- The decisive verb should name the real effect when helpful: `Grant access`,
  `Publish report`, or `Create graph`; `Approve` remains the portable governing
  action in history and general-purpose surfaces.

An operational dependency may be **shown** beside a proposal—e.g. “This
automation requires an undecided ECB credential grant”—but two proposals should
not become two side-by-side decision cards. The queue or Work result can show
their relationship; review stays one proposal at a time so focus, keyboard
order, history, and action consequences remain unambiguous.

---

## Core Design Rules

1. **Evidence before decision.** Do not make Apply visually dominant until the
   user can see the plain-language intent, affected objects, and impact.
2. **One default action per row: open it.** Normal queue rows never show a
   permanent cluster of Apply, Reject, policy, and batch controls.
3. **Progressive disclosure.** Start with intent and consequence. Put field
   diffs, provenance, full event history, raw payloads, and diagnostics behind
   named disclosures.
4. **Human governance is ochre.** AI identity is emerald only. Success is sage;
   rejection/error is restrained clay. Color must never be the sole status cue.
5. **A proposal is an object, not a log line.** Use real titles, entity names,
   object types, Space/project/session context, and human-readable operation
   counts. Never lead with identifiers or raw event names.
6. **Bulk is intentional.** No ordinary “Approve all.” Bulk review is an
   explicit mode for homogeneous, low-risk proposals and requires a summary
   confirmation.
7. **Keep the user oriented.** A selected queue row stays selected while its
   inspector is open; live arrivals do not steal focus.
8. **Show the outcome, then let people inspect the work.** The default is a
   human statement of intended state. Session transcripts, automation logs,
   source messages, field diffs, and raw payloads are evidence behind it.
9. **A recommendation is not consent.** “What next?” is visibly separate from
   the proposal's write set and always starts a new, reviewable decision path.

---

## Synap Visual Language — Use Existing Brand, Do Not Invent a New One

Synap Browser is dark-first, warm, quiet, and premium.

- **Materials:** deep brown-black paper, warm raised surfaces, off-white ink,
  fine hairline borders, quiet luminance shifts. No dashboard blue-gray, neon
  purple, glass overlays over reading content, or heavy card shadows.
- **Accents:** ochre = person’s governing choice; emerald = AI attribution only;
  sage = completed/applied; clay = denied/failed; neutral ink for ordinary
  metadata. Use the existing `--synap-*` and `--synap-spatial-*` token system.
- **Type:** Fraunces for true object titles only; Geist/DM Sans style for UI and
  body; mono only for IDs and technical diagnostics. Body must be comfortably
  readable, not micro-label dense.
- **Geometry:** compact but breathable. In-flow surfaces use borders and
  surface contrast for depth. Use existing spatial buttons, chips, checkboxes,
  menus and modals.
- **Accessibility:** keyboard-first desktop behavior; 44px-equivalent
  comfortable decision controls; visible focus rings; no hover-only critical
  information; text plus icon for every status; reduced motion friendly.

---

## Primary Desktop Screen: Review Queue

### Structure

Use a **band · spine · inspector** layout.

```text
┌────────────────────────────────────────────────────────────────────────────┐
│ Review queue                         8 need review     [Filter] [Select]   │
├─────────────── queue spine ──────────┬──────────── inspector ──────────────┤
│ Needs review                          │ [status] [risk] [source] [age]      │
│ • Update Ada’s company record         │ Atlas proposes updating Ada Patel    │
│   Contact · 3 fields · Low risk · 8m  │                                      │
│                                       │ WHAT WILL CHANGE                     │
│ • Link two sources to Market memo     │ A compact before → after summary     │
│   2 links · Medium risk · 12m         │                                      │
│                                       │ WHY THIS NEEDS YOU                   │
│ Failed                                │ Concise agent explanation             │
│ • Retry connector access request      │                                      │
│                                       │ [Apply] [Request changes] [Reject]  │
│                                       │                                      │
│                                       │ ▸ Evidence & provenance              │
│                                       │ ▸ Complete diff                      │
│                                       │ ▸ Activity history                   │
│                                       │ ▸ Technical details                  │
└───────────────────────────────────────┴──────────────────────────────────────┘
```

### Queue band

- Title: **Review queue**; helper only when useful: “AI changes awaiting your
  decision.”
- Primary segment: `Needs review (8)`.
- Secondary history is quiet and not equal visual weight: `Applied`, `Changes
  requested`, `Rejected`; use a history picker or tabs only when there is room.
- A single **Filter** door opens a compact menu/panel: Space, project, session,
  source agent, object type, risk, state, age.
- **Select** is the only batch entry. It is not shown as a primary CTA.
- Do not show global “Approve all,” agent-pill rows, collapse controls, and
  multiple session actions simultaneously.

### Queue spine (the left “sidebar”)

Call it a **queue**, not a sidebar. It is a reading list of decisions, not app
navigation.

Each standard row has only:

```text
[status/risk icon]  Plain-language intent
                    Target object · compact change count · policy/risk
                    Source agent / session                         age
```

Examples:

- “Create 5 companies from the uploaded list”
- “Merge duplicate contacts: Dave Sutter and David Sutter”
- “Grant Claude access to the GitHub token”
- “Update Market memo with 3 verified sources”

Rules:

- Maximum two text lines plus one compact metadata line.
- A selected row gets only an ochre inset rail and raised surface; it is not a
  loud filled card.
- Use status/risk labels such as `Needs review`, `Failed to apply`, `Changed`,
  not color dots alone.
- No persistent inline Apply / Reject / “always allow” icon cluster.
- Long names truncate in the queue but are complete in the inspector.
- Group only when there is a meaningful user-owned unit such as a named focus
  session. A group header says “12 changes from Market research” and opens that
  lens; it does not offer “Approve 12.”

### Inspector — disclosure ladder

The inspector renders **one proposal**.

1. **What is proposed**
   - Plain-language intent title.
   - Agent/source, where it will happen, age, decision state, risk and
     reversibility in compact factual chips.
2. **What will change**
   - One-sentence impact statement.
   - Before/after properties, object cards, relation cards, or a compact
     operation summary appropriate to the proposal kind.
3. **Why it needs the user**
   - The declared goal, concise agent reasoning, policy condition, confidence
     where meaningful, and externally-visible consequence.
4. **Decision bar**
   - `Apply` (ochre), `Request changes` (secondary), `Reject` (clay/secondary).
   - Adjacent consequence copy, e.g. “Creates 3 entities in Research. Reversible
     from history.”
   - Ask AI is a quiet secondary door, never competing with the decision.
5. **Evidence & provenance** (collapsed)
6. **Complete diff** (collapsed; detailed operations/property choices)
7. **Activity history** (collapsed; proposed → revised → decided → applied)
8. **Technical details** (collapsed; IDs, payload, diagnostic copy action)
9. **What you could do next** (quiet and visibly non-binding; opens a new work
   or proposal flow, never silently extends this approval)

### Work result — peer view, not an expanded queue row

Use this only for an intentional Work/session/run lens. It renders one Work:

1. **Goal and trigger** — the request or automation condition that began it.
2. **What happened** — concise factual work summary, including omitted or
   unverified material when known.
3. **Results** — related proposals, saved artifacts, and findings; each keeps
   its own state and opens its canonical detail.
4. **Evidence and activity** — source material, run steps, and durable event
   chain behind disclosure.
5. **Possible next work** — distinct recommendations that start a new flow.

Never use a Work result as a permission screen. A proposal is selected before
Apply, Request changes, or Reject becomes available.

For a compound proposal, show operation-level comments/exclusions in Complete
diff before final Apply only once partial editing has server-side dependency
recalculation. Before that, use Request changes. Do not imply that a
heterogeneous bundle can safely be approved in bulk.

---

## Required High-Fidelity Screens

Create all of these in the same desktop Browser shell, at approximately
1440–1600px width. Include annotated states where requested.

1. **Quiet review queue** — a mixed but manageable queue; selected low-risk
   update; no batch controls exposed.
2. **High-impact proposal** — vault access, destructive change, or external
   send. Show strong risk language, exact consequence, and evidence before
   decision. Do not rely only on red.
3. **Compound proposal** — a research import creating several entities/links.
   Show the inspector’s Complete diff open with one operation excluded or
   commented on; final decision remains visible but contextual.
4. **Request changes** — user asks the agent to revise a proposal. Show a
   required concise reason, the proposal moving to `Changes requested`, and a
   later revised version linked by timeline.
5. **Apply failed / stale** — a previously approved write cannot apply because
   its target changed. Show the specific item in `Failed`, explain what changed,
   and offer `Review latest`, `Retry` only when safe, `Ask AI`, and `Reject`.
6. **Explicit batch mode** — user deliberately enters Select, chooses six
   homogeneous low-risk tag suggestions, and sees a bottom summary bar:
   “Apply 6 tag suggestions across 6 notes.” The confirmation lists scope and
   makes partial failures report per item.
7. **Inbox handoff** — Inbox shows a semantic proposal preview, e.g. “Atlas
   proposes merging two duplicate contacts,” then opens the Review Queue with
   that proposal selected. Inbox remains attention triage, not an expanded diff.
8. **Narrow layout** — at narrow desktop width, list is shown first; selected
   detail replaces it with a Back-to-queue control and a persistent decision
   bar. Do not squeeze a 340px queue and full inspector into an unreadable width.
9. **Work-to-change dossier** — one research session produces a coherent graph
   proposal. Show the trigger, goal, concise work summary, an entity-and-link
   preview, evidence, and a quiet suggested next step to create a monitoring
   automation. The suggestion must clearly be outside the proposed write set.
10. **Operational proposal** — an AI proposes both a playbook and automation.
    Show whether this is one atomic configuration outcome or two separately
    reviewable proposals; when separate, show their dependency in the Work
    result or queue, then review each in the normal inspector—not as two
    simultaneous decision cards. Make access scope, trigger, and downstream
    effects legible without revealing raw configuration first.

---

## Interaction and State Requirements

- Keyboard: `j/k` moves queue focus; `Enter` opens; `/` focuses filtering;
  guarded shortcuts can open Apply/Reject but never execute a destructive choice
  without confirmation or context.
- Live updates: new proposals increment the queue without replacing a deliberate
  selection. A changed/stale proposal visibly invalidates an old decision.
- Empty: “Nothing needs review” with a quiet explanation, not a celebratory
  dashboard.
- Loading/error: preserve the list/detail shape; retry only the failed request.
- Policy: reviewer authority is factual, server-enforced, and explained when an
  action is unavailable.
- History: outcomes read as history, never as live decision rows.
- Readability: body content has breathing room and readable line length; metadata
  must not be the dominant visual texture.

---

## Explicit Anti-References

Avoid generating:

- a dense admin data table;
- three competing toolbars or a wall of tiny icon buttons;
- “Approve all” as a default primary action;
- a notification dropdown expanded into a full page;
- a generic kanban/dashboard treatment;
- AI purple, large glows, decorative glass, or rainbow object identity;
- raw type names such as `entity.import.graph` as the human-facing title;
- every piece of provenance, event history, and diagnostic detail open by
  default.

## Deliverables From the Designer

- Eight high-fidelity frames above, dark-first, with one light-mode check frame.
- A component callout sheet for queue row, status/risk badge, operation summary,
  inspector decision bar, disclosure section, and batch confirmation bar.
- Notes for desktop, narrow layout, keyboard focus, loading, empty, changed,
  failed, and disabled/review-permission states.
- Do not redesign the global Browser shell, settings, or lens composer. This is
  a focused review-flow exploration.
