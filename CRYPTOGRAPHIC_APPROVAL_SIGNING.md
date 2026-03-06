# Cryptographic Approval Signing & Blockchain Governance

> Vision document — 2026-03-04

---

## Why This Matters

The existing proposal system records *that* an action was approved. But it doesn't prove
*who* approved it in a way that can be independently verified — by a regulator, an auditor,
a business partner, or even the user themselves after a dispute.

A database row saying `approved_by: user_id` is only as trustworthy as the database.
If Synap's server is compromised, records can be forged. If Synap ceases to operate,
the record is gone. If the user disputes the record, there is no independent arbiter.

**Cryptographic signing** solves the first two problems:
- The approval record includes a digital signature made with the user's private key
- The private key never leaves the user's device
- Any third party can verify: "this exact proposal was approved by the owner of this public key"

**Blockchain anchoring** (optional, additive) solves the third:
- The signature hash is published to an immutable public ledger
- It exists independent of Synap's infrastructure
- It can be verified in perpetuity, even after Synap no longer exists

These are two separate, independently valuable capabilities. Blockchain is not required
for most of the value — but it enables use cases that are otherwise impossible.

---

## What It Brings

### Verifiable governance records
Every approved agent action produces:
```
{
  proposalId: "prop_abc123",
  action: { type: "shell.exec", command: "deploy.sh staging" },
  approvedAt: "2026-03-04T14:32:00Z",
  approverPublicKey: "0x04a1b2...",        // secp256k1 or Ed25519 public key
  signature: "0x3045...",                  // ECDSA/EdDSA signature over proposal hash
  chainAnchor?: { txHash: "0x7f3c...", chain: "base" }  // optional
}
```

Anyone with the public key can verify the signature. No Synap server needed.

### Non-repudiable audit trail
Unlike a database record, a cryptographic signature *cannot be forged by the server operator*.
This is the critical distinction for high-stakes use cases:
- Financial services: "Who authorised this transaction?" → verified by signature
- Healthcare: "Who approved this data access?" → proven by key, not by assertion
- Legal: signed approval as admissible evidence in contract disputes
- Multi-tenant: tenant A's approvals cannot be spoofed by Synap or other tenants

### Wallet-based identity
A user's approval key becomes an identity primitive. This is already the mental model for
millions of crypto wallet users: "my address is my identity." The same key that approves
agent actions can also:
- Sign workspace membership agreements
- Authorise cross-org data sharing
- Vote in governance proposals (see DAOs below)
- Authenticate across services via `Sign-In With Ethereum` (EIP-4361)

### Multi-party governance (organisations)
A single key is fine for individuals. Organisations need multi-party controls:
- "Any C-level can approve" → `k-of-N` multi-sig scheme
- "Both security team and engineering lead must sign" → AND-gate multi-sig
- "A supermajority of workspace admins must approve this policy change" → DAO voting

This is standard in smart contract systems and can be implemented without a blockchain
(using off-chain multi-sig) or with one (on-chain voting contract).

---

## How It Works

### Phase 1: Device-Bound Signing (Web Crypto API)

The simplest implementation uses the browser's native cryptography:

```typescript
// Key generation — runs once per device, key stored in non-extractable form
const keyPair = await crypto.subtle.generateKey(
  { name: 'ECDSA', namedCurve: 'P-256' },
  false,           // ← non-exportable: private key NEVER leaves this device
  ['sign', 'verify']
);

// Exporting the public key for registration
const publicKeyBytes = await crypto.subtle.exportKey('raw', keyPair.publicKey);
// → Send to backend for storage alongside user profile

// Signing an approval
async function signApproval(proposalHash: Uint8Array): Promise<ArrayBuffer> {
  return crypto.subtle.sign(
    { name: 'ECDSA', hash: 'SHA-256' },
    keyPair.privateKey,
    proposalHash
  );
}
```

The private key is stored in the browser's `indexedDB` / OS keystore under
`CryptoKey` non-exportable flag — the browser will use it but will never return its bytes.

**For Electron**, the OS keychain is preferred:
```typescript
import keytar from 'keytar'; // or use Electron's safeStorage
// Generate key → export public key → store private key in OS keychain
// Retrieve + use via Electron main process IPC
```

