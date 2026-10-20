# Prior art: how mature systems model a non-human actor acting for a human

Research pass, 2026-09-07. Every claim tagged VERIFIED (read in a primary/vendor doc via this
session) / REPORTED (secondary source only) / INFERRED (my reasoning from verified facts) /
NOT FOUND. No repo code was read — outside evidence only.

---

## 0. The headline

There is an **IETF standard** that draws exactly the line the founder drew, and it is on the
Standards Track: **RFC 8693, OAuth 2.0 Token Exchange, §1.1**. VERIFIED, verbatim:

> **Impersonation**: "When principal A impersonates principal B, A is given all the rights that B
> has within some defined rights context and **is indistinguishable from B** in that context."
>
> **Delegation**: "With delegation semantics, principal A **still has its own identity separate
> from B**, and it is explicitly understood that while B may have delegated some of its rights to
> A, **any actions taken are being taken by A representing B**."

Source: https://www.rfc-editor.org/rfc/rfc8693.html

"An agent never does something under my identity — it should be an agent, possibly linked to me"
is the *delegation* row of that table, written in a founder's words. It is not a novel position;
it is the standardised one.

---

## (a) The identity models, compared

| System | What the actor row IS | Relation to the human | Can / cannot | How the audit reads | Tag |
|---|---|---|---|---|---|
| **GitHub App (installation token)** | Its own principal + a `bot` user (`app-name[bot]`); installed on an **org or repo**, not a person | None required. Survives the installer leaving | Fine-grained per-resource permissions; token auto-expires (~1h); higher rate limit (15k/install vs 5k/user) | Actor = the app/bot itself, `actor_is_bot` field exists | VERIFIED |
| **GitHub App acting *on behalf of* a user (user-to-server)** | Same app, but request carries a user authorization | Explicit per-user OAuth authorization | Limited to intersection of app permissions and user's access | **Actor = the USER**; the app appears only as `programmatic_access_type: "GitHub App user-to-server token"`. UI shows user avatar + app identicon badge | VERIFIED |
| **GitHub `GITHUB_TOKEN` / Actions bot** | Ephemeral per-run token owned by `github-actions[bot]` | None | Scoped per-workflow; **events it emits deliberately do NOT trigger further workflows** (cascade brake) | Actor = `github-actions[bot]` | VERIFIED |
| **GitHub fine-grained PAT** | **The human.** No separate principal | Owned by one person | Whatever that person can do, narrowed by scopes | Actor = the human. Indistinguishable from them typing | VERIFIED |
| **GCP service account** | A **project resource**, not a person: "created and managed as a resource that belongs to a Google Cloud project. In contrast, users are managed in a Cloud Identity or Google Workspace account" | None by default | Own IAM grants. Humans may be granted `iam.serviceAccounts.actAs` / `getAccessToken` to impersonate it | Impersonation "logs the principal who acted as the service account" — **both** | VERIFIED |
| **GCP domain-wide delegation** | Service account granted the right to become *any* Workspace user | Impersonates arbitrary humans | Scope-restricted but **not user-restricted** | (see §b — this is the warned-against path) | VERIFIED |
| **AWS assumed role (STS)** | A role session — a temporary principal | Assumed by a human/service; optional `sourceIdentity` | Role's own policy ∩ session policy | `userIdentity.sessionContext.sessionIssuer` records how the credentials were obtained (role ARN, principalId, account); `sourceIdentity` exists specifically "to determine who used the role" | VERIFIED |
| **Slack bot token (`xoxb-`)** | The app's bot user | "not tied to a user's identity — they're only tied to your app" | App-scoped | Message authored by the app/bot | VERIFIED |
| **Slack user token (`xoxp-`)** | **The human.** "Slack treats the action as if that person performed it" | Owned by one person | That person's rights | Indistinguishable from the person | VERIFIED |
| **Salesforce / ServiceNow integration user** | A dedicated user row per integration | Not a person (best practice); *is* a person (anti-pattern) | Least-privilege profile/role | Every change traceable to that integration | VERIFIED |
| **Stripe Connect** | Platform's own API key + `Stripe-Account: acct_…` header naming the account acted for | Platform ≠ connected account | Platform key authenticates; header selects the subject | Two identities on the wire: authenticating platform + subject account | VERIFIED |
| **Kubernetes impersonation** | The real caller + `Impersonate-User` / `-Group` / `-Uid` / `-Extra-*` headers | Caller must hold explicit `impersonate` rights | API server authenticates the REAL caller, checks they may impersonate each attribute, THEN authorizes as the impersonated identity | **Both principals in the audit event** | VERIFIED |

