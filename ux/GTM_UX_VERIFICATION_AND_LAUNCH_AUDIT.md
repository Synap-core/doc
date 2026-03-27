# GTM UX Verification & Launch Audit

**Role:** Product owner  
**Goal:** Turn a strong technical product into something that can be **sold** and **reused with pleasure** — not overwhelming, starting from what users like, then going deeper.  
**Date:** March 2026

---

## 1. Current UX Assessment (Product-Owner View)

### What’s already aligned with “sellable & pleasant”

| Area | Status | Why it works |
|------|--------|--------------|
| **Single onboarding flow** | ✅ | One path: Welcome → Connect (or Explore first) → Workspace. No duplicate flows; chooser/creation reused. |
| **“Explore first”** | ✅ | Users can try without connecting a pod; builds workspace locally, connect later. Reduces friction for first touch. |
| **Welcome copy** | ✅ | “Your AI-native workspace browser” is clear. WelcomeIntroModal explains: browser for intelligence, your data your rules, focused contexts. |
| **First-time workspace creation** | ✅ | FirstTimeSetupFlow: "Create your first workspace" → **With AI** (blank workspace, land in chat) or **From Template** (choose templates, optional Connect CP, optional Agent workspace) → creating → done. No OpenClaw in onboarding; activate later from Settings → Intelligence. |
| **Default landing in app** | ✅ | **First-time (just created workspace):** AI path opens with **Intelligence (chat)**. Template path and **returning users:** open with **Home (dashboard)** or workspace `layoutConfig.defaultApp`. |
| **Empty states** | ✅ | EmptyState component + usage in chat (“Start the conversation”), browser (“No tabs open”), memory (“No memory stored yet”). |
| **Design system** | ✅ | Single tokens (radius, spacing), no shadows, borders for depth — consistent and calm. |
| **AI chat structure** | ✅ | Think → tool → talk order documented; steps/proposals in one place; production checklist (branch card, tool disclosure, proposals) addressed. |

### Where complexity can overwhelm (and what to verify)

| Area | Risk | Action |
|------|------|--------|
| **WelcomeIntroModal: 3 slides** | First-time users may skip or forget. Concepts (Data Pod, Space, Workspace) are dense. | Verify: Is “What is Synap?” enough for re-discovery? Consider one hero slide + “Learn more” for the rest. |
| **FirstTimeSetupFlow steps** | method → templates → connect-cp → openclaw → agent-workspace → creating → done. Many steps for “I just want to start.” | Verify: Can “PKM by default + Create” be a single step for a “quick start” path? |
| **Web landing (synap-app)** | Landing is sign-in / connect server. No “what is Synap” or single value prop above the fold. | Verify: Does the web app need a short value line + “Sign In” like the browser’s welcome? |
| **Sidebar app count** | Dashboard, Browser, Terminal, Whiteboard, Document, Data, Views, Intelligence, etc. Many icons at once. | Verify: Is the full list the first thing we want? Or “Home, Browser, Data, Intelligence” + “More” for the rest? |
| **Two surfaces (browser vs web)** | Browser has full onboarding + Explore first; web has auth + redirect. Flows differ. | Verify: Document which flow is “primary” for GTM (browser-first vs web-first) and align messaging. |
| **Chat-first vs dashboard-first** | Docs describe chat-first workspace generation; default open is dashboard. | Verify: For “pleasant reuse,” is dashboard-first correct, or should first-time open be Intelligence/chat? |

---

## 2. User Flow Verification Checklist

Use this to verify each flow end-to-end before launch.

### 2.1 Browser — New user, “Connect my Data Pod”

- [ ] Welcome (step 0): “Connect my Data Pod” + “Explore first” visible; “What is Synap?” opens intro modal.
- [ ] Pod setup (step 1): Control Plane “Sign in with Synap” or self-hosted URL; no dead ends.
- [ ] After auth: Loading → workspace list. If 0 workspaces → FirstTimeSetupFlow. If 1 → auto-select. If N → WorkspacePicker.
- [ ] FirstTimeSetupFlow: **Method** "Create your first workspace" → **With AI** (creates blank workspace, enters app with Intelligence/chat open) or **From Template** (choose one or more templates, no pre-selection; then optional Connect CP, optional Agent workspace) → Creating → Telegram (optional) → Done → AppShell.
- [ ] AppShell: **First-time AI path** = **Intelligence (chat)** open. **Template path / returning user** = **Home (dashboard)** or workspace default. Sidebar shows apps; no blank or broken state.

### 2.2 Browser — New user, “Explore first”

- [ ] Skip pod → complete onboarding → anonymous/local mode.
- [ ] WorkspaceCreationPopup appears (cannot dismiss until workspace created or user closes).
- [ ] Anonymous onboarding chat / workspace proposal path works (CP endpoint + IS propose_workspace).
- [ ] After creation: AppShell with local workspace; user can connect pod later.

### 2.3 Browser — Returning user

- [ ] Onboarding completed; pod connected. WorkspaceInitializer fetches workspaces.
- [ ] Single workspace → auto-select, no picker. Multiple → picker only if no valid activeWorkspaceId.
- [ ] No double loading (see BROWSER_ONBOARDING_FLOW_AUDIT: chooser vs step 2).

### 2.4 Web app — Signed-in user with pod

- [ ] Landing: handshake when userConfig.podUrl → redirect to pod `/api/auth/exchange?token=…&return_to=/workspace`.
- [ ] No pod: “Sign In / Sign Up” and “Connect Server” (self-hosted). Clear error if handshake fails.

