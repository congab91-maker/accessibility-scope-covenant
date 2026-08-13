# Final-candidate category and evidence scorecard

## GENLAYER SUBMISSION CATEGORY AND SCORECARD

Category: `PROJECT`

Validity gate: `PASS` for the exact deployed source, complete live matrix, public repository, and hosted production bundle; final anonymous gate remains open

The build is an end-to-end product: a GenLayer Intelligent Contract makes the consensus-critical scope decision, and a usable React frontend invokes the real contract interface. This is not a standalone primitive, tutorial, or milestone. The exact source is deployed on Studionet, the frontend is wired to its real address, the live matrix is complete, and public GitHub/Vercel releases are verified. Final anonymous review remains pending, so completion is not yet claimed.

### GenLayer fit: 4/5

Evidence: `assess_scope` requires validators to independently retrieve the same frozen public claim/ACR/version/journey set and agree on a normalized semantic decision plus source digests. That on-chain verdict deterministically controls profile state and procurement consequence. Tested branches cover every verdict, fail-closed retrieval, contradictory output, and leader/validator disagreement.

Weakness/blocker: live assessments demonstrated both fail-safe `UNRESOLVED` behavior during source outage and a substantive `EVIDENCE_INCOMPLETE` verdict over eight reachable sources. The product intentionally stops short of WCAG certification or provenance/ownership proof; final anonymous approval is still required.

### Contract quality: 4/5

Evidence: substantive evidence covenant, bounded retrieval, strict normalized consequence, state machine, idempotency, ownership checks, three-attempt retry, immutable supersession, Root Slot upgrader registration, and 19 passing contract tests including upgrade authorization and storage preservation.

Weakness/blocker: source retrieval records normalized-content digests rather than full historical page snapshots. Canonical deployment, storage transitions, and the separate authorized/unauthorized exact-source upgrade rehearsal are proven.

### Engineering: 4/5

Evidence: exact dependency versions in the package lock, a reused dependency store whose owning package passes `npm ls --all`, 19 contract tests, 28 frontend boundary/reconciliation/provider-discovery tests, GenVM lint/validation, production build, source/security documentation, and separate contract/frontend modules.

Weakness/blocker: the project uses an external dependency junction, so `npm ls` at the project root is not a clean-install closure check; no offline clean-install claim is made. Deployed-source, live receipt, public-source, and hosted-bundle parity are complete.

### Frontend / UX: 4/5

Evidence: complete create/evidence/freeze/assess/retry/read/supersede journeys; explicit supported-provider selector; manual Studionet switching; persistent pending-intent reconciliation; strict receipt/readback boundary; responsive browser verification at five widths with no console errors or unsafe links.

Weakness/blocker: production renders correctly, the corrected explicit provider selector is verified without automatic provider selection, and the user successfully connected OKX Wallet on Studionet. The product intentionally requires a fresh connection after each full reload and does not silently restore a wallet session.

Overall evidence-based assessment: strong public PROJECT candidate with central GenLayer consensus, complete product paths, a non-cherry-picked Studio evidence ledger, and verified public source/bundle parity pending final anonymous review.

Submission recommendation: `NOT READY` — anonymous `POST_GITHUB_VERCEL_FINAL` and matching exact-revision dual approval remain outstanding.
