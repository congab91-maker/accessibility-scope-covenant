# Live Studio evidence ledger

Status: `READY FOR POST_DEPLOY_TEST REVIEW` — all required live cases below are reconciled; anonymous approval is still pending.

Network: GenLayer Studionet (`61999`)

Contract: `0xe416bd995e6eD1998397EF2675f1a1f390Ab652a`

Exact deployed source SHA-256: `A9BCD2B7E047AFD3C257FCCF911190BFD8DE9B41F90491B297A541D2E837BBAB`

Exact deployed source commit: `c566032159f42f62c0958ea3e8f28f679b166966`

Primary Studio account / profile owner / deployer / upgrader: `0x2e53bb6ED175A7F827590D9D3a353FC51Eb8996a`

## Reconciled cases

Every write below reached Studio `FINALIZED`. Successful rows show validator agreement and execution `SUCCESS`; expected rejection rows show validator agreement on `ERROR`. Each mutation is paired with a finalized-state readback or an explicit unchanged-state check.

| Case | Purpose and exact non-secret arguments | Transaction | Authoritative result | Verdict |
|---|---|---|---|---|
| DEP-01 | Deploy exact approved source; no constructor arguments | `0x8add8f28275136ec6604be66b26c224e31e94cdfcb8c5e3f840ac4fb7f3b19d4` | Contract code hash equals the source hash above; `get_upgrader()` equals the recorded account | PASS |
| P1-CREATE | `create_profile("live-c566032-001", "W3C WAI Accessibility Resources", "WCAG 2.2", "W3C WAI accessibility resources describe WCAG 2.2 guidance for evaluating accessible web content.", "https://www.w3.org/WAI/standards-guidelines/wcag/")` | `0x1f17cd2a244ab94985b291a485b8998559f9df30796889800194517a4d464e95` | Returned profile `1`; readback owner and all intent fields match; state `DRAFT` | PASS |
| P1-E01 | `add_evidence(1, "acr_html", "https://www.w3.org/WAI/planning/statements/")` | `0xa0fc3bdb623a715ccdfe514e2bb6d4ab2261120d29aed9e964da918cd5772e47` | Evidence index `0` matches | PASS |
| P1-E02 | `add_evidence(1, "version_page", "https://www.w3.org/WAI/standards-guidelines/wcag/new-in-22/")` | `0x1ffc3541496aaec4a333656e0a87de06d731b42d0da68bf074221b331d8cedbe` | Evidence index `1` matches | PASS |
| P1-E03 | `add_evidence(1, "critical_journey", "https://www.w3.org/WAI/tutorials/forms/")` | `0x4692bb2f0a653f3bf5ef28ae9de872ab3d127a2c3eeafba170ce2bd4244611b2` | Evidence index `2` matches | PASS |
| P1-E04 | `add_evidence(1, "critical_journey", "https://www.w3.org/WAI/tutorials/images/")` | `0x3748dde00355c3d3d02540ca6efc44886968ada46930fd624935552f2673dd19` | Evidence index `3` matches | PASS |
| P1-E05 | `add_evidence(1, "critical_journey", "https://www.w3.org/WAI/tutorials/tables/")` | `0xdff5b24a70432361712c5f2d721e1a92a64416d5f1be7ef875fb353d6d864331` | Evidence index `4` matches; stale Studio sidebar `PENDING` was rejected as authority | PASS |
| P1-FREEZE | `freeze_profile(1)` | `0xcd3489ab4e0ff2f6f42f7e292192730cf392d6dab5978f434791a516f46eeaac` | State `DRAFT -> FROZEN`; `frozen_at` set; five frozen evidence records unchanged | PASS |
| P1-ASSESS-1 | `assess_scope(1)` from `FROZEN`, attempts `0` | `0x84d66ab04f6d702cb7ba7e30b463c62943df8d4a0544a98bfa1a27ec00e34102` | Safe `UNRESOLVED`; attempts `1`; reason: at least one frozen source unavailable; no substantive verdict invented | PASS |
| P1-ASSESS-2 | Bounded retry `assess_scope(1)`, attempts `1` | `0x79d3c9ee50a356fe2b1924c78ba3857cbd393d9788ee1c4a387c35f0eaf91b31` | Safe `UNRESOLVED`; attempts `2`; state/value consequence remains fail-closed | PASS |
| P1-ASSESS-3 | Final allowed retry `assess_scope(1)`, attempts `2` | `0x232827ab6c70cef0c2c3ca0019545219fb3b4b147f6561f599e6d8aa799b2b2a` | Safe `UNRESOLVED`; attempts `3`; no irreversible favorable claim | PASS |
| P1-ASSESS-LIMIT | Fourth `assess_scope(1)` with pre-readback attempts `3` | `0xf69881b6a38321431bbf0daf978ff833e6f8ebb62c3c01d4fc31da746a0d7af2` | `FINALIZED`, majority agree, leader `ERROR`, decoded result `Assessment retry limit reached`; profile remains attempts `3`, `UNRESOLVED` | PASS |
| P2-CREATE | `create_profile("live-c566032-002", same product/version, example.com claim and claim URL)` | `0xd8a15fcaa8075daa00c936649f0882fdaf8aa7ed6d07dd4720457133a6ff6e96` | Returned profile `2`; profile count `2`; exact fields and owner match; state `DRAFT` | PASS |
| P2-E01 | `add_evidence(2, "acr_html", "https://example.com/?e=acr")` | `0xc6f0c6654f8503b4b7da85cd3d3ad8c9544ee0be856a87d9387e754a4dc0a008` | Evidence count `1`; index `0` matches | PASS |
| P2-E02 | `add_evidence(2, "version_page", "https://example.com/?e=version")` | `0xcad800e1731994990ee4047ced3dc9800c84a309d9567e137ab96938191a8e30` | `FINALIZED`, majority agree, leader `SUCCESS`; evidence count `2`, index `1` matches | PASS |
| P2-J01 | `add_evidence(2, "critical_journey", "https://example.com/?e=journey-1")` | `0x99ef82d8a919b5ef0f78daa79f1c9d578777233a76fcefeedc97f7af6359e222` | Studio `FINALIZED`; later aggregate readback includes the exact record | PASS |
| P2-J02 | `add_evidence(2, "critical_journey", "https://example.com/?e=journey-2")` | `0xf1232a83e38089c97200affdd2f099da1c30b36ddabbddfcfd0d7b6589cfd2da` | Studio `FINALIZED`; later aggregate readback includes the exact record | PASS |
| P2-J03 | `add_evidence(2, "critical_journey", "https://example.com/?e=journey-3")` | `0x17837b79e745dadc82d307d3a00aacc4ae5b16fac297a873f814a6ad5bb66cb1` | Studio `FINALIZED`; evidence count `5`, index `4` is the exact journey-3 record | PASS |
| P2-J04 | `add_evidence(2, "critical_journey", "https://example.com/?e=journey-4")` | `0x45e98183c971ba8b476ae0dced689b530c8f2ce7601eaccde7bd99cbf9cb020f` | Studio `FINALIZED`; aggregate readback includes the exact record | PASS |
| P2-J05 | `add_evidence(2, "critical_journey", "https://example.com/?e=journey-5")` | `0x34a70a96c5f6ba8e31b594c35234d159ab8fb131c75bb14340de56f5e9a36a05` | Studio `FINALIZED`; evidence count `7` and complete ordered readback contains one ACR, one version page, and five exact journeys | PASS |
| P2-J06-LIMIT | `add_evidence(2, "critical_journey", "https://example.com/?e=journey-6")` with five journeys already stored | `0x29b300dde4807060df49ccb2c2cfd310e37073c846224e4d7037b9f0af4944d2` | `FINALIZED`, majority agree, leader `ERROR`, result `A profile supports at most five critical journeys`; evidence count remains `7` | PASS |
| P2-E07-IDEMPOTENT | Exact replay of journey 5 | `0x2bff1add35479cfe7bcc279ad6eabac1bcb5ccb858bfa424f3bc47a2481fee43` | `FINALIZED / SUCCESS`; evidence count remains `7` | PASS |
| P2-ACR-CONFLICT | Add a different `acr_html` URL after the singleton ACR exists | `0x964e93a2e60cb9b85dd88215aadd61585a6443f6139b13015baf2c9ad20bebdd` | `FINALIZED / ERROR`: `This evidence kind already has a different source`; count remains `7` | PASS |
| P2-KIND-INVALID | Add an unsupported evidence kind | `0xd4798a0ed82425d9ac48da08ada8fb371523cdea62908ccebfe48172849feff5` | `FINALIZED / ERROR`: `Unsupported evidence kind`; count remains `7` | PASS |
| P2-FREEZE | `freeze_profile(2)` with one ACR, one version page, and five journeys | `0x8936d301131f31282e77afce688ae1c9467096391f26714d0fc84adb72faf1ba` | State becomes `FROZEN`; `frozen_at=2026-08-13T12:17:42.278917Z` | PASS |
| P2-FREEZE-IDEMPOTENT | Exact replay of `freeze_profile(2)` | `0xef71055919dd87d738731e067f0238965fce535f07ed45f3d083f93aa6ca254a` | `FINALIZED / SUCCESS`; state and original `frozen_at` remain unchanged | PASS |
| P2-ASSESS | `assess_scope(2)` over eight reachable `example.com` sources | `0x212347e599f298209266ea7280bc49c2ee08005babeca15feafeaa4fe003def4` | Substantive `EVIDENCE_INCOMPLETE`; `product_match=true`, `version_match=true`, `evidence_complete=false`, attempts `1`, state `REVIEW_REQUIRED`, consequence `HUMAN_REVIEW_REQUIRED`; all eight source digests recorded | PASS |
| P1-P2-SUPERSEDE | `supersede_profile(1, 2)` | `0x93e16faac5d8a23d29d202299fb438f2fa6cfa3a395d4cde57182d6f90416d95` | Profile 1 is `SUPERSEDED` by 2; profile 2 records `supersedes=1` | PASS |
| P1-P2-SUPERSEDE-IDEMPOTENT | Exact replay of `supersede_profile(1, 2)` | `0xc3e6665cd1bba7f7fa952e2c8d384e7f55c0112c289cb2ba205b4c5b98027707` | `FINALIZED / SUCCESS`; both immutable links remain unchanged | PASS |
| AUTH-P2-MUTATION | Account `0x28e9...Cb6B` calls `add_evidence(2, "accessibility_statement", "https://example.com/?e=unauthorized")` | `0xaa704cb449cac381d05fd08916f2c877ae95445d308cf3fd7a5369b9dad71039` | `FINALIZED / ERROR`: `Only the profile registrant can perform this action`; profile-2 evidence count remains `7` | PASS |
| P3-CREATE | Second account creates fixture `asc-live-actor-20260813` | `0x5fd823eb92386e2d328b0cbcf7dc6aba7fbe62b5895b7214d89a32f0b69ac387` | `FINALIZED / SUCCESS`; returns profile `3`, owner is the second account | PASS |
| P3-CREATE-IDEMPOTENT | Exact replay of the P3 create intent | `0xb084f3eb07d3a016f985e800582ed8ecefb53db1749df48eb7ec08f515d339db` | `FINALIZED / SUCCESS`; returns the existing ID `3`; profile count remains `3` | PASS |
| P3-CLIENT-REF-CONFLICT | Same owner/ref with changed claim text | `0x2e293128b0d58d547e4cee2651a4944a17f40df69225dd979e323ff62902a6df` | `FINALIZED / ERROR`: `Client reference already belongs to another profile intent`; profile count remains `3` | PASS |
| URL-INVALID | Create intent with `http://example.com/invalid` | `0x7aa94cb02964bb915020985fb14ee59348000c4f574b4b74a1a4addec72fb93a` | `FINALIZED / ERROR`: `Evidence URLs must use public HTTPS`; profile count remains `3` | PASS |
| P3-FREEZE-INSUFFICIENT | `freeze_profile(3)` with zero evidence | `0xd5022943da39a8ab3d1070cac17d844aff61a3464905ab8f82dc700203b3d6fe` | `FINALIZED / ERROR`: exact freeze covenant not met; P3 remains `DRAFT`, evidence count `0` | PASS |
| P3-SUPERSEDE-SELF | `supersede_profile(3, 3)` | `0x5a295b2ece00fb1a15835b27d5b983bb878eb4f7acb423ecc58f0f33b5f6c580` | `FINALIZED / ERROR`: `A profile cannot supersede itself`; P3 remains unchanged | PASS |

