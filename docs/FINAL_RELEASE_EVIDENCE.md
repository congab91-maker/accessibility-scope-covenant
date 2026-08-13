# Final public release evidence

Checkpoint target: `POST_GITHUB_VERCEL_FINAL`

Evidence captured: 2026-08-14 (Asia/Saigon)

## Exact release identity

- Final application source commit: `4b1029385825e722b0686b10b5149462dcdd8f54`
- Final evidence commit: recorded by the checkpoint prompt after this evidence-only revision is committed
- Public repository: `https://github.com/congab91-maker/accessibility-scope-covenant`
- Visibility: `PUBLIC`
- Default and release branch: `codex/main`
- Canonical contract: `0xe416bd995e6eD1998397EF2675f1a1f390Ab652a`
- Contract source SHA-256: `A9BCD2B7E047AFD3C257FCCF911190BFD8DE9B41F90491B297A541D2E837BBAB`
- Contract source size: `20,529` bytes
- Network: GenLayer Studionet, chain ID `61999` (`0xf22f`)

The public GitHub raw contract is 20,529 bytes and hashes to the same exact SHA-256 as the deployed-code readback and reviewed local source.

## Vercel production identity

- Confirmed scope/team: `brunogg`
- Project: `accessibility-scope-covenant`
- Production alias: `https://accessibility-scope-covenant.vercel.app`
- Production deployment: verified `Ready`; the immutable deployment ID is recorded in the exact-revision checkpoint prompt
- Status: `Ready`
- Production JavaScript: `/assets/index-BsU7tgo4.js`
- Public/local bundle SHA-256: `7D9669015DC307CC3FE69A56FE360DCF9BBA401FEF3FA0F72E341867A1AC5282`
- Public bundle size: `602,676` bytes

The public production bundle and local production bundle are byte-identical. The public bundle contains the canonical address and does not contain the disposable rehearsal address.

Only the verified public production alias is provided as a reviewer link. The platform-generated immutable deployment URL is intentionally omitted because it redirects unauthenticated visitors to Vercel login.

## Live frontend checks

- Production alias returned HTTP `200` and rendered `Accessibility Scope Covenant`.
- The page displayed `Studionet · 61999` and the canonical contract abbreviation `0xe416b…b652a`.
- At the live 1280-by-720 viewport, document width was 1265 pixels: no horizontal overflow.
- `Connect wallet` opened an explicit `Choose a wallet` provider-selector dialog.
- With no compatible EIP-1193 provider detected, the dialog displayed that state and only offered `Cancel`; it did not select MetaMask, select a first provider, or request a connection.
- Cancelling closed the dialog without a wallet request.
- Prior deterministic browser coverage verified widths 320, 375, 414, 768, and 1280, no unsafe links, and no console errors.

The first real-extension user check exposed duplicate Backpack announcements and a duplicate legacy MetaMask alias. The final discovery path deduplicates the same provider object and same EIP-6963 reverse-domain identity, uses normalized display name only to suppress an identity-less legacy alias, and preserves distinct reverse-domain identities even when display names match. Four focused regression cases pass. On the final production alias, the selector showed exactly four unique detected providers — Phantom, OKX Wallet, MetaMask and Backpack — with no duplicate or mislabeled row. The user then selected OKX Wallet and verified that the header displayed both the connected address (`0x0d4b8…ad563`) and `Studionet · 61999`. This initial selector check requested no write; the subsequent end-to-end transactions are recorded below.

## Live end-to-end covenant journey

The user exercised the public Vercel application with OKX Wallet `0x0d4b860b08b9fba6cf1d928c4a19863176ead563` on Studionet. The live app created and authoritatively loaded covenant `#4`, then added this exact frozen evidence boundary:

1. `acr_html`: `https://www.w3.org/WAI/about/accessibility-statement/`
2. `version_page`: `https://www.w3.org/TR/WCAG22/`
3. `critical_journey`: `https://www.w3.org/WAI/test-evaluate/`
4. `critical_journey`: `https://www.w3.org/WAI/planning/`
5. `critical_journey`: `https://www.w3.org/WAI/people-use-web/`

Create, all five evidence writes, freeze, and two assessment attempts were shown as `FINALIZED`, successful, and confirmed by contract readback. The profile readback after attempt two is `state=UNRESOLVED`, `verdict=UNRESOLVED`, `consequence=HUMAN_REVIEW_REQUIRED`, `attempts=2`, `frozen_at=2026-08-13T15:57:09.143652Z`, and `assessed_at=2026-08-13T16:33:04.000935Z`. The normalized assessment flags all remain false and the reason is `At least one frozen source was unavailable during validator retrieval.` Its source-digest set contains only the retrieved claim page digest `claim_page|https://example.com/?asc=claim|8c1e8564424fdb68b8b7bdff3e16173a2e3599e9b71620637251486c5c4d5ed6`. This is an honest fail-closed consensus consequence; it does not claim scope alignment. The third and final allowed retry was intentionally left unused.