### Phase 2: Hardware Security Keys (FIDO2 / YubiKey)

WebAuthn's `PRF` extension (2024) and `largeBlob` extension allow hardware keys
to generate and store signing keys:

```typescript
const credential = await navigator.credentials.create({
  publicKey: {
    challenge: serverChallenge,
    pubKeyCredParams: [{ type: 'public-key', alg: -7 }], // ES256
    authenticatorSelection: {
      authenticatorAttachment: 'cross-platform', // YubiKey, etc.
      userVerification: 'required',
    },
    extensions: { prf: {}, largeBlob: { support: 'preferred' } },
  }
});
```

Hardware keys provide the strongest guarantee: the private key is generated on a
tamper-resistant chip, never extractable even by the OS.

Supported hardware: YubiKey 5 series, SoloKeys, Ledger (via FIDO2), Apple Passkeys.

### Phase 3: Blockchain Anchoring (Optional)

Anchoring does not mean "put everything on-chain." It means:
> "Take the hash of the signed approval record and publish it to an immutable public ledger."

Cost: ~$0.001 per transaction on Base (Ethereum L2) or ~$0.0001 on Polygon.
Latency: 2-5 seconds for Base, 1-2 seconds for Polygon.

```solidity
// Minimal anchor contract (50 lines, immutable)
contract ApprovalAnchor {
    event Anchored(bytes32 indexed recordHash, uint256 timestamp, address signer);

    function anchor(bytes32 recordHash) external {
        emit Anchored(recordHash, block.timestamp, msg.sender);
    }
}
```

