# Architecture and security model

## System

The browser talks directly to Studionet through `genlayer-js`. There is no backend, database, indexer, or off-chain authority. The single Intelligent Contract owns profile state, evidence references, assessments, consequences, supersession links, and upgrade entrypoint.

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

## Intelligent consensus

The leader retrieves the claim page plus every frozen evidence URL, normalizes and bounds the text, calculates source digests, and asks for strict JSON. Each validator repeats retrieval and semantic evaluation. It approves only when the deterministic projection of its result equals the leader projection. Invalid or contradictory output is normalized to `UNRESOLVED`.

The reason string is preserved for human explanation but excluded from consensus, preventing prose variation from deciding state. Source digests are included, so validators must agree on the same retrieved normalized evidence set as well as the semantic decision.

## Upgrade architecture

Classification: `UPGRADABLE`.

The constructor registers `gl.message.sender_address` in `gl.storage.Root.get().upgraders` and stores the address for authoritative readback. `upgrade(new_code)` replaces Root Slot code; authorization is enforced by the locked Root Slot upgrader list. The selected Studionet Studio account is:

`0x2e53bb6ED175A7F827590D9D3a353FC51Eb8996a`

Losing control of this account loses upgrade authority. Recovery then requires deploying a replacement contract and updating every frontend, repository, and submission reference to the new address. No linked contracts exist.

Before any production-facing upgrade, use a separate test deployment to rehearse the exact candidate, verify method schema and storage readback, and obtain the applicable fresh review/approval. Never rehearse destructive or storage-incompatible code on the canonical deployment.

## Client-side transaction boundary

The browser treats receipts and RPC payloads as hostile. It requires explicit `FINALIZED`, consensus finality when provided, a successful leader execution, and method-specific chain readback. Big integers and JSON fields are validated without assuming SDK casing. A pending local intent survives restart and is reconciled before another write is allowed.
