# Biometric-Gated Terminal Commands & Agent Approvals

> Vision document — 2026-03-04

---

## Why This Matters

Every powerful system has a fundamental tension: **capability vs. accountability**.
The more your AI agent can do — execute shell commands, modify files, send messages,
deploy infrastructure — the greater the need to prove that *a specific human* authorised
each action, at *that moment*, and knew what they were approving.

Passwords, API keys, and click-through dialogs all fail this test:
- They can be phished, leaked, or auto-clicked.
- They produce no reliable binding between the human and the action.
- "Did the user really mean to run `rm -rf /`?" is unanswerable after the fact.

Biometric authentication — Touch ID, Face ID, Windows Hello, WebAuthn — is fundamentally
different. The private key *never leaves the secure enclave*. The sensor lives on the
device in front of the user. The authentication event is *physically co-located* with the
human approving the action. That is a qualitatively stronger security primitive.

---

## What It Brings

### 1. Non-repudiable approvals
Each biometric event produces a hardware-signed assertion (`authenticatorData` + ECDSA
signature in WebAuthn). The user cannot later claim "I didn't approve that `rm` command."
The audit log can include the signed payload, verifiable by anyone with the public key.

### 2. Phishing-resistant by design
Unlike passwords or TOTP codes, biometric data is never transmitted. The OS handles the
match entirely on-device. A compromised Synap server cannot extract biometrics or forge
approvals. Even if the entire control plane is breached, signed approvals from users
remain valid — and fake approvals cannot be manufactured.

### 3. Frictionless for routine actions, hard for dangerous ones
Click-to-approve is fine for creating a document or tagging an entity. But for "delete
this entity", "run this shell script", or "deploy to production", the user should feel
a *moment of deliberateness* — not just a checkbox. A fingerprint or face scan provides
exactly that: undeniable, low-effort, but physically conscious.

### 4. Enterprise-grade audit trail
For compliance (SOC 2, ISO 27001, HIPAA), the question is always *"who authorised what?"*
Biometrically-signed approval records answer this with hardware-level certainty.
This transforms Synap's governance system from "good enough" to "audit-ready."

---

## Risk Tiers

| Risk Level | Examples | Gate |
|------------|----------|------|
| **Read** | Search, recall, list | None — instant |
| **Write** | Create entity, send message | Click-to-approve (inbox) |
| **Sensitive** | Shell command, file write outside workspace, API call with credentials | **Biometric** |
| **Destructive** | Delete entity/document, terminate process, drop table | **Biometric + confirm dialog** |
| **High-value delegated** | "Approve next 10 sensitive actions for 30 minutes" | **Biometric + time-bound token** |

These tiers map directly onto the existing proposal system:
- `autoApproveFor` whitelist → Read (no gate)
- Current inbox approval → Write
- New: `requiresBiometric: true` flag on proposal → Sensitive/Destructive gate

---

## How It Works

### Electron (Desktop Browser)

```typescript
import { systemPreferences } from 'electron';

// Main process — invoked via IPC from renderer
async function requestBiometricApproval(reason: string): Promise<boolean> {
  try {
    await systemPreferences.promptTouchID(reason);
    return true;
  } catch {
    return false; // User cancelled or hardware unavailable
  }
}
```