### User transaction matrix

| Actor | UI action / method | Transaction | Final authority and readback |
|---|---|---|---|
| OKX `0x0d4b…ad563` | Register covenant #4 / `create_profile` | `0x8d92666906cb5b7a8169894819d94a63b9dec7cc362a82618f6389aa1b119337` | `FINALIZED / SUCCESS`; exact owner and profile fields read back |
| Same owner | Add ACR / `add_evidence` | `0x9ae6854e33df8848eacb21e4d8a9c702a8782c70ec57c4c9b0bf7d0b58f83fd2` | `FINALIZED / SUCCESS`; evidence count and exact URL read back |
| Same owner | Add version / `add_evidence` | `0x3eef6022f8a98cf4b3fe07fb9cca3923195c5f6aba43628601ad84edd8dc339b` | `FINALIZED / SUCCESS`; exact version URL read back |
| Same owner | Add journey 1 / `add_evidence` | `0x2d5d439ca0ceee187ffd67037d7857eed653205912e6c73cc2f8d7752b6276c3` | `FINALIZED / SUCCESS`; exact journey read back |
| Same owner | Add journey 2 / `add_evidence` | `0x378e4c37ea633f97664dbb22666437a7d0daa0b1eee1d77f646407f04f21374c` | `FINALIZED / SUCCESS`; exact journey read back |
| Same owner | Add journey 3 / `add_evidence` | `0x8ec05ec196b23cb010061b5761be4916252fd215a12dcbed36393f331b1e17d5` | `FINALIZED / SUCCESS`; five-source covenant read back |
| Same owner | Freeze / `freeze_profile` | `0x05e94eca0a8f86a9d91e240a6e26d8c4d780ea5096474aed72cfa7f8806f55ee` | `FINALIZED / SUCCESS`; state `FROZEN`, five sources unchanged |
| Same owner | Assess attempt 1 / `assess_scope` | `0xaa283c703673f2aa60f7d20e1edd961621063c4178c4a410eb6cee75b2102ca8` | `FINALIZED / SUCCESS`; attempts `1`, fail-closed `UNRESOLVED` |
| Same owner | Retry attempt 2 / `assess_scope` | `0xb7b79bbc944231c5011c044b71064f8f107cc2d8f31adfcf5a4f6742ed408634` | `FINALIZED / SUCCESS`; attempts `2`, `HUMAN_REVIEW_REQUIRED` |
| Same owner | Register covenant #5 / `create_profile` | `0x91a36cadb8b34047359ae04645815ebbc1d0a1a0cbc000dc8c6ad539e355acdc` | Corrected baseline-bound client reported success only after exact profile readback |
| Same owner | Add journey to #5 / `add_evidence` | `0x7ad0ca1be75f02100100f10aea50e78715c1c03c49a6b6ac83457eef343576fb` | Corrected client reported success only after exact evidence readback |
| Same owner | Intentionally insufficient freeze / `freeze_profile` | `0x8119239d698470e75fbfb86e378af22ca0ef225876e75c69c3df7074dc092d49` | `FINALIZED / ERROR`; decoded reason `Freeze requires one ACR, one version page, and three to five journeys`; profile stayed `DRAFT`, count stayed `1` |
| Same owner | Register successor covenant #6 / `create_profile` | `0x8a8687faec8233c465b3a4dde24a0c71b1a8efc0f13969bc9bfba157ce07c804` | `FINALIZED / SUCCESS`; exact owner/product and new version `WCAG 2.2.1` read back |
| Same owner | Add #6 ACR / `add_evidence` | `0x7e43fb8bfeb547a7aaaad009019744af5e7c374ccd2f643f00e39a772b13988a` | `FINALIZED / SUCCESS`; exact evidence read back |
| Same owner | Add #6 version / `add_evidence` | `0x0ab0aadcf225d06a37b7a42a6e49ab48205a75ce488bad28cd8b8f7a0f742d53` | `FINALIZED / SUCCESS`; exact evidence read back |
| Same owner | Add #6 journey 1 / `add_evidence` | `0x74d58bc8bfa7ce443977227410df055d9e90230b631643f6a77d1b6ce800bec6` | `FINALIZED / SUCCESS`; exact evidence read back |
| Same owner | Add #6 journey 2 / `add_evidence` | `0x7be3248456f1ec2891e6ea9f1a7e1a6df32217107f1035ca9d317b3b4a5bcea3` | `FINALIZED / SUCCESS`; exact evidence read back |
| Same owner | Add #6 journey 3 / `add_evidence` | `0x0cd0618be1b376ba8c0e7673a1d80b912abb74bcbe5b0769cc9378d34466a49d` | `FINALIZED / SUCCESS`; five-source boundary read back |
| Same owner | Freeze #6 / `freeze_profile` | `0xec0e51ed400ec7ae125be05f72f240c48f30ef836f88b9fb050a855427912ea9` | `FINALIZED / SUCCESS`; after an ambiguous fetch, reload reconciliation proved `FROZEN` by authoritative readback without resubmission |
| Same owner | Link #4 → #6 / `supersede_profile` | `0xa6b1235e435032f74e9cbea6e2a1187c23d88bc43c944d7661f26cb900dbf8f4` | `FINALIZED / SUCCESS`; #4 became `SUPERSEDED/superseded_by=6`, #6 read back `supersedes=4` |