## Separate exact-source upgrade rehearsal

Rehearsal contract: `0xF83B36B0B66C0C08DDc3f36f4B5ecCe06d2D355D`. It is disposable evidence only and is never used by the frontend or as the canonical release.

| Case | Purpose | Transaction | Authoritative result | Verdict |
|---|---|---|---|---|
| UPG-DEPLOY | Deploy the exact 20,529-byte canonical source from the deployer account | `0x3ea45811fd48d56c7b6deb37509e2cf9e7f67ff3f3affd0cd92b3de135a5e80b` | `FINALIZED / SUCCESS`; `gen_getContractCode` SHA-256 is `A9BCD2...BBAB` | PASS |
| UPG-STATE | Create `asc-upgrade-rehearsal-20260813` before upgrade | `0xe2f3659963711be69d584a50ccc695573ce738b47916919b8fe2a422ef9e21af` | `FINALIZED / SUCCESS`; returns profile `1` | PASS |
| UPG-AUTHORIZED | Deployer calls `upgrade(b#<exact 20,529 source bytes>)` | `0x7e4b2662696615911f42cce6e10018734daed29dbd50d3f7d1b2460bec7dcc30` | `FINALIZED / SUCCESS`; code remains 20,529 bytes with canonical SHA-256; profile count `1`, exact fixture profile, and upgrader readback are preserved | PASS |
| UPG-UNAUTHORIZED | Account `0x28e9...Cb6B` calls the same exact-source upgrade | `0x2a8f51729dff46e6291ba5996f3ff68c48cf8aa54dbfbdad2a0fda8729200b97` | `FINALIZED / ERROR`; Root Slot storage write is `forbidden`; code SHA-256, profile count `1`, and exact fixture profile remain unchanged | PASS |

