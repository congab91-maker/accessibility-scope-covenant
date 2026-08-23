# Accessibility Scope Covenant — Approved Specification

Specification ID: `ASC-SPEC-20260813-R1`

Status: user-approved for implementation

Network: GenLayer Studionet only (`chainId 61999`)
Project type: independent PROJECT with one Intelligent Contract and one browser frontend

## 1. Product decision

Accessibility Scope Covenant records a bounded, evidence-backed comparison between a public product accessibility claim and the public materials that define its scope. It addresses a procurement trust problem: a vendor-controlled claim can name the wrong product or version, omit material limitations, or rely on incomplete evidence while still appearing review-ready.

GenLayer is essential because validators independently retrieve the same locked public source references, apply a semantic comparison, and accept the leader result only when the normalized decision projection agrees. A plain deterministic contract could preserve inputs but could not interpret the meaning and scope of heterogeneous ACR, version, statement, and journey pages.

This is not WCAG certification, legal advice, ownership verification, or proof that a journey passed manual testing.

## 2. Actors and trust boundaries

- Registrant/Owner: creates a profile, adds evidence references, freezes the source-reference covenant, triggers bounded assessment/retries (`assess_scope`, strictly owner-authorized and capped at 3 attempts), and may link a successor profile. Unrelated callers cannot trigger assessment or consume attempts.
- Reader/procurement reviewer: read-only access to the public profile, locked source references, assessment-time content digests, verdict, and consequence.
- GenLayer validators: retrieve and semantically compare untrusted public sources.
- Upgrader: the Studio account that deploys the contract and is registered in the Root Slot during construction.

Registrant text, URLs, retrieved pages, SDK/RPC responses, receipts, wallet providers, and model output are untrusted. Contract-side validation, bounded retrieval, normalized consensus comparison, and authoritative readback are the enforcement boundaries.

## 3. Evidence covenant and digest binding

A profile must freeze exactly:

- one `acr_html` or `openacr_json` source;
- one `version_page` source;
- three to five `critical_journey` sources;
- optionally one `accessibility_statement` source.

The claim page is also retrieved during assessment. Sources must be public HTTPS URLs without credentials, fragments, localhost, private, or reserved IP targets. PDF-only ACR evidence is unsupported and therefore cannot satisfy the freeze covenant.

`freeze_profile` locks the exact subject fields (product name, version, claim text), canonical source URLs, kinds, and cardinality. It does not retrieve, snapshot, or bind remote page content or content digests at freeze time.

Each authorized `assess_scope` call independently refetches every locked source URL. Text is normalized and bounded to 40,000 characters per source and 160,000 characters total. The contract records a SHA-256 digest set for the retrieved normalized text at assessment time (`source_digest_set`); it does not store full page snapshots. If an unresolved assessment is retried by the owner, validators refetch live public content, which may reflect updated text and produce a different digest set.

## 4. State machine

`DRAFT -> FROZEN -> ALIGNED | REVIEW_REQUIRED | UNRESOLVED`

- `DRAFT`: mutable evidence.
- `FROZEN`: evidence cardinality is locked and assessment may run.
- `ALIGNED`: verdict is `SCOPE_ALIGNED`.
- `REVIEW_REQUIRED`: a conclusive non-aligned verdict exists.
- `UNRESOLVED`: assessment failed closed and may be retried, up to three total attempts.
- Any non-draft profile may become `SUPERSEDED` when immutably linked to a same-product successor.

There is no public user-settable verdict.

## 5. Verdicts and consequences

| Verdict | Required meaning | Consequence |
|---|---|---|
| `SCOPE_ALIGNED` | product, version, evidence, and disclosure flags all agree; no material limitation IDs | `PROCUREMENT_REVIEW_READY` |
| `LIMITATION_UNDISCLOSED` | matching scope and complete evidence, with undisclosed material limitation IDs | `HUMAN_REVIEW_REQUIRED` |
| `VERSION_MISMATCH` | product or version does not match | `HUMAN_REVIEW_REQUIRED` |
| `EVIDENCE_INCOMPLETE` | evidence is not semantically complete | `HUMAN_REVIEW_REQUIRED` |
| `UNRESOLVED` | retrieval/model/shape/consistency failure; all decision flags fail closed | `HUMAN_REVIEW_REQUIRED` |

Validators compare the normalized verdict, four decision flags, sorted limitation IDs, and sorted source-digest set. Narrative wording is excluded from consensus consequence.

## 6. Contract interface

Writes:

- `create_profile(client_ref, product_name, version, claim_text, claim_url) -> u256` (public; registers sender as profile owner)
- `add_evidence(profile_id, source_kind, url)` (owner-only)
- `freeze_profile(profile_id)` (owner-only)
- `assess_scope(profile_id)` (owner-only; bounded to 3 attempts per profile)
- `supersede_profile(old_profile_id, new_profile_id)` (owner-only for both profiles)
- `upgrade(new_code)` (Root Slot upgrader only)

Views:

- `get_profile_count()`
- `get_upgrader()`
- `get_profile(profile_id)`
- `get_evidence_count(profile_id)`
- `get_evidence(profile_id, index)`
- `get_assessment(profile_id)`
- `get_profile_by_client_ref(owner, client_ref)`

Create, evidence addition, freeze, and supersession have idempotent replay behavior for matching intent. Assessment retry is strictly owner-authorized and bounded to three attempts.

## 7. Frontend journeys

The frontend provides:

1. explicit wallet-provider selection (EIP-6963 plus supported legacy injected providers);
2. manual switch/add to Studionet, never silent MetaMask selection;
3. profile creation;
4. evidence assembly and freeze readiness;
5. assess/retry;
6. profile lookup and evidence/assessment inspection;
7. same-product supersession.

Writes are accepted only after `FINALIZED`, successful leader execution, and method-specific authoritative readback. Pending intent is persisted locally and reconciled after reload. No placeholder contract address is placed in production configuration.

## 8. Acceptance criteria

- Contract and frontend expose all journeys above and no user verdict setter.
- Every non-aligned or uncertain outcome fails to `HUMAN_REVIEW_REQUIRED`.
- Unavailable, malformed, contradictory, or disagreeing validator output cannot create a favorable state.
- URL, evidence-cardinality, retry, ownership, idempotency, and supersession invariants are tested.
- Upgrader registration, authorized upgrade with storage preservation, and unauthorized rejection are tested.
- Frontend validates contract responses and receipts at runtime.
- Responsive UI has no horizontal overflow at 320, 375, 414, 768, and 1280 pixel widths.
- Contract deploys and all live journeys are tested on Studionet only after anonymous `PRE_DEPLOY` approval.
