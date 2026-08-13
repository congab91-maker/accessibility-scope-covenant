# Verification record

Checkpoint target: `PRE_DEPLOY`

Network target: GenLayer Studionet, chain ID `61999` (`0xf22f`)

RPC: `https://studio.genlayer.com/api`

Explorer: `https://explorer-studio.genlayer.com`

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

## Pre-deployment recovery plan

1. Deploy only the exact reviewed contract source on Studionet with no constructor arguments.
2. Immediately read `get_upgrader()` and require the selected account above.
3. Run a minimal create/read lifecycle and all live acceptance journeys only after deployment finalizes.
4. On a separate disposable deployment, rehearse an authorized bytecode upgrade that preserves the frozen storage order; verify pre-existing state remains readable.
5. Attempt the same upgrade from a non-upgrader account and require rejection with unchanged code/state.
6. If deployment or readback is ambiguous, do not retry blindly: reconcile the receipt and chain state first.
7. If the canonical deployment is unusable or upgrade authority is lost, deploy a replacement and update all address references; never silently reuse another Task deployment.

No contract has been deployed yet. Contract address and transaction evidence remain intentionally absent until anonymous `PRE_DEPLOY` approval.