## Finalized readback matrix

| View | Finalized-state result | Verdict |
|---|---|---|
| `get_profile_count()` | Canonical count `3` | PASS |
| `get_profile(1)` | `SUPERSEDED`, `superseded_by=2` | PASS |
| `get_profile(2)` | `REVIEW_REQUIRED`, `EVIDENCE_INCOMPLETE`, attempts `1`, `supersedes=1` | PASS |
| `get_profile(3)` | Owner `0x28e9...Cb6B`, `DRAFT`, zero attempts, no supersession links | PASS |
| `get_evidence_count(2)` and ordered `get_evidence(2, 0..6)` | Count `7`; exact one ACR, one version page, five journeys | PASS |
| `get_evidence_count(3)` | `0` after rejected freeze/self-supersede | PASS |
| `get_assessment(2)` | Substantive normalized result and eight source digests match P2-ASSESS | PASS |
| `get_profile_by_client_ref(0x28e9...Cb6B, "asc-live-actor-20260813")` | `3` | PASS |
| `get_upgrader()` | `0x2e53...8996a` | PASS |

## Operational attempts with no transaction

These are retained so the package does not hide retries. They did not create an on-chain case because Studio returned no transaction hash and authoritative profile readback remained unchanged.

| Attempt | Observed failure | Reconciliation and control |
|---|---|---|
| OP-01 | The first profile-2 form verification compared JSON key order and reported a mismatch even though every field value matched. | No send call occurred. Values were compared field by field before the later successful transaction. |
| OP-02 | A stale Studio tab accepted a create-button click but emitted no transaction. | `get_profile_count()` remained `1` and client-ref lookup returned `0`; no retry occurred until those reads completed. |
| OP-03 | Reload navigation returned `ERR_CONNECTION_CLOSED` and the browser safety policy blocked history navigation from the generated error page. | No chain write occurred. A fresh Studio tab selected the existing contract by name and verified address `0xe416...652a` before continuing. |
| OP-04 | A transaction reconciliation request hit `30 requests/minute`, retry-after 60 seconds. | All polling stopped for the minute window. P2-E02 was later reconciled as `FINALIZED / SUCCESS` without resending. |
| OP-05 | The first P2 journey-4 send click produced no transaction hash while Studio was under the same minute-window pressure. | Readback remained count `5`; only after cooldown and a fresh unchanged readback was the successful P2-J04 transaction sent. |
| OP-06 | The first exact-duplicate click for journey 5 produced no new transaction hash. The next readback hit `500 requests per hour`, retry-after `3600` seconds. | All Studio/RPC activity stopped. After the hourly reset, unchanged count `7` was verified before the successful idempotency transaction P2-E07-IDEMPOTENT. |
| OP-07 | The first unauthorized rehearsal-upgrade click produced no transaction hash while the selected account balance was still loading. | Contract transaction history showed no new item and account nonce was `latest=pending=0x6f`, proving no in-flight write. One retry then produced UPG-UNAUTHORIZED; no duplicate was created. |

## Remaining checkpoint

All required Studionet cases, finalized readbacks, frontend address wiring, and the separate upgrade rehearsal are complete. The project remains `DEPLOYMENT_READY` until an anonymous co-review AI approves the exact committed `POST_DEPLOY_TEST` evidence revision. GitHub and Vercel remain intentionally untouched until that approval and the user's mandatory account/team target confirmation.
