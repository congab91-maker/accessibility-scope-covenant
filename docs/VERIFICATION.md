# Verification record

Checkpoint target: judge-remediation candidate (`PRE_DEPLOY` pending)

Network target: GenLayer Studionet, chain ID `61999` (`0xf22f`)

RPC: `https://studio.genlayer.com/api`

Explorer: `https://explorer-studio.genlayer.com`

Canonical contract: `0xe416bd995e6eD1998397EF2675f1a1f390Ab652a`

Deployment transaction: `0x8add8f28275136ec6604be66b26c224e31e94cdfcb8c5e3f840ac4fb7f3b19d4`

Current deployed code commit (historical release boundary): `c566032159f42f62c0958ea3e8f28f679b166966`

Anonymous-approved post-deploy evidence commit: `7dc65dcef5e36e268bb52898d36bba89e29d3f47`

Current deployed source SHA-256 (before remediation upgrade): `A9BCD2B7E047AFD3C257FCCF911190BFD8DE9B41F90491B297A541D2E837BBAB`

Proposed remediation implementation commit: `f73810333af73e9e2b24c6f65a53d136863c1cf9`

Proposed remediation contract SHA-256: `2829951136974620B731189817FA0A868206162C177B276255C7FB8BC79748C0`

The proposed source is not described as deployed until an approved upgrade reaches finality, execution success, exact deployed-code hash parity, preserved storage readback, and the authorization matrix below. The existing address, deployment transaction, deployed hash, and earlier evidence remain historical facts for the currently deployed version.

Selected deployer/upgrader: `0x2e53bb6ED175A7F827590D9D3a353FC51Eb8996a`

The Studio network selector was visibly verified as `GenLayer Studio` before this account was recorded. The account selector exposed the full address above. If access to this account is lost, or Studio/Studionet chain state is reset, upgrade authority may be lost; the supported fallback is a replacement deployment with every address reference updated, not a promise to recover the old address.

## Toolchain provenance

No package or tool was downloaded or installed for this Task. The project reuses the already-complete dependency set at `E:\Genlayer-Tools\cyber-disclosure-delta-bootstrap\frontend\node_modules` through a project-local junction. The dependency store itself passes `npm ls --all` with exit code `0` when checked at its owning package root, `E:\Genlayer-Tools\cyber-disclosure-delta-bootstrap\frontend`. Running `npm ls` from this project is not a valid closure check for that external junction and returns exit code `1`; no clean project-local install is claimed. The committed package lock records exact requested versions, but an offline clean install was not performed or claimed. GenVM uses the existing runner `E:\Genlayer-Tools\GenVM\v0.3.0-rc7`; Python uses the already-installed Python 3.13 runtime.

## Verified commands

```text
C:\Users\LEGION\AppData\Local\Programs\Python\Python313\python.exe -m pytest -q -p no:cacheprovider
20 passed

$env:GENVM_VERSION='v0.3.0-rc7'
E:\Genlayer-Tools\cyber-disclosure-delta-bootstrap\.venv\Scripts\python.exe -m genvm_linter.cli check contracts\accessibility_scope_covenant.py --json
ok=true; lint=3 passed; validate=true; contract=AccessibilityScopeCovenant; methods=13; views=7; writes=6

npm test
35 passed

npm run build
passed
```

Two advisories are reviewed:

- Vite reports a bundle-size advisory caused principally by the required GenLayer SDK. It does not affect correctness; no dependency was added merely to suppress it.
- GenVM reports `I200`, advertising py-genlayer runner `1zr6nqk597d97kg0dyxg0shhrykx5v02zjgnyrajapy4wlqvfvwh` as newer than the pinned `1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6`. The current official `genlayerlabs/genvm` release list identifies `v0.3.0-rc7` as latest, and the downloaded official rc7 archive contains the pinned `1jb45...` package. The contract therefore remains pinned to the package actually bundled and fully validated by the latest released runner available on this machine. The unbundled advisory hash is not adopted before deployment merely to silence a warning; Studio compilation and the later deployed-source parity check remain mandatory live confirmation.

## Test coverage summary

- Contract: profile lifecycle, URL rejection, exact freeze covenant, idempotency, every verdict/consequence, fail-closed retrieval, bounded retry, schema-valid leader disagreement, contradictory flags, supersession, absence of a verdict setter, untrusted prompt injection, Root Slot registration, authorized upgrade/storage preservation, and unauthorized upgrade/no code change.
- Frontend: receipt finality/leader success boundaries, simplified rollback decoding, runtime contract-response validation, safe identifiers, wallet-provider deduplication, fail-closed account/network/disconnect events with listener cleanup, and method-specific readback behavior. Restart reconciliation covers create without a connected wallet, evidence, freeze, assessment, both sides of supersession, delayed readback and mismatch. Known hashes cannot bypass `FINALIZED/SUCCESS`; hashless recovery is actor-bound and requires a new transition from its pre-write baseline. Regressions reject no-broadcast, pre-existing idempotent state and finalized-error false recovery.
- Browser: explicit provider selector and cancel behavior; no supported-provider fallback; no console errors; no unsafe links; no horizontal overflow or viewport escape at widths 320, 375, 414, 768, and 1280.