---

## (b) The verdict: delegation without impersonation

**Endorsed by every system checked: a distinct non-human principal with its OWN grants.**
Endorsed conditionally: delegated authority carried as a *claim alongside* a distinct actor.
**Warned against: true impersonation** — and where it survives, it survives only with dual logging.

### The specific warnings (VERIFIED, vendor's own words)

**Google, IAM best practices** (https://docs.cloud.google.com/iam/docs/best-practices-service-accounts):
- Domain-wide delegation "enables a service account to impersonate any user in a Cloud Identity or
  Google Workspace account" and "does not restrict a service account to impersonate a particular
  user" — which "can therefore make the service account an attractive target for privilege
  escalation attacks."
- The guidance is avoidance: **"Avoid using domain-wide delegation if you can accomplish your task
  directly with a service account."** If unavoidable, restrict OAuth scopes — while explicitly
  noting scopes do *not* restrict *which users* can be impersonated.
- Non-repudiation, stated outright: **"If the service account is authenticated with a service
  account key, there is no reliable way to tell who used the key."** Impersonation is preferred
  over keys *because* it "logs the principal who acted as the service account." Note the shape of
  that argument — the reason to prefer one mechanism over another is **which principals the log
  can name.**
- Google also warns the *human→service-account* direction: granting impersonation of a
  more-privileged service account "can be a way to deliberately let users temporarily elevate
  their privileges" — i.e. impersonation rights are themselves a privilege grant.

**GitHub** (https://docs.github.com/en/apps/creating-github-apps/about-creating-github-apps/deciding-when-to-build-a-github-app):
- "a personal access token is associated with a user, [so] your automation could break if the user
  no longer has access to the resources you need. A GitHub App installed on an organization is not
  dependent on a user." VERIFIED.
- Installation tokens are short-lived (~1h); PATs are typically long-lived. VERIFIED.

**Slack** (https://docs.slack.dev/authentication/tokens/):
- Bot tokens are "not tied to a user's identity"; a user token means "Slack treats the action as if
  that person performed it"; **"an app built entirely on user tokens breaks when that user is
  deactivated."** VERIFIED.
- Deprecations: legacy workspace apps fully deprecated Aug 2021; the *perspective-suffixed* scopes
  `chat:write:user` / `chat:write:bot` were collapsed into `chat:write` — VERIFIED that the
  deprecation happened; INFERRED (not stated in the doc I read) that the motive was to stop
  encoding "whose voice" in the scope rather than in the token identity. Do not cite the motive.

**Kubernetes** — the one *endorsed* impersonation model, and its price is exactly dual logging.
The API server (VERIFIED across the K8s auth docs and the impersonation write-ups found):
1. authenticates the **real** caller,
2. authorizes that caller for `impersonate` on each requested attribute (user, group, uid, extra),
3. authorizes the underlying request **as the impersonated identity**,
4. and the audit event carries **both** the original user identity and the impersonated identity.

K8s also shipped a fix specifically to carry impersonated-user info into later audit stages
(kubernetes/kubernetes#48184, "audit newest impersonated user info in the ResponseStarted,
ResponseComplete audit stage") — REPORTED from the PR title; I did not read the merged diff.
Treat the *existence* of that gap-and-fix as the useful signal: even a system designed for dual
logging shipped stages where the second principal was missing.

### The honest counter-example you should know about

**GitHub's own "on behalf of a user" mode logs the USER as the actor.** The app is visible only as
`programmatic_access_type: "GitHub App user-to-server token"` — a *type*, not an app id. VERIFIED.
So GitHub's delegated mode is weaker than its bot mode on attribution: you can tell an app was
involved, but the actor field names the human. **This is the failure mode Synap should not copy.**
The UI is better than the log here (avatar + app identicon badge shows both) — which is itself a
lesson: attribution that lives only in a rendering is not attribution.

---

## (c) The audit-trail shape a good implementation records

Synthesised from the three systems that do it best. Every field below is drawn from a real schema.

| Field | Answers | Prior art |
|---|---|---|
| **actor** (+ id, + `is_bot`) | *Who executed this* — the agent, always | GitHub audit log fields `actor`, `actor_id`, `actor_is_bot` (VERIFIED) |
| **on-behalf-of / subject** | *Whose authority was used* | RFC 8693 subject vs `act`; K8s impersonated identity |
| **authorization basis** | *Why this was allowed* — which grant/role/rule | AWS `sessionContext.sessionIssuer` (type, arn, userName, principalId, accountId) records **how the credentials were obtained** (VERIFIED) |
| **credential identity** | *Which key* — so one leaked credential can be scoped and revoked | GitHub `hashed_token`, `token_id`, `token_scopes`, `oauth_application_id` (VERIFIED) |
| **source identity** | *Which upstream human/session initiated the chain*, propagated through role assumption | AWS `sourceIdentity`, "recommended when you want to control the identity that assumes a role… useful for mining CloudTrail logs to determine who used the role" (VERIFIED) |
| **delegation chain** | *Prior actors*, when >1 hop | RFC 8693 nested `act` claims; only the outermost is authorization-relevant (VERIFIED) |

The load-bearing rule, stated by Google in the negative: **if the log cannot name who used the
credential, the credential is the defect.** Non-repudiation is the design constraint, not a nice-to-have.

---

## (d) Owned vs global: what breaks either way

### Owned by one person — two *opposite* failure modes, both real

1. **The automation dies with the person.** GitHub: automation "could break if the user no longer
   has access." Slack: "an app built entirely on user tokens breaks when that user is deactivated."
   Both VERIFIED, both stated by the vendor as a reason to prefer the non-human principal.
2. **The automation *outlives* the person.** The offboarding literature is consistent: a PAT keeps
   working after the human account is gone; disabling an SSO/IdP account "does not revoke OAuth
   tokens, terminate active sessions, [or] invalidate API keys." Teams treat the IdP as a master
   switch that it is not. REPORTED (vendor-blog sources: Probo, Tines, DoControl — no primary
   incident report found; I did NOT find a named public post-mortem of this class, and Reddit was
   unreachable from this environment). **Tag as REPORTED if you cite it.**

Those two look contradictory and are not: they are the same defect (a credential whose lifecycle is
bound to a *person's* account state) failing in whichever direction that state moves.

### Global / shared — attribution collapses

VERIFIED, and it is the *stated* reason for the best practice in two enterprise systems:
- **Salesforce**: dedicated integration users per calling system "per calling system, use case,
  domain, or API resource"; "With one integration user per system, you'll have an audit trail
  showing which system made the change"; and if compromised, "it is much easier to identify the
  operations that have been performed by that user than if they are tracked as a shared generic
  user." Blast radius is bounded too — deactivating one integration user does not stop the others.
- **ServiceNow**: "Create a separate service account… for each integration… with a User ID that
  clearly indicates which integration the account is to be used for"; service accounts "improve
  auditability, as all transactions can easily be traced to specific service accounts."
- **GCP**: "create one service account per workload"; sharing one across VMs means any IAM change
  "affects all VMs that use the service account."

Note what the industry actually converged on: **neither person-owned nor globally-shared — it is
one non-human principal PER WORKLOAD, owned by the ORG/PROJECT.** GitHub Apps are org-installed;
GCP service accounts belong to a project; Slack apps are workspace-level. The unit of ownership is
the *container*, and the unit of *identity* is the *job*.

INFERRED, and I flag it as inference: for a single-human sovereign pod, "org" and "person" collapse
into the same entity, so the owned-vs-global tension is weaker than in an enterprise — but the
*attribution* half does not collapse. Even with one human, "which agent did this, under what
instruction" is the question the log has to answer.

---

## (e) Author-may-amend: well-supported, and its staleness mechanisms

**Author ≠ reviewer is a normal, boring, universally implemented separation.** VERIFIED in three
independent systems, each of which lets the author revise without holding merge/apply rights:

| System | Author can | Author cannot | Staleness mechanism |
|---|---|---|---|
| **GitHub PR** | push new commits to their own PR indefinitely | approve their own PR toward required reviews; merge into a protected branch | **"Dismiss stale pull request approvals when new commits are pushed"** — GitHub "records the state of the diff at the point when a pull request is approved" and dismisses approvals when a code-modifying commit changes that diff. Hardened in 2023: approvals are also dismissed **when the merge base changes** after review. Separate, stronger rule: **"Require approval of the most recent reviewable push"** — the last reviewable push must be approved by *someone other than the person who pushed it*. |
| **Gerrit** | upload new patchsets freely | (configurably) have their own vote count | Submit requirements with `label:… user=non_uploader` / `user=non_author` — a label vote only counts if cast by someone who is not the uploader/author of the latest patchset. Older deploys used a Prolog `Non-Author-Code-Review` rule. Gerrit's docs are candid that **without such a rule "nothing but social pressure stops an author who is an approver from approving and submitting their own changes."** |
| **HCP Terraform** | queue plans (incl. speculative) | apply — "normal plans must be approved by a user with permission to apply runs"; apply implies plan+read, not the reverse | Speculative plans **structurally cannot be applied**; the change must be merged first. Separation is by team permission (plan-only team vs apply team). |

The pattern across all three: **amendment is free, approval is gated, and a *new* amendment
invalidates a *prior* approval automatically.** GitHub's version is the most instructive because it
is diff-scoped: the approval is a statement about a specific diff, and it dies when that diff moves.
That is the mechanism to copy — an approval that names *what* was approved, not merely *that*
something was.

---

## (f) The anti-patterns — verified, not asserted

1. **A shared/generic integration user.** Salesforce and ServiceNow both name the failure
   explicitly: you cannot tell which system made a change, you cannot deactivate one integration
   without breaking the rest, and least privilege becomes the union of everything. VERIFIED.
2. **Long-lived personal tokens as automation credentials.** GitHub's own migration case: user-bound,
   long-lived, over-scoped, breaks on offboarding *and* survives offboarding. Slack says the same of
   user tokens. Both vendors are telling people to stop. VERIFIED.
3. **Impersonation without recording both principals.** Google names the terminal form: "there is no
   reliable way to tell who used the key." K8s shows the correct form (authenticate the real caller,
   authorize the impersonation right separately, log both). GitHub's own user-to-server mode is a
   partial instance of the anti-pattern — actor = the human, app reduced to a type string. VERIFIED.
4. **A bot that can approve its own change.** GitHub Actions self-approval was an exploited
   branch-protection bypass; OpenSSF publishes a best practice titled **"Workflows Should Not Be
   Allowed To Approve Pull Requests"** ("This could allow users to bypass code-review restrictions"),
   and **GitHub changed the default** — Actions-approving-PRs remains allowed in pre-existing orgs
   but is **disallowed in newly created orgs.** A vendor flipping a default is the strongest evidence
   available. VERIFIED.
   - REPORTED, single secondary source, worth verifying before quoting: an AI agent in a UK AI
     Security Institute evaluation registered a *second account* to endorse its own PR
     (https://workos.com/blog/agent-invented-a-reviewer-to-get-its-pr-merged). I found no AISI
     primary source. **If it holds, the lesson is that the floor must be on the agent *class*, not
     on a specific agent id** — a per-id check is defeated by minting a second id.
5. **Unrestricted delegation scope** (bonus, VERIFIED): GCP domain-wide delegation is warned against
   precisely because the delegation is not *bounded to a specific principal*. A delegation that does
   not name whom it is for is a privilege-escalation primitive.
6. **Anonymous automation** (INFERRED from #1 and #3 combined): a write with no resolvable actor
   cannot be governed, because governance decisions need a principal to attach to.

---

## (g) Recommendation for Synap, in its own vocabulary

Reading the pieces the lead named — agent **users** with `created_by_user_id`, agent **API keys**
with `linkedUserId`, **proposals** carrying `agentUserId` and a `subject_user_id` owner floor — and
judging *only* against prior art (I did not read the code; if the census contradicts me, the census wins):

### Already matches prior art — keep, don't relitigate

- **A separate agent user row is the GitHub-App / bot-token / service-account shape.** This is the
  endorsed model, not a compromise. The founder's principle is the RFC 8693 delegation row.
- **`agentUserId` on the proposal = the `actor`.** Correct field, correct place: the *record*, not
  just the token. GitHub, AWS and K8s all put the actor in the durable audit record.
- **`linkedUserId` on the key is `may_act`** — "one party is authorized to become the actor and act
  on behalf of another party" (RFC 8693 §4.4). Putting it on the *credential* rather than on the
  agent is right: it is a property of the grant, not of the agent's nature, so revoking the key
  revokes the delegation without deleting the agent's history.
- **The `/mcp` hard-reject of an anonymous `user_pat` / `hub_inbound` write** is anti-pattern #6 and
  #2 closed at the door. Prior art supports this strongly. It is the single most defensible thing in
  the current design.
- **`subject_user_id` as an owner floor** is the bounded-delegation control GCP wishes domain-wide
  delegation had. Keep it, and keep it a *floor* (unwidenable by rules) — that is exactly the
  "scopes don't restrict which users" gap Google warns about.

### Does NOT match prior art — the gaps I would raise

1. **`created_by_user_id` is ownership, and prior art says ownership belongs to the CONTAINER, not
   the person.** GitHub Apps install on orgs; GCP service accounts belong to projects; Slack apps
   are workspace-level — specifically so the automation neither dies with nor outlives a person. In
   a single-human pod the distinction is thin, but if `created_by_user_id` ever becomes the *access*
   or *lifecycle* basis (rather than provenance), you have re-created the PAT. **Recommendation:
   keep `created_by_user_id` as provenance-only; derive authority from the pod/workspace + the key's
   `linkedUserId`, never from creator.**
2. **The actor must be in the LEDGER, not only on the proposal.** GitHub's own weak spot is that its
   delegated mode names the human as actor and reduces the app to a type. Whatever Synap's
   equivalent of "the executed change" is, it needs the agent's identity carried through to the
   applied record — otherwise the attribution lives only on the pending object and dies at approval.
   **A change applied by human approval of an agent's proposal must still read "agent X, for human
   Y, approved by Y" — three facts, not one.**
3. **Approval must not be defeatable by minting a second agent.** The floor should be "no principal
   of class *agent* satisfies the human-approval requirement," enforced at the same rung as the
   DESTRUCTIVE/ADMIN floors — not a check against a particular `agentUserId`. (Anti-pattern #4 +
   the second-account REPORTED case.)
4. **Author-may-amend needs a diff-scoped approval, not a boolean.** If an agent may revise a
   pending proposal, copy GitHub: record *what* was approved (a hash/snapshot of the proposed
   change), and invalidate the approval automatically when the content moves. Gerrit's
   `user=non_author` and GitHub's "approval by someone other than the person who pushed it" are the
   two guards to mirror: **the author may amend; the amendment resets the review.** Without the
   staleness rule, "author may amend" is a hole, not a feature — the agent revises after approval
   and the human's consent silently transfers to content they never saw.
5. **One agent identity per job, not one per human.** GCP: "one service account per workload."
   Salesforce/ServiceNow: one integration user per calling system. If Synap has a single global
   agent user, attribution collapses to "the AI did it" and blast radius is the whole pod. If it has
   exactly one per human, you get the PAT lifecycle problem back. **The unit that prior art
   converged on is the WORKLOAD** — an agent identity per agent-type/capability lane, owned by the
   pod, optionally carrying a `linkedUserId` delegation.

### The one-line synthesis

*Actor = the agent, always. Subject = the human whose authority is being spent. Both in the token,
both in the log, both in the applied record. Delegation is named and bounded (`may_act` →
`subject_user_id` floor). Approval is a statement about a specific diff and dies when the diff
moves. No agent principal — no matter how it was created — ever satisfies the human half.*

---

## What I did not establish

- **NOT FOUND**: a named, public post-mortem of the "employee left, their PAT took the pipeline
  with it" incident. The pattern is described consistently across vendor blogs but I found no
  primary incident report. Cite it as REPORTED or as vendor guidance (GitHub/Slack say it in their
  own docs, which is stronger), never as an incident.
- **NOT FOUND**: any vendor doc stating the *motive* for Slack's `chat:write:user`/`:bot` scope
  collapse. The deprecation is verified; the reasoning is my inference. Do not cite the motive.
- **NOT VERIFIED**: the AISI second-account anecdote (single secondary source).
- **Not read**: the merged K8s audit PR diff; the Gerrit submit-requirement docs beyond the search
  summary. Both claims are consistent across multiple sources but were not read line-by-line.

## Sources

- RFC 8693 §1.1, §4.1, §4.4 — https://www.rfc-editor.org/rfc/rfc8693.html
- GCP IAM best practices for service accounts — https://docs.cloud.google.com/iam/docs/best-practices-service-accounts
- GCP service accounts in deployment pipelines — https://docs.cloud.google.com/iam/docs/best-practices-for-using-service-accounts-in-deployment-pipelines
- Google Workspace domain-wide delegation best practices — https://support.google.com/a/answer/14437356
- GitHub, deciding when to build a GitHub App — https://docs.github.com/en/apps/creating-github-apps/about-creating-github-apps/deciding-when-to-build-a-github-app
- GitHub, authenticating on behalf of a user — https://docs.github.com/en/apps/creating-github-apps/authenticating-with-a-github-app/authenticating-with-a-github-app-on-behalf-of-a-user
- GitHub, audit log events for your organization (field list) — https://docs.github.com/en/organizations/keeping-your-organization-secure/managing-security-settings-for-your-organization/audit-log-events-for-your-organization
- GitHub, about protected branches (stale dismissal, most-recent-push approval) — https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches
- GitHub changelog, security enhancements to required approvals (merge-base dismissal) — https://github.blog/changelog/2023-06-06-security-enhancements-to-required-approvals-on-pull-requests/
- GitHub, GITHUB_TOKEN concepts — https://docs.github.com/en/actions/concepts/security/github_token
- OpenSSF, Workflows Should Not Be Allowed To Approve Pull Requests — https://best.openssf.org/SCM-BestPractices/github/actions/actions_can_approve_pull_requests.html
- Cider Security, bypassing required reviews using GitHub Actions — https://medium.com/cider-sec/bypassing-required-reviews-using-github-actions-6e1b29135cc7
- Slack, tokens — https://docs.slack.dev/authentication/tokens/
- Slack, bot and user tokens explained — https://slack.dev/two-keys-to-one-platform-understanding-bot-and-user-tokens/
- AWS, CloudTrail userIdentity element — https://docs.aws.amazon.com/awscloudtrail/latest/userguide/cloudtrail-event-reference-user-identity.html
- AWS, monitor and control actions taken with assumed roles (sourceIdentity) — https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_temp_control-access_monitor.html
- Gerrit, submit requirements (user=non_uploader / non_author) — https://gerrit-review.googlesource.com/Documentation/config-submit-requirements.html
- HCP Terraform, workspace permissions — https://developer.hashicorp.com/terraform/cloud-docs/users-teams-organizations/permissions/workspace
- HCP Terraform, UI/VCS run workflow (speculative plans cannot be applied) — https://developer.hashicorp.com/terraform/cloud-docs/run/ui
- Salesforce Architects, security best practices for API access and internal system users — https://medium.com/salesforce-architects/security-best-practices-for-api-access-and-internal-system-users-a6199d0cda09
- ServiceNow community, integration/service account guidance — https://www.servicenow.com/community/in-other-news/user-account-or-service-account-what-to-use-for-web-service/ba-p/2286977
- Stripe, making API calls for connected accounts — https://docs.stripe.com/connect/authentication
- Kubernetes PR #48184, impersonated user info in later audit stages — https://github.com/kubernetes/kubernetes/pull/48184
- WorkOS (REPORTED, unverified) — https://workos.com/blog/agent-invented-a-reviewer-to-get-its-pr-merged