The Synap backend (or user's wallet) calls `anchor(keccak256(approvalRecord))`.
The `Anchored` event is permanently on the blockchain. Anyone can query it.

**Key insight**: the full approval record (including the human-readable action description)
stays off-chain in Synap's DB. Only the hash goes on-chain. Privacy preserved, verifiability retained.

### WalletConnect v2 + EIP-712 (User's Existing Wallet)

For users who already have MetaMask, Coinbase Wallet, or a hardware wallet, they can
use their existing key to sign approvals:

```typescript
import { createWalletClient, custom } from 'viem';
import { mainnet } from 'viem/chains';

const client = createWalletClient({
  chain: mainnet,
  transport: custom(window.ethereum)
});

// EIP-712 typed data signing — shows human-readable description in wallet UI
const signature = await client.signTypedData({
  domain: { name: 'Synap', version: '1', chainId: 1 },
  types: {
    ApprovalRecord: [
      { name: 'proposalId', type: 'string' },
      { name: 'actionType', type: 'string' },
      { name: 'actionSummary', type: 'string' },
      { name: 'approvedAt', type: 'uint256' },
    ],
  },
  primaryType: 'ApprovalRecord',
  message: {
    proposalId: 'prop_abc123',
    actionType: 'shell.exec',
    actionSummary: 'Run deploy.sh on staging server',
    approvedAt: BigInt(Date.now()),
  },
});
```

EIP-712 is important: it shows the user a *structured, human-readable description* in their
wallet before signing. They know exactly what they're approving. No blind hex signing.

---

## Integration with the Existing Proposal System

Minimal changes to the current system:

```typescript
// Extend the proposal record (JSONB, no migration needed):
interface ProposalApproval {
  userId: string;
  approvedAt: Date;
  // ← NEW:
  approvalSignature?: string;    // hex-encoded ECDSA signature
  signingPublicKey?: string;     // hex-encoded compressed public key
  signingKeyType?: 'web-crypto' | 'webauthn' | 'wallet' | 'hardware';
  chainAnchor?: {
    txHash: string;
    chain: 'base' | 'polygon' | 'mainnet';
    anchoredAt: Date;
  };
}
```

The approval flow:
1. User opens proposal inbox → reviews action
2. Before submitting approval, client generates/retrieves signing key
3. Client signs `keccak256(JSON.stringify({ proposalId, action, timestamp }))`
4. Signature + public key included in `POST /proposals/:id/approve` body
5. Backend stores signature fields in JSONB
6. Optionally: background job anchors to chain

Backward compatible: `approvalSignature` is optional. Existing unsigned approvals remain valid.

---

## Decentralised Autonomous Organisation (DAO) Governance

This is the furthest-future extension. For teams or organisations using Synap as shared infrastructure:

### Governance token model
- Each workspace member holds governance tokens (off-chain, no crypto purchase needed)
- Tokens are earned through activity (contribution, tenure, role)
- High-stakes workspace changes (new admin, billing change, data export) require a vote
- Token holders vote; the smart contract executes the winning outcome automatically

### On-chain workspace constitution
```solidity
// Workspace governance contract
contract WorkspaceGovernance {
    uint256 public quorum = 60;         // 60% participation required
    uint256 public approvalThreshold = 51; // Simple majority
    mapping(address => uint256) public tokens;

    function propose(bytes32 actionHash) external returns (uint256 proposalId);
    function vote(uint256 proposalId, bool support) external;
    function execute(uint256 proposalId) external; // callable after vote passes
}
```

### When does this make sense?
- Multi-founder startups: neither founder can unilaterally take a destructive action
- DAOs using Synap as their ops platform: governance is native to their workflow
- Enterprise consortiums: multiple organisations share a workspace, none can override others
- High-compliance sectors: every configuration change has a verifiable vote record

### What it does NOT mean
- Users do not need to buy cryptocurrency
- Tokens are not traded or financialised (unless the organisation wants that)
- No gas costs for voting (off-chain signature-based voting with on-chain execution)
- The DAO layer is an optional module, not the default

---

## Limits

### Key management complexity
The hardest problem in cryptography is "what happens when you lose your key?"

Mitigation strategies:
- **Social recovery**: 3-of-5 trusted contacts can re-issue a new key (same pattern as Argent wallet)
- **Multi-device**: each device registers its own key; any device can approve; keys rotate on revoke
- **Guardian service** (opt-in): Synap holds an encrypted key shard as a recovery path — user must explicitly enable

### User mental model
"Sign this" has bad UX associations (crypto scams, wallet drains). The language must be
carefully designed:
- Never say "sign" — say "verify" or "confirm"
- Always show what is being signed in plain English
- EIP-712 structured data in wallet shows the actual fields, not hex
- Onboarding must explain what a "signing key" is without using the word "wallet"

### Blockchain is NOT necessary for most value
Starting with on-chain anchoring adds infrastructure complexity (wallet connection,
gas handling, chain choice) for marginal benefit on most use cases. The right order:

1. **Device-bound signing** (Web Crypto) → maximum value, minimal complexity
2. **WebAuthn hardware keys** → stronger for enterprise
3. **Blockchain anchoring** → opt-in, for organisations that need public verifiability

Do not let the blockchain future-vision block the cryptographic signing present.

### Jurisdiction and compliance
Cryptographic approval records can *satisfy* many compliance requirements. But some
jurisdictions have specific requirements about what constitutes a "legally valid" electronic
signature (EU eIDAS, US ESIGN Act). Device-bound keys may not meet the highest tier
("Qualified Electronic Signature") without a certified CA. This is worth legal review
before marketing as "legally binding." Web Crypto / FIDO2 typically satisfies "Advanced
Electronic Signature" which covers most business use cases.

---

## Extensibility & Future-Proofing

### Composable trust levels
Each signing method produces a verifiable credential with a trust tier:
- `web-crypto-device`: device-bound, non-exportable (baseline)
- `webauthn-platform`: Secure Enclave or TPM-backed (strong)
- `webauthn-hardware`: dedicated security key, e.g. YubiKey (stronger)
- `hardware-wallet`: HSM or Ledger-class device (strongest)

Backend policy can require a minimum tier for specific action types:
```typescript
const TIER_REQUIREMENTS: Record<ActionType, SigningTier> = {
  'shell.exec': 'webauthn-platform',
  'db.drop': 'webauthn-hardware',
  'workspace.delete': 'hardware-wallet',
};
```

### Cross-org approval chains
A signed approval by Org A can be included in a proposal to Org B:
"I (Org A) approved that this AI acted on my behalf, and Org B accepted this action."
This creates verifiable cross-org audit trails without any shared infrastructure.

### Zero-knowledge proofs (future)
A ZK proof can verify that an approval was made by someone with a role (e.g. "a workspace
admin") without revealing *which* admin. This enables:
- Privacy-preserving governance (vote without identity disclosure)
- Regulatory compliance without exposing internal personnel structure to auditors

### Decentralised identity (DID) integration
W3C Decentralised Identifiers (DIDs) map signing public keys to verifiable identity claims
(name, organisation, role, certification). A DID-backed approval record says not just
"this key signed it" but "this key belongs to a verified person at Company X with role Y."
This is the foundation of self-sovereign identity.

---

## What It Means for Us

**Enterprise sales unlock**: The first question from enterprise security teams is always
"give me a non-repudiable audit trail." A cryptographically signed proposal record with
optional blockchain anchoring is a better answer than any SOC 2 certificate.

**Web3-native customers**: A significant segment of AI-forward companies (crypto protocols,
DeFi, DAOs) already think in terms of wallets and signed transactions. Synap becomes native
infrastructure for them — not a conversion, just integration.

**Regulatory moat**: GDPR, HIPAA, and financial regulations increasingly require demonstrable
controls on AI-generated actions. A cryptographic audit trail is harder to satisfy with software
controls alone. This positions Synap as the defensible choice for regulated industries.

**Composable identity**: User signing keys can anchor to a broader identity graph. Today:
approve an agent action. Tomorrow: countersign a contract, verify a data access request,
join a cross-org consortium. The key is the foundation; uses compound over time.

**Not just a feature — a stance**: Offering cryptographic signing communicates that Synap
believes AI governance should be verifiable by parties *other than Synap*. That is a trust
asymmetry in the user's favour that most SaaS companies would never accept.

---

## What It Means for Users

**Sovereignty**: "My approvals are mine. Synap cannot forge them, cannot revoke them, and
cannot lose them." This is a qualitatively different relationship with a software product
than users are accustomed to.

**Verifiability**: Users can prove to their employer, auditor, or counterparty that a specific
action was approved by them at a specific time — without relying on Synap's testimony.

**Portability**: If a user leaves Synap and needs to reconstruct their approval history,
their signed records are self-verifying. They don't need Synap to issue a "certified export."

**Composability** (advanced users): The same signing key can participate in multi-sig schemes,
DAO votes, and cross-org governance. Users who think in these terms will recognise
immediately that Synap is building towards an open standard, not a walled garden.

**Progressive onboarding**: Most users will never think about any of this. They press a
button, their AI gets approved, things work. The cryptographic layer is invisible until
needed — and when it is needed, it is already there.

---

## Build Sequencing

```
Phase 1 (1–2 weeks): Proposal record extension
  → Add approvalSignature, signingPublicKey fields to proposals JSONB
  → Backward compatible, unsigned approvals remain valid
  → Backend: verify signature on receive (optional, warn-only initially)

Phase 2 (2–3 weeks): Web Crypto device signing
  → KeyManager service: generateKeyPair, sign, registerPublicKey
  → Key stored in IndexedDB (non-extractable CryptoKey)
  → Approval flow: sign before submit → signature included in API call
  → UI: "Approve" button becomes "Sign & Approve"

Phase 3 (2–3 weeks): WebAuthn integration
  → Registration flow (one-time per device)
  → Sign approvals with FIDO2 credential
  → Works with Touch ID, Face ID, Windows Hello, YubiKey

Phase 4 (optional, 1 week): Blockchain anchoring
  → Background job: POST approval hash to Base/Polygon
  → Store txHash in proposal record
  → Optional user-facing toggle: "Anchor to blockchain"

Phase 5 (future): WalletConnect + EIP-712
  → User brings their existing wallet
  → EIP-712 shows structured human-readable description before signing
  → Signer address becomes permanent part of approval record

Phase 6 (future): Multi-sig + DAO governance
  → k-of-N admin schemes for workspace-level actions
  → On-chain voting contract (optional, for organisations that want it)
```
