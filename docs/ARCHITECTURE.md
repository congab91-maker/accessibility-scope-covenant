# Architecture and security model

## System

The browser talks directly to Studionet through `genlayer-js`. There is no backend, database, indexer, or off-chain authority. The single Intelligent Contract owns profile state, locked evidence references, assessments, consequences, supersession links, and upgrade entrypoint.

## Authorization and roles

- **Profile Registrant (Owner)**: authorized to add evidence references, freeze the source-reference covenant, trigger bounded assessment/retries (`assess_scope`, up to 3 attempts), and link superseding profiles. All profile mutation paths strictly enforce the `_require_owner` guard.
- **Reader / Procurement Reviewer**: read-only inspection of profiles, locked source references, consensus assessment verdicts, content digest sets, and procurement consequences. Readers cannot mutate state or consume assessment attempts.
- **GenLayer Validators**: execute consensus evaluation during leader/validator nondeterministic execution.
- **Root Slot Upgrader**: authorized to replace contract code through the locked Root Slot upgrader list.

## Storage layout — frozen order

Storage compatibility is part of the upgrade covenant. Existing fields must never be removed, reordered, or have their types changed:

1. `profile_count: u256`
2. `profiles: TreeMap[u256, str]`
3. `profile_owners: TreeMap[u256, Address]`
4. `client_profiles: TreeMap[str, u256]`
5. `evidence_counts: TreeMap[u256, u8]`
6. `evidence_records: TreeMap[str, str]`
7. `assessments: TreeMap[u256, str]`
8. `upgrader: Address`

Future storage fields may only be appended after these fields and require a fresh reviewed revision.

## Evidence boundary and assessment-time digest binding

- `freeze_profile` locks the exact subject fields (product name, version, claim text), canonical public source URLs, evidence kinds, and cardinality. It does **not** fetch, store, or snapshot remote page contents or content digests at freeze time.
- During owner-authorized `assess_scope`, the leader independently refetches the claim URL and all locked source references. Text is normalized and bounded (40,000 chars per source, 160,000 chars total), and SHA-256 digests are computed and bound to `source_digest_set` for that assessment.
- If an assessment results in `UNRESOLVED`, an authorized retry refetches live public content, which may reflect updated content and produce a different digest set.
- Remote content immutability is never assumed; the covenant guarantees reference boundary and consensus agreement on the content retrieved during that specific assessment.

## Intelligent consensus

During `assess_scope`, the leader retrieves the claim page plus every locked source reference, normalizes and bounds the text, calculates source digests, and evaluates the scope against strict JSON output. Each validator repeats retrieval and semantic evaluation. It approves only when the deterministic projection of its result equals the leader projection. Invalid or contradictory output is normalized to `UNRESOLVED`.

The reason string is preserved for human explanation but excluded from consensus, preventing prose variation from deciding state. Source digests are included, so validators must agree on the same retrieved normalized evidence set as well as the semantic decision.

## Deployment and upgrade architecture

Classification: `UPGRADABLE`.

The constructor registers `gl.message.sender_address` in `gl.storage.Root.get().upgraders` and stores the address for authoritative readback. `upgrade(new_code)` replaces Root Slot code; authorization is enforced by the locked Root Slot upgrader list. The selected Studionet Studio account is:

`0xeF5D2119416A2f5afa35dCFA209766EFC1BE5902`

The previous canonical contract at `0xe416bd995e6eD1998397EF2675f1a1f390Ab652a` remains historical because its upgrader account is no longer available in any accessible Studio session. The remediation therefore uses a replacement deployment, not an upgrade or migration. The zero-argument constructor runs on replacement deployment and registers the selected sender above as the new Root Slot upgrader. No old profile state is copied; the previous address and state remain independently readable historical evidence. After verified deployment, every frontend, repository, and submission reference moves to the replacement address. No linked contracts exist.

Losing control of the new account again loses upgrade authority. Recovery would require another freshly reviewed replacement deployment. Before any later production-facing upgrade, use a separate test deployment to rehearse the exact candidate, verify method schema and storage readback, and obtain fresh approval. Never rehearse destructive or storage-incompatible code on a canonical deployment.

## Client-side transaction boundary

The browser treats receipts and RPC payloads as hostile. It requires explicit `FINALIZED`, consensus finality when provided, a successful leader execution, and method-specific chain readback. Big integers and JSON fields are validated without assuming SDK casing. A pending local intent survives restart and is reconciled before another write is allowed.