## Proposed no-constructor upgrade plan

1. Obtain fresh anonymous `PRE_DEPLOY` approval bound to the remediation package and candidate source hash above.
2. Use only the locked existing Studio account/upgrader `0x2e53bb6ED175A7F827590D9D3a353FC51Eb8996a` on Studionet.
3. Upgrade the canonical address with the exact reviewed source bytes through the authorized upgrade path. This is a source replacement with no constructor call; storage field order and types are unchanged.
4. Require transaction `FINALIZED`, consensus finality where present, leader execution `SUCCESS`, and deployed-code SHA-256 equal to `2829951136974620B731189817FA0A868206162C177B276255C7FB8BC79748C0`.
5. Read `get_upgrader()` and representative pre-existing profiles before and after upgrade; require exact upgrader and state parity.
6. Create a fresh owner-A frozen profile with attempts `0` and no assessment record. From unrelated owner B, call `assess_scope`; require the exact owner rejection and unchanged profile JSON, attempts, state, verdict, consequence, timestamps, assessment, and digest set. Then run the owner-A assessment and require the bounded attempt plus assessment-time `source_digest_set` readback.
7. Verify public read-only inspection, non-owner frontend write disabling, and the existing two-argument supersession/lineage path.
8. If upgrade or readback is ambiguous, do not retry blindly: reconcile receipt and chain state first. If canonical authority is unavailable, stop and obtain review for a replacement-deployment plan; never silently change the address.

## Historical deployment and recovery record

The earlier anonymous `PRE_DEPLOY` approval applied only to the historical deployed commit/hash. The canonical deployment reached `FINALIZED`, majority agreement, leader execution `SUCCESS`, receipt status `0x1`, and deployed-code parity for that historical source. It does not approve the proposed remediation source.

The complete post-deployment matrix is reconciled without cherry-picking in `docs/LIVE_STUDIO_EVIDENCE.md`. It includes successful and rejected lifecycle paths, replay/idempotency, bounded evidence, substantive consensus, supersession, second-account authorization, finalized critical reads, and a disposable exact-source upgrade rehearsal at `0xF83B36B0B66C0C08DDc3f36f4B5ecCe06d2D355D`.

The rehearsal deployment, authorized upgrade, and unauthorized upgrade are respectively `0x3ea45811fd48d56c7b6deb37509e2cf9e7f67ff3f3affd0cd92b3de135a5e80b`, `0x7e4b2662696615911f42cce6e10018734daed29dbd50d3f7d1b2460bec7dcc30`, and `0x2a8f51729dff46e6291ba5996f3ff68c48cf8aa54dbfbdad2a0fda8729200b97`. The authorized path preserved the exact 20,529-byte source SHA-256 and fixture state; the unauthorized path finalized as `ERROR` with Root Slot storage access `forbidden`, followed by unchanged source/state readback.

The frontend production build is compiled with the canonical address through `VITE_CONTRACT_ADDRESS`; 35 frontend tests and the production build pass. Anonymous `POST_DEPLOY_TEST` approved commit `7dc65dcef5e36e268bb52898d36bba89e29d3f47` and its 28-entry manifest. Later live-wallet testing exposed provider aliases, ambiguous SDK receipt fields, unsafe readback-first recovery, a simplified rollback receipt and stale wallet state risk. The corrected client deduplicates wallet identities, binds recovery to actor plus pre-write baseline, requires receipt success for known hashes, safely decodes rollback payloads without serializing hostile receipt internals, and clears write authority on provider account, chain or disconnect events.

The public repository is `https://github.com/congab91-maker/accessibility-scope-covenant` (`PUBLIC`, default branch `codex/main`). The final application source revision before the evidence-only commit is `4b1029385825e722b0686b10b5149462dcdd8f54`. Vercel production is `https://accessibility-scope-covenant.vercel.app` in confirmed scope `brunogg`; the exact immutable deployment ID is recorded in the final checkpoint prompt so evidence-only commits do not make this file self-referential. Public raw contract parity, byte-identical public/local JavaScript parity, provider selection, success/rejection/reconciliation, fail-closed wallet events, public-reader and live Vercel supersession journeys are recorded in `docs/FINAL_RELEASE_EVIDENCE.md`. Completion remains pending fresh anonymous `POST_GITHUB_VERCEL_FINAL` approval and matching primary-AI approval of the final evidence revision.
