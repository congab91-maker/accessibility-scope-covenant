# Pre-deployment category and evidence scorecard

## GENLAYER SUBMISSION CATEGORY AND SCORECARD

Category: `PROJECT`

Validity gate: `PASS` for the exact pre-deployment source package

The build is an end-to-end product: a GenLayer Intelligent Contract makes the consensus-critical scope decision, and a usable React frontend invokes the real contract interface. This is not a standalone primitive, tutorial, or milestone. Live Studionet and hosted evidence are intentionally pending their mandatory later checkpoints, so this is a pre-deployment assessment rather than the final submission scorecard.

### GenLayer fit: 4/5

Evidence: `assess_scope` requires validators to independently retrieve the same frozen public claim/ACR/version/journey set and agree on a normalized semantic decision plus source digests. That on-chain verdict deterministically controls profile state and procurement consequence. Tested branches cover every verdict, fail-closed retrieval, contradictory output, and leader/validator disagreement.

Weakness/blocker: no live Studionet consensus receipt exists before `PRE_DEPLOY` approval; the product intentionally stops short of WCAG certification or provenance/ownership proof.

### Contract quality: 4/5

Evidence: substantive evidence covenant, bounded retrieval, strict normalized consequence, state machine, idempotency, ownership checks, three-attempt retry, immutable supersession, Root Slot upgrader registration, and 19 passing contract tests including upgrade authorization and storage preservation.

Weakness/blocker: source retrieval records normalized-content digests rather than full historical page snapshots. Studio runtime APIs and deployed storage/upgrade behavior still require the mandatory live rehearsal.

### Engineering: 4/5

Evidence: exact locked dependencies, offline-reproducible package lock, 19 contract tests, 12 frontend boundary tests, GenVM lint/validation, production build, source/security documentation, and separate contract/frontend modules.

Weakness/blocker: no deployed-source parity, live receipt matrix, public repository, or hosted bundle parity exists at this checkpoint.

### Frontend / UX: 4/5

Evidence: complete create/evidence/freeze/assess/retry/read/supersede journeys; explicit supported-provider selector; manual Studionet switching; persistent pending-intent reconciliation; strict receipt/readback boundary; responsive browser verification at five widths with no console errors or unsafe links.

Weakness/blocker: live wallet and contract journeys cannot be proven until a reviewed contract is deployed and `VITE_CONTRACT_ADDRESS` is set to that real address.

Overall evidence-based assessment: strong pre-deployment PROJECT candidate with central GenLayer consensus and complete local product paths.

Submission recommendation: `NOT READY` — mandatory anonymous `PRE_DEPLOY`, Studionet deployment/live tests, GitHub/Vercel release, and final dual approval remain outstanding.