`systemPreferences.promptTouchID` uses the Secure Enclave on macOS (Touch ID / Apple Silicon).
On Windows, the equivalent is `SystemAuthenticationContext` via PowerShell IPC or the
[Windows Hello API](https://learn.microsoft.com/en-us/windows/security/identity-protection/hello-for-business/).

The IPC flow:
1. Renderer: `window.synap.auth.requestBiometric(reason)` → main process IPC
2. Main: calls `systemPreferences.promptTouchID(reason)` → OS biometric prompt
3. On success: main signs the approval payload with an ephemeral Ed25519 key
4. Returns `{ approved: true, signature, publicKey, timestamp }` to renderer

### Web (Next.js / Progressive Web App)

WebAuthn / FIDO2 handles this natively in every modern browser:

```typescript
// Challenge comes from backend (prevents replay attacks)
const credential = await navigator.credentials.get({
  publicKey: {
    challenge: serverChallenge,
    allowCredentials: [{ id: userCredentialId, type: 'public-key' }],
    userVerification: 'required', // forces biometric, not PIN fallback
    timeout: 60_000,
  },
});
// credential.response.authenticatorData + .signature → send to backend for verification
```

The backend verifies the WebAuthn assertion against the stored public key.
This works with Touch ID, Face ID, Windows Hello, FIDO2 security keys, and passkeys.

### First-time Registration

The user registers their device biometric once per device:
1. Backend generates a registration challenge
2. Browser calls `navigator.credentials.create(...)` → OS prompts biometric enrolment
3. Public key (never the private key) is stored in the backend
4. Per-device: a user can have multiple registered authenticators (laptop + phone)

---

## Delegated Biometric Sessions

One friction point: if the AI needs to approve 15 actions in sequence (bulk import,
automated workflow), asking for Touch ID 15 times is hostile UX. The solution:

**Time-bound delegated sessions:**

```
User biometrically approves: "Allow AI to perform sensitive actions for the next 30 minutes"
  → Backend issues a signed session token (JWT, 30-min expiry, scope: ["sensitive"])
  → During session: actions in scope auto-approve, token checked server-side
  → On expiry or session revoke: back to per-action biometric
```

This is equivalent to `sudo` timestamp caching (`sudo -v` refreshes 5 min window).
The session token is scoped by:
- **Action types**: `["shell.*", "file.write", "entity.delete"]`
- **Duration**: 5 min / 30 min / 1 hour (user chooses at delegation time)
- **Revocable**: `POST /approvals/session/:id/revoke` cancels the session immediately

---

## Limits

### Hardware dependency
Not all devices have biometric hardware. Fallback paths:
1. **Device PIN** (WebAuthn `userVerification: 'preferred'` — falls back to PIN)
2. **TOTP/Authenticator app** (separate factor, less ergonomic but universal)
3. **Email link** (async, for low-urgency destructive actions)

The system must degrade gracefully, not fail hard when biometrics are unavailable.

### User mental model
"My fingerprint to approve an AI action" is new. Initial confusion is likely:
- Clear onboarding: "Touch ID means *you* approved this, not just your password"
- Visual design: biometric prompt must explain *which action* is being authorised
- Escape hatch: "use password instead" for hardware/accessibility issues

### Secure enclave ≠ key storage
`promptTouchID` on macOS only authenticates the user — it does not sign arbitrary data.
To get a signed approval, a separate Ed25519 signing key must be generated and stored in
the OS keychain, unlocked *by* the biometric event. This adds one implementation step.

### Cannot prevent physical coercion
Biometrics prove physical presence, not free will. A sufficiently motivated attacker with
physical access can force approval. For ultra-high-stakes actions (prod DB wipe, fund transfer),
a second-person authorisation policy (admin must countersign) is the correct additional layer.

---

## Extensibility & Future-Proofing

### Pluggable risk evaluators
The risk tier (`read/write/sensitive/destructive`) is determined by a configurable policy
function: `evaluateRisk(action: ProposalAction): RiskTier`. This can be:
- Shipped defaults (shell commands → sensitive, entity.read → read)
- Workspace-level overrides ("treat file.write as destructive for this workspace")
- AI-assisted: `riskScorer` model evaluates novel action types and proposes tier

### Progressive disclosure of proof
Start simple (Touch ID binary: approved/denied). Graduate to:
- **Threshold signatures**: "2-of-3 admins must biometrically approve this deploy"
- **Timestamped receipts**: signed payloads that can be verified independently
- **Cross-device approval**: start action on desktop, biometric approval arrives on mobile
- **Hardware key escalation**: for prod systems, require YubiKey in addition to biometric

### Agent trust levels
Biometric sessions can encode not just actions but agents:
- "I trust Agent Alpha for sensitive actions on this workspace for 1 hour"
- "Agent Beta is never allowed to run shell commands without per-action biometric"
- This creates a fine-grained, user-controlled agent permission matrix

### Integration with WebAuthn PRF extension
The WebAuthn PRF extension (2024 spec) allows deriving a symmetric key from a biometric
event. This enables biometric-encrypted secrets:
- User's API keys encrypted at rest with biometric-derived key
- Key is only accessible while user is physically present
- Even a compromised backend cannot decrypt keys without the user's biometric

---

## What It Means for Us

**Differentiation**: No other AI workspace product offers hardware-attested approval records.
This is a genuine moat — not a feature flag, a cryptographic guarantee.

**Enterprise unlock**: SOC 2 Type II, HIPAA, and financial services compliance all require
demonstrating that privileged actions were authorised by identified individuals. Biometric
signing satisfies this requirement at the technical layer, not just policy layer.

**Trust signal**: Users will *understand* that Synap takes governance seriously when they
see their fingerprint requested for a destructive AI action. It communicates the product's
values — agency and accountability — better than any marketing copy.

**Liability protection**: When something goes wrong (and it will), the biometrically-signed
audit trail shows exactly what was authorised, when, and by whom. This is not just good
engineering — it is legal protection.

---

## What It Means for Users

**Peace of mind**: "My AI can't do anything serious without my fingerprint" is a statement
users can make confidently to their CTO, their auditor, or themselves at 2am.

**Seamless for routine work**: 90% of AI actions (read, search, suggest) require no friction.
The biometric gate appears *only* when it matters — and users will notice its absence when
they see `rm -rf` without a prompt.

**Accountability without blame**: When the AI makes a mistake, the biometric log shows
whether the user approved the specific action or if the AI acted outside its mandate.
This clarifies accountability and reduces the "the AI did it" defence.

**Ownership**: The private key never leaves the user's device. Synap cannot
forge approvals on the user's behalf, even under legal compulsion. This is user sovereignty
at the infrastructure level.

---

## Build Sequencing

```
Phase 1 (2–3 weeks): Electron Touch ID for destructive actions
  → systemPreferences.promptTouchID → IPC → proposal system flag
  → Visible in audit log: "biometric verified"

Phase 2 (3–4 weeks): WebAuthn for web app
  → Registration flow → challenge-response → server verification
  → Per-device key management UI

Phase 3 (2–3 weeks): Delegated sessions
  → "Approve session" dialog → time-bound token → auto-approve in scope

Phase 4 (future): Signed receipts + threshold multi-sig
  → Ed25519 signatures in proposal records → verifiable by third parties
  → 2-of-N admin approval for critical workspace actions
```
