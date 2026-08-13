# Verification record

Checkpoint target: `POST_DEPLOY_TEST` package (`READY FOR ANONYMOUS REVIEW`; approval not yet granted)

Network target: GenLayer Studionet, chain ID `61999` (`0xf22f`)

RPC: `https://studio.genlayer.com/api`

Explorer: `https://explorer-studio.genlayer.com`

Canonical contract: `0xe416bd995e6eD1998397EF2675f1a1f390Ab652a`

Deployment transaction: `0x8add8f28275136ec6604be66b26c224e31e94cdfcb8c5e3f840ac4fb7f3b19d4`

Exact deployed commit: `c566032159f42f62c0958ea3e8f28f679b166966`

Exact deployed source SHA-256: `A9BCD2B7E047AFD3C257FCCF911190BFD8DE9B41F90491B297A541D2E837BBAB`

Selected deployer/upgrader: `0x2e53bb6ED175A7F827590D9D3a353FC51Eb8996a`

The Studio network selector was visibly verified as `GenLayer Studio` before this account was recorded. The account selector exposed the full address above. If access to this account is lost, or Studio/Studionet chain state is reset, upgrade authority may be lost; the supported fallback is a replacement deployment with every address reference updated, not a promise to recover the old address.

## Toolchain provenance

No package or tool was downloaded or installed for this Task. The project reuses the already-complete dependency set at `E:\Genlayer-Tools\cyber-disclosure-delta-bootstrap\frontend\node_modules` through a project-local junction. The dependency store itself passes `npm ls --all` with exit code `0` when checked at its owning package root, `E:\Genlayer-Tools\cyber-disclosure-delta-bootstrap\frontend`. Running `npm ls` from this project is not a valid closure check for that external junction and returns exit code `1`; no clean project-local install is claimed. The committed package lock records exact requested versions, but an offline clean install was not performed or claimed. GenVM uses the existing runner `E:\Genlayer-Tools\GenVM\v0.3.0-rc7`; Python uses the already-installed Python 3.13 runtime.

## Verified commands

```text
C:\Users\LEGION\AppData\Local\Programs\Python\Python313\python.exe -m pytest -q -p no:cacheprovider
19 passed

$env:GENVM_VERSION='v0.3.0-rc7'
genvm-lint check contracts\accessibility_scope_covenant.py --json
ok=true; lint=3 passed; validate=true; contract=AccessibilityScopeCovenant; methods=13; views=7; writes=6

npm test
18 passed

npm run build
passed
```

Two advisories are reviewed:

- Vite reports a bundle-size advisory caused principally by the required GenLayer SDK. It does not affect correctness; no dependency was added merely to suppress it.
- GenVM reports `I200`, advertising py-genlayer runner `1zr6nqk597d97kg0dyxg0shhrykx5v02zjgnyrajapy4wlqvfvwh` as newer than the pinned `1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6`. The current official `genlayerlabs/genvm` release list identifies `v0.3.0-rc7` as latest, and the downloaded official rc7 archive contains the pinned `1jb45...` package. The contract therefore remains pinned to the package actually bundled and fully validated by the latest released runner available on this machine. The unbundled advisory hash is not adopted before deployment merely to silence a warning; Studio compilation and the later deployed-source parity check remain mandatory live confirmation.

## Test coverage summary

- Contract: profile lifecycle, URL rejection, exact freeze covenant, idempotency, every verdict/consequence, fail-closed retrieval, bounded retry, schema-valid leader disagreement, contradictory flags, supersession, absence of a verdict setter, untrusted prompt injection, Root Slot registration, authorized upgrade/storage preservation, and unauthorized upgrade/no code change.
- Frontend: receipt finality/leader success boundaries, bigint-safe parsing, runtime contract-response validation, safe identifiers, and method-specific readback behavior. Restart reconciliation tests cover create (without a connected wallet), evidence, freeze, assessment, both sides of supersession, delayed readback, mismatch, and duplicate reconciliation. Pending intent is retained unless the exact postcondition verifies.
- Browser: explicit provider selector and cancel behavior; no supported-provider fallback; no console errors; no unsafe links; no horizontal overflow or viewport escape at widths 320, 375, 414, 768, and 1280.

## Deployment and recovery record

1. Deploy only the exact reviewed contract source on Studionet with no constructor arguments.
2. Immediately read `get_upgrader()` and require the selected account above.
3. Run a minimal create/read lifecycle and all live acceptance journeys only after deployment finalizes.
4. On a separate disposable deployment, rehearse an authorized bytecode upgrade that preserves the frozen storage order; verify pre-existing state remains readable.
5. Attempt the same upgrade from a non-upgrader account and require rejection with unchanged code/state.
6. If deployment or readback is ambiguous, do not retry blindly: reconcile the receipt and chain state first.
7. If the canonical deployment is unusable or upgrade authority is lost, deploy a replacement and update all address references; never silently reuse another Task deployment.

Anonymous `PRE_DEPLOY` approved the exact commit and source hash above. The canonical deployment is `FINALIZED`, majority-agree, leader execution `SUCCESS`, receipt status `0x1`, and deployed-code readback matches the exact approved source hash. `get_upgrader()` matches the selected account.

The complete post-deployment matrix is reconciled without cherry-picking in `docs/LIVE_STUDIO_EVIDENCE.md`. It includes successful and rejected lifecycle paths, replay/idempotency, bounded evidence, substantive consensus, supersession, second-account authorization, finalized critical reads, and a disposable exact-source upgrade rehearsal at `0xF83B36B0B66C0C08DDc3f36f4B5ecCe06d2D355D`.

The rehearsal deployment, authorized upgrade, and unauthorized upgrade are respectively `0x3ea45811fd48d56c7b6deb37509e2cf9e7f67ff3f3affd0cd92b3de135a5e80b`, `0x7e4b2662696615911f42cce6e10018734daed29dbd50d3f7d1b2460bec7dcc30`, and `0x2a8f51729dff46e6291ba5996f3ff68c48cf8aa54dbfbdad2a0fda8729200b97`. The authorized path preserved the exact 20,529-byte source SHA-256 and fixture state; the unauthorized path finalized as `ERROR` with Root Slot storage access `forbidden`, followed by unchanged source/state readback.

The frontend production build is compiled with the canonical address through `VITE_CONTRACT_ADDRESS`; 18 frontend tests and the production build pass. The Task remains `DEPLOYMENT_READY`, not `LIVE_VERIFIED`, until anonymous `POST_DEPLOY_TEST` approves the exact committed evidence revision.