After the rejected freeze, the user hard-refreshed the production alias, re-entered the wallet-connected view and selected `Reconcile`. The corrected bundle rechecked the known hash, decoded the terminal rollback, cleared the pending journal, displayed the exact contract reason and did not resubmit. Explorer still showed the rejected freeze as the newest transaction, proving zero duplicate write.

### Public reader and version-lineage matrix

- A clean browser with no injected provider loaded covenant `#4`; write controls remained disabled while the full five-source `UNRESOLVED / HUMAN_REVIEW_REQUIRED` readback was visible.
- After a clean reload, the same unauthenticated public reader loaded `#4` again with the same owner, attempts, evidence and consequence, with no console error.
- The public reader loaded covenant `#1`, saw `SUPERSEDED` and followed the rendered `Superseded by covenant #2` control. Covenant `#2` then showed `REVIEW_REQUIRED / EVIDENCE_INCOMPLETE` and the reverse `Supersedes covenant #1` relationship. The historical supersession write and both authoritative states are already finalized in `docs/LIVE_STUDIO_EVIDENCE.md`.
- The user then exercised the advertised Vercel write path itself: after freezing successor #6, the live `Link` action submitted `supersede_profile(4, 6)`. The UI showed `FINALIZED`, success and readback; #4 rendered `SUPERSEDED` plus `Superseded by covenant #6`. Clicking that visible relationship loaded #6 without a manual ID entry, where the reverse `Supersedes covenant #4` relationship was rendered from authoritative readback.
- Disconnecting the selected OKX provider made the corrected production UI clear the address and expose `Connect wallet`; write actions were no longer authorized. Four focused tests additionally prove `accountsChanged`, `chainChanged`, provider `disconnect`, and cleanup of all registered listeners.
- The user wallet selector showed four unique providers and connected only the explicitly chosen OKX provider. No automatic MetaMask or first-provider request occurred.

Intermittent RPC/SDK and wallet behavior discovered during the journey produced the corrective chain from `8e33b4b` through `4b10293`. The final client polls conservatively, accepts supported SDK status shapes, distinguishes absent finality from explicit `false`, binds pending intent to actor plus pre-write baseline, requires `FINALIZED/SUCCESS` for known hashes, proves a new transition for hashless recovery, decodes rollback payloads without serializing hostile receipt internals, clears stale wallet authority on provider events, and exposes two-way lineage readback. The regression suite is included in the 35 passing frontend tests.

## Gate history and scope disclosure

- Anonymous `PRE_DEPLOY`: `APPROVED` for the exact contract source later deployed.
- Anonymous `POST_DEPLOY_TEST`: `APPROVED` for commit `7dc65dcef5e36e268bb52898d36bba89e29d3f47` and the 28-entry post-deploy manifest.
- The contract source, dependencies and canonical Studionet deployment are unchanged. Frontend wallet discovery, transaction recovery, regression tests, the production bundle and release evidence changed after the user exposed live browser/provider behavior; prior final approval is therefore superseded and a fresh exact-revision review is required.
- The final evidence commit and manifest will be supplied to anonymous `POST_GITHUB_VERCEL_FINAL`; Task status remains pending until that exact package receives anonymous approval and the primary AI approves the same revision.

## User wallet test

Automated checks did not impersonate the user's wallet. The user first completed the connection-only selector check, then explicitly approved the covenant `#4` success-path writes and covenant `#5` rejection-path writes listed above. Every submitted write is tied to its Studionet transaction hash and authoritative contract readback; the failed freeze remained rolled back and reconciliation issued no duplicate transaction.