### 2.5 AI chat (browser or web)

- [ ] Steps (think / tool / talk) visible during streaming (renderBeforeContent + store sync).
- [ ] Proposals below message; branch card “View branch” / “Open in panel” when available.
- [ ] Empty state: “Start the conversation” + short subtitle.
- [ ] Error: bar + “Try again”; no blank screen.

---

## 3. What We Might Deactivate or Simplify for GTM

**Principle:** Ship one “happy path” that feels complete; hide or defer the rest.

| Item | Option A: Deactivate | Option B: Simplify | Recommendation |
|------|----------------------|--------------------|-----------------|
| **Terminal app** | Hide from activity bar for “non-developer” build or setting. | Keep in “More” or behind developer mode. | Option B: keep, but not in first 4 icons. |
| **Agent OS / addon welcome** | Don’t show addon welcome screen at all for first 30 days. | Show only once per addon; dismissible. | Option B. |
| **OpenClaw step in FirstTimeSetup** | Skip step if CP not configured or user is “quick start”. | Single line: “Connect AI later” with link to settings. | Option B: one line, skip by default. |
| **Multiple workspace picker** | Always auto-select first workspace; switcher in sidebar. | Keep picker only when explicitly “Switch workspace”. | Keep picker but avoid showing it on every launch once we have a “last workspace” (already done). |
| **Workspace creation: Agent workspace toggle** | Remove for v1. | “Add an Agent workspace later” in settings. | Option B. |
| **Welcome intro: 3 slides** | Only 1 slide: “A browser built for intelligence” + Get started. | Keep 3 but add “Skip” on first slide (already there). | Option A for first launch: one slide; “Learn more” in app or help. |
| **Profiles / property definitions in sidebar** | Hide under “Data” or “Settings”. | Show only when workspace has multiple profiles. | Option B. |

---

## 4. “Start with What Users Like” — Concrete Choices

- **First screen after onboarding:**  
  - **First-time, “Create with AI” path:** User lands in **Intelligence (chat)** — chat-first, workspace grows from conversation.  
  - **First-time, template path / returning user:** User lands on **Home (dashboard)** (or workspace `layoutConfig.defaultApp`).  
  So we start with what they chose (AI = chat) or with the familiar dashboard.
- **Home dashboard (returning users):** Can add a button to open chat as side panel, or show bento grid with AI chat in side panel (see CHAT_FIRST_WORKSPACE_AND_SIDE_PANEL.md).
- **First CTA in product:** “Open Workspace” or “Go to Data” from dashboard (or template default view) so the first click leads to value (their data / views), not setup.
- **Progressive depth:**  
  - Surface: Home, Browser, Data, Intelligence.  
  - Next: Views, Whiteboard, Document (from “Data” or “Create”).  
  - Advanced: Terminal, Profiles, Agent OS, Settings.  
  So we don’t overwhelm; we go deeper when they’re ready.

---

## 5. Go-to-Market Readiness Summary

| Dimension | Ready? | Action |
|-----------|--------|--------|
| **One clear value prop** | ✅ | “AI-native workspace browser” + “Your data. Your rules.” — use consistently on landing and in app. |
| **First-run path** | ✅ | Browser: Welcome → Connect or Explore first → Workspace → Home. Verify with clean install. |
| **Web path** | ⚠️ | Verify handshake + redirect; consider one line of value prop on landing (e.g. “Your AI-native workspace in the cloud”). |
| **Empty states** | ✅ | Chat, browser, memory, etc. Have copy and primary action. |
| **Error / offline** | ✅ | Boundaries, reconnect flow, no infinite spinners. Spot-check. |
| **AI transparency** | ✅ | Steps + proposals + branch cards; production checklist in AI_CHAT_UX_LAUNCH_AUDIT. |
| **Reduced clutter** | 🔲 | Apply “simplify or deactivate” table above; decide default visible apps and one-slide welcome. |
| **Production build** | ⚠️ | Icons, signing, INSTALL.md (see browser PRODUCTION_READINESS.md). |

---

## 6. Recommended Order of Work

1. **Verify flows** — Run through Section 2 (browser new/returning, web, chat) on a clean install and in production build.
2. **Pick one welcome** — One-slide intro for first launch; move rest to “What is Synap?” or help.
3. **Simplify FirstTimeSetup** — **Done.** Method = AI or Template. AI path = blank workspace + enter with chat. Template path = choose templates (no pre-selection), optional Connect CP, optional Agent workspace. OpenClaw removed from onboarding.
4. **Define “default visible apps”** — e.g. Home, Browser, Data, Intelligence in activity bar; rest under “More” or secondary.
5. **Align web landing** — One sentence value + Sign In + Connect Server; match browser messaging.
6. **Document “primary surface”** — For sales and support: “We lead with the browser; web is for existing pod users.” (or the opposite, then align.)

---

## 7. References

- `docs/SYNAP_GTM_CONTEXT.md` — Positioning, beachheads, pricing.
- `synap-app/docs/BROWSER_ONBOARDING_FLOW_AUDIT.md` — Onboarding state and routing.
- `browser/electron/renderer/docs/PRODUCTION_READINESS.md` — Packaging, security, first-run.
- `docs/ux/AI_CHAT_UX_LAUNCH_AUDIT.md` — Chat UX and step order.
- `docs/ux/CHAT_FIRST_WORKSPACE_AND_SIDE_PANEL.md` — Chat-first vision and promote-to-main.
