# Accessibility Scope Covenant

Accessibility Scope Covenant lets procurement reviewers freeze a product/version accessibility claim and have GenLayer validators decide whether its public evidence actually covers that exact scope.

## Verified links

- [Live application](https://accessibility-scope-covenant.vercel.app)
- [Canonical contract on Studionet Explorer](https://explorer-studio.genlayer.com/address/0xc575a4F5F6006F411f03dF1Be2Cd9eE9EC83d617)
- [Deployment transaction](https://explorer-studio.genlayer.com/tx/0x8add8f28275136ec6604be66b26c224e31e94cdfcb8c5e3f840ac4fb7f3b19d4)
- Contract: `0xc575a4F5F6006F411f03dF1Be2Cd9eE9EC83d617`
- Network: GenLayer Studionet, chain ID `61999`

## Trust problem

A procurement reviewer cannot assume that a vendor-controlled accessibility claim refers to the offered product and version, discloses its material limitations, or is supported by a complete ACR and critical-journey evidence set. URLs can be heterogeneous and the meaning of their text cannot be reduced to a deterministic field comparison.

## Why GenLayer is essential

The Intelligent Contract locks the claim, exact version and canonical public HTTPS source references. During owner-authorized `assess_scope`, a leader retrieves and semantically evaluates those locked source references; validators independently repeat retrieval and accept only an equivalent normalized decision. Consensus covers the verdict, decision flags, limitation IDs and assessment-time source-digest set. The agreed on-chain result determines either `PROCUREMENT_REVIEW_READY` or the fail-closed `HUMAN_REVIEW_REQUIRED` consequence. A conventional deterministic contract could preserve the inputs but could not interpret whether heterogeneous public evidence matches their meaning and scope.

## How it works

1. A registrant connects an explicitly selected browser-wallet provider and switches to Studionet when prompted.
2. They create a version-bound covenant containing the exact public claim.
3. They add one ACR/OpenACR source, one version page, three to five critical-journey sources and, optionally, one accessibility statement.
4. They freeze the source-reference covenant. Only the profile owner can execute `assess_scope` (and retry an unresolved assessment up to the bounded three-attempt budget), preventing third parties from consuming evaluation attempts.
5. Any reader loads the profile ID to inspect locked source references, verdict, assessment-time content digests, and procurement consequence. The owner can link a same-product successor without rewriting the historical record.

## Architecture

The React/Vite browser client talks directly to Studionet through `genlayer-js`; there is no backend, database or indexer. The browser owns wallet interaction, transaction monitoring, hostile-response validation and pending-intent reconciliation. The Intelligent Contract is the sole source of truth for profiles, ownership, evidence, assessments, consequences, supersession links and upgrade authority. Public pages remain off-chain inputs and are independently refetched for each assessment; only normalized digests and the consensus result become contract state. See [architecture and storage details](docs/ARCHITECTURE.md).

## Intelligent Contract

Actors are the registrant/owner, public reader, GenLayer validators and the recorded Root Slot upgrader. The state machine is:

`DRAFT → FROZEN → ALIGNED | REVIEW_REQUIRED | UNRESOLVED`

Any non-draft profile may later become `SUPERSEDED`. Write methods are `create_profile`, `add_evidence`, `freeze_profile`, `assess_scope`, `supersede_profile` and `upgrade`; seven view methods expose counts, profiles, evidence, assessments, client-reference lookup and upgrader readback. All profile mutation methods (`add_evidence`, `freeze_profile`, `assess_scope`, `supersede_profile`) are strictly owner-authorized, ensuring an unrelated caller cannot trigger assessment or consume the profile's three-attempt budget. Readers remain read-only. Matching create/evidence/freeze/supersession replays are idempotent. There is no public verdict setter and no token, payment or economic value path.

Validator equivalence deliberately excludes free-form reasoning prose. It compares the normalized verdict, four scope flags, sorted material-limitation IDs and sorted source-digest set; malformed, contradictory, unavailable or disagreeing results normalize to `UNRESOLVED` and `HUMAN_REVIEW_REQUIRED`.

## Transaction lifecycle

The wallet signs only after the user chooses a provider. Before signing, the UI journals the actor, exact intent and authoritative pre-write baseline. A known transaction hash must reach `FINALIZED`, pass consensus finality when supplied, and have leader execution `SUCCESS` before method-specific readback can confirm it. Hashless recovery additionally requires a new transition from the saved baseline. A terminal rollback clears the journal and shows its decoded contract reason; ambiguous outcomes remain pending. The client never treats a hash or a pre-existing idempotent state alone as success and never retries a write blindly.

## Run locally

Prerequisites: Node.js `22.12+`, npm, and a compatible EIP-1193 browser wallet for live interaction.

```powershell
git clone https://github.com/congab91-maker/accessibility-scope-covenant.git
Set-Location accessibility-scope-covenant
git switch codex/main
npm ci
Copy-Item .env.example .env.local
npm run dev
```

`VITE_CONTRACT_ADDRESS` is the only frontend environment variable. The committed example points to the verified canonical Studionet deployment. Do not substitute another network or a placeholder address.

Contract tests additionally require Python 3 with `pytest`. GenVM lint/validation uses a compatible installed GenVM runner.

## Tests and verification

Current exact-revision results:

```powershell
python -m pytest -q -p no:cacheprovider  # 20 passed
npm test                                 # 35 passed
npm run build                            # passed
$env:GENVM_VERSION='v0.3.0-rc7'
& 'E:\Genlayer-Tools\cyber-disclosure-delta-bootstrap\.venv\Scripts\python.exe' -m genvm_linter.cli check contracts\accessibility_scope_covenant.py --json
# ok=true; lint=3 passed; methods=13 (7 view, 6 write)
```

Responsive browser checks cover 320, 375, 414, 768 and 1280 pixels. The live production bundle is byte-identical to the reviewed local build and contains the canonical address. Full hashes, commands and live transaction/readback evidence are in [verification](docs/VERIFICATION.md), [public release evidence](docs/FINAL_RELEASE_EVIDENCE.md) and the [Studionet evidence ledger](docs/LIVE_STUDIO_EVIDENCE.md).

## Deployment

The canonical contract was deployed on Studionet by `0x2e53bb6ED175A7F827590D9D3a353FC51Eb8996a` in transaction `0x8add8f28275136ec6604be66b26c224e31e94cdfcb8c5e3f840ac4fb7f3b19d4`. Its 20,529-byte source hashes to `A9BCD2B7E047AFD3C257FCCF911190BFD8DE9B41F90491B297A541D2E837BBAB`, matching local source, public GitHub source and deployed-code readback.

The contract is upgradable only by the registered Root Slot upgrader. Authorized source replacement with preserved storage and unauthorized rejection were rehearsed on a separate disposable exact-source deployment. Loss of the upgrader requires a replacement deployment and coordinated update of every public reference; no recovery authority is implied.

## Security and trust boundaries

- Registrant text, URLs, retrieved pages, model output, wallet providers, RPC payloads and receipts are untrusted.
- Sources must be public HTTPS URLs; credentials, fragments, localhost and private/reserved IP targets are rejected.
- Retrieval is bounded to 40,000 normalized characters per source and 160,000 total.
- Favorable state requires strict normalized consensus; uncertainty fails closed.
- Ownership gates all mutations, while immutable freeze and supersession rules preserve historical claims.
- The frontend validates contract JSON and bigint fields, requires finalized successful receipts plus readback, and never auto-selects MetaMask or the first injected provider.
- Upgrade storage order is frozen; fields may only be appended after a separately reviewed and rehearsed revision.

## Known limitations

- This product evaluates claim-to-document scope alignment; it is not WCAG certification, manual accessibility testing, legal advice or proof of evidence ownership.
- PDF-only ACR evidence is unsupported; use public HTML or OpenACR JSON.
- The contract locks source references and binds normalized content digests at assessment time, rather than snapshotting or freezing remote page contents at freeze time. Each assessment independently refetches live public pages, so retries or subsequent assessments bind the content retrievable at that assessment time.
- Assessment execution and retries are strictly owner-authorized; the bounded three-attempt budget cannot be consumed by unrelated callers.
- Public-source availability and validator interpretation can produce `UNRESOLVED`; retries are capped at three and never create a favorable default.
- Studionet is a test network. The canonical address and evidence are not a mainnet production guarantee.
