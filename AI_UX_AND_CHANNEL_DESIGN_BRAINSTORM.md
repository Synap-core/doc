# AI UX & Channel-Centric Design — Brainstorm & Validation

**Purpose:** Capture the target UX for how users interact with AI (explicit vs delegated), user-created personalities, and a channel-centric mental model. Then list what to validate and what to compare against the current system before production.

---

## 1. What You're Aiming For (Summary)

### 1.1 Two Ways to Use AI

| Mode | Description | UX |
|------|-------------|-----|
| **Explicit** | User chooses a **specific AI** — e.g. "Content AI" with its own data and behavior, tuned for content creation. Like pinging a specific team member who is the expert. | User reaches that AI directly (e.g. channel list, command palette, "New channel with…"). |
| **Delegated** | User talks to **Personal AI** or **Space AI** (orchestrator). That AI **decides** when to hand off to a sub-personality (e.g. content creation) based on what the user said. Same capabilities, but the main AI does the routing. | One entry point; user doesn't have to pick the expert — the system does. |

**Design intent:** Support **both**. Users who always want "just my AI" still get full power; the personal/space AI chooses when to switch or call sub-agents. Users who want to "talk to the CTO" or "talk to Content AI" can do that explicitly.

### 1.2 User-Created Personalities (Override Layer)

- **Idea:** Let users create **their own personality** that works on **any** intelligence service.
- **Behavior:** Acts like an **override**: custom prompting, maybe tool allowlist/denylist, protocol behavior (e.g. always propose vs auto-approve certain actions).
- **Integration:** The intelligence service receives this as configuration (e.g. `agentConfig` or a "personality template") and applies it without needing new code — same runtime, different instructions and constraints.
- **Open question:** What **standard or contract** do we need so that (a) the Data Pod can store and validate user personalities, and (b) any compliant Intelligence Service can honor them?

### 1.3 Channel-Centric System (Slack/Discord Mental Model)

- **Channels as first-class:** Strong channel model, like Slack or Discord. Everything is a channel.
- **Private messages = user ↔ one AI:** User–AI conversations are treated as "private" channels: one human, one AI. (With optional rights: e.g. workspace admin can see all PMs.)
- **AI can still:** Call sub-agents, create branches/threads, delegate — but from the user's perspective they're in a **channel** with a given AI.
- **Channel list UX:**
  - Slack-like list: sections, grouping (e.g. "Personal", "Content", "Team", "Branches").
  - User sees their AI personalities (Content AI, CTO, etc.) and can **open or create a channel** with the AI they want.
  - "New channel with [AI name]" is a primary action.

So: **reach a specific AI like reaching a specific person** — same muscle memory as team chat.

---

## 2. Refined Principles

1. **One entry point or many:** Both "single AI that delegates" and "direct to expert" must be supported; UX should make both easy and non-confusing.
2. **Personalities as overrides:** User-defined personalities are configuration (prompt, tools, protocol hints), not new agent code; they run on any intelligence service that implements the contract.
3. **Channels = conversations:** Every user–AI conversation is a channel; channel list is the home for "who do I talk to" (humans + AIs).
4. **Consistency with team chat:** If we later add human–human or human–group channels, the same list and "new channel" pattern apply.

---

## 3. What to Validate (Checklist)

### 3.1 Product & UX

- [ ] **Entry points:** Where does the user start a conversation? (Command palette, sidebar channel list, "Ask AI" from context, deep link.) Are "Personal AI" vs "Content AI" vs "New channel with…" clearly distinct?
- [ ] **Channel list design:** Sections (e.g. Personal, By capability, Branches), ordering (pinned, recent, alphabetical), "New channel" with AI picker. Matches mental model "like Slack/Discord"?
- [ ] **Discovery:** How does a user discover available AIs/personalities? (Catalog, workspace settings, first-time hints.)
- [ ] **Delegation transparency:** When Personal/Space AI hands off to a sub-agent, should the user see "Switched to Content AI" or keep a single face? Trade-off: simplicity vs clarity.

### 3.2 User-Created Personalities (Override Contract)

- [ ] **Schema:** What does a "personality override" contain? (e.g. `name`, `systemPrompt` or `instructions`, `personality` blob, `toolAllowlist` / `toolDenylist`, `protocolHints` like `writesRequireProposal`.)
- [ ] **Storage:** Where is it stored? (Backend: e.g. workspace-scoped or user-scoped table; linked to channel template or to "agent config" per channel.)
- [ ] **Validation:** What must the Backend validate? (Length limits, no code execution, allowed tool names from a known set, sanitization of prompt text.)
- [ ] **Protocol:** How does the Backend send it to the Intelligence Service? (Already: `agentConfig` on channel; extend with `personalityOverrideId` or inline config; Hub Protocol contract.)
- [ ] **Service compatibility:** What must an Intelligence Service implement to "honor" a user personality? (Read `agentConfig` / override; apply to system prompt; restrict tools; respect protocol hints.) Document as a **contract** so multiple IS implementations can support it.

### 3.3 Channel Model & Permissions

- [ ] **Channel types:** Today we have `AI_THREAD`, `BRANCH`, `DIRECT`, etc. Do we need an explicit "personal" vs "workspace" vs "user–AI PM" distinction in the type or in metadata?
- [ ] **Rights:** "We can see all private messages" — is this workspace admin, pod admin, or configurable? Any audit requirements?
- [ ] **Identity:** Is "one man, one AI" per (user, agentType/personality) or per (user, channel)? (One channel per pair keeps model simple.)

### 3.4 Intelligence Service Contract

- [ ] **Agent type string:** Already free-form (`agentType`). User-created personalities: map to `agentType: "persona:user:<id>"` or pass as overlay only (no new agent type)?
- [ ] **Override precedence:** Order of application: base agent (e.g. Orchestrator) → channel `agentConfig` → user personality override. Document and test.
- [ ] **Tools:** Override can restrict tools; IS must only expose allowed tools. Validate tool names against a pod-provided or IS-known list.

### 3.5 Standards / Interop

- [ ] **No single standard required for v1:** User personalities can be Synap-specific (JSON schema + Hub Protocol). Later: consider export/import or compatibility with other systems if needed.
- [ ] **Versioning:** Schema version for personality override so we can evolve it without breaking older IS or pods.

---

## 4. Comparison With Current System (High Level)

*To be filled in when we do the gap analysis; bullets below are starting points.*

### 4.1 Already in Place

- **Orchestrator vs Personas:** OrchestratorAgent (workspace, delegates) and PersonaAgents (CTO, Marketing, etc.) exist; Orchestrator can `dispatch_agent` to specialists.
- **Channels:** Backend has channels (AI_THREAD, BRANCH, etc.); listChannels by workspace; personal channel (e.g. `ensurePersonalChannel`) with `agentType: "personal"`.
- **agentConfig overlay:** Channel can carry `agentConfig` (name, personality, instructions); IS applies it before execution. Good base for "override."
- **Agent registry:** `getAgentForType(agentType)`; `persona:*` pattern; unknown → Orchestrator. So "user personality" could be overlay-only or `persona:user:<id>`.

### 4.2 Gaps to Address (Preliminary)

- **UX:** Channel list is not yet "Slack-like" (sections, "New channel with AI", clear separation of Personal vs explicit personalities). Entry points may need tuning so "Ask AI" (Tab) and "Create note" don’t overwhelm; "Open channel with Content AI" is explicit.
- **User-created personalities:** No first-class "personality" entity in the Backend yet; `agentConfig` is per-channel, not a reusable template. Validation and storage for overrides (prompt, tools, protocol) need definition.
- **Contract:** No formal "personality override" contract document for IS implementers. Documenting `agentConfig` + optional `personalityOverrideId` and tool allowlist would close this.
- **Personal vs workspace AI:** Distinction exists (PersonalAgent vs OrchestratorAgent, personal channel vs workspace channel); UX to "always use personal" vs "use workspace AI that delegates" may need clearer affordances.
- **Rights on PMs:** "See all private messages" is not implemented; clarify requirement and where it applies (workspace/pod).

---

## 5. Next Steps

1. **Validate checklist (Section 3)** with product/design: agree on entry points, channel list UX, and delegation transparency.
2. **Define personality override schema and contract:** Backend schema + Hub Protocol extension; IS contract (how to read and apply overrides). Then implement validation and storage.
3. **Design channel list and "New channel" flow:** Sections, AI picker, deep links; align with current sidebar/command palette.
4. **Gap analysis:** See **`AI_UX_IMPLEMENTATION_GAP.md`** for a concrete comparison with the codebase and a prioritized task list (Phase 1: explicit vs delegated + channel list; Phase 2: user personalities + contract; Phase 3: polish).
5. **Prioritize for production:** Which of the above is MVP (e.g. both entry modes + channel list) vs later (user-created personalities, rights on PMs).

---

*This document is the brainstorm and validation list. Implementation details and gap-fit tasks will live in a follow-up (e.g. AI_UX_IMPLEMENTATION_GAP.md) once we compare with the codebase.*
