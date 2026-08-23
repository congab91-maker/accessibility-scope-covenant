# Judge remediation deployment evidence

Status: replacement deployment and primary live matrix complete; anonymous `POST_DEPLOY_TEST` review pending.

Exact reviewed source revision: `8d05d03b3635c8f3ec740658f3cff61fa870d6e8`

Contract source SHA-256: `2829951136974620B731189817FA0A868206162C177B276255C7FB8BC79748C0`

Studionet contract: `0xc575a4F5F6006F411f03dF1Be2Cd9eE9EC83d617`

Deployer and Root Slot upgrader: `0xeF5D2119416A2f5afa35dCFA209766EFC1BE5902`

## Deployment

- Deployment transaction: `0xba76a030bdd5142fd8dbc5d9c59b0a8eda81d795554ded612a54489b3e37beff`.
- SDK readback: `statusName = FINALIZED`; both leader receipts report `execution_result = SUCCESS` and no error.
- EVM-compatible receipt: `status = 0x1`.
- `gen_getContractCode` decoded to 20,601 bytes and reproduced the reviewed source SHA-256 above.
- Finalized contract reads returned the selected account from `get_upgrader` and `0` from the initial `get_profile_count`.

## Owner authorization regression

### Complete setup-write ledger

Every setup write below was sent by owner A `0xeF5D2119416A2f5afa35dCFA209766EFC1BE5902`, reached `FINALIZED`, had at least one successful leader execution, and was confirmed by finalized contract readback. The leader-result vector is retained because some deterministic setup writes finalized with a mixed `SUCCESS,ERROR` validator vector; those rows are not relabeled as unanimous execution. Sequential evidence-count readback advanced from 1 through 5 for each profile. Final readback reproduces every kind/URL listed below, profile ownership, and the frozen timestamp.

| Profile | Method and arguments | Transaction | Leader results | Authoritative post-write readback |
| --- | --- | --- | --- | --- |
| #1 | `create_profile("judge-remediation-20260823-owner-a", "W3C Accessibility Resources", "WCAG 2.2", claim, "https://www.w3.org/WAI/standards-guidelines/wcag/")` | `0x2540b5d0c5679b9120da33a0c927a7912942bb81bcd9b7c0d90ccee6247e6e58` | `SUCCESS,ERROR` | profile `#1`; owner A; `DRAFT`; evidence count 0 |
| #1 | `add_evidence(1, "acr_html", "https://www.w3.org/WAI/about/accessibility-statement/")` | `0x85d69ee3457f0e8aa8cd2aacae73b2b40f82e1adda98a8db577b43ab063ac767` | `SUCCESS,ERROR` | evidence count 1; index 0 exact kind/URL |
| #1 | `add_evidence(1, "version_page", "https://www.w3.org/TR/WCAG22/")` | `0x22aaafc999bcad61410a5ff0d1df7bf617b1c5c6e60724e9a587dc54dcee156c` | `SUCCESS,ERROR` | evidence count 2; index 1 exact kind/URL |
| #1 | `add_evidence(1, "critical_journey", "https://www.w3.org/WAI/test-evaluate/")` | `0xfc48fec9cf853f7db87c89b6f1f11a0859f0427befde943df47ae4229edcff58` | `SUCCESS,SUCCESS` | evidence count 3; index 2 exact kind/URL |
| #1 | `add_evidence(1, "critical_journey", "https://www.w3.org/WAI/planning/")` | `0x99e19d496b8461ac3c3c457c6b70f35050e4340ab0078d6fc24aaf387a1dd1a3` | `SUCCESS,ERROR` | evidence count 4; index 3 exact kind/URL |
| #1 | `add_evidence(1, "critical_journey", "https://www.w3.org/WAI/people-use-web/")` | `0x2483d51ba6b65b30361bc71034e3de69139ea2934d5e02f18d48d41bbad36566` | `SUCCESS,SUCCESS` | evidence count 5; index 4 exact kind/URL |
| #1 | `freeze_profile(1)` | `0xb8baa6eca7e598cb9a33b7f86dd5bab5c6bf2ef16a641ea31631fcab0bc9c28c` | `SUCCESS,ERROR` | `FROZEN`; attempts 0; `frozen_at = 2026-08-23T04:36:56.817282Z`; assessment empty |
| #2 | `create_profile("judge-remediation-20260823-owner-a-v2", "W3C Accessibility Resources", "WCAG 2.2.1", claim, "https://docs.genlayer.com/developers")` | `0x2e87abe8f15c79bdf001057bc441201266c8d462df72a26b8c3af6dfbbb6f9c4` | `SUCCESS,SUCCESS` | profile `#2`; owner A; `DRAFT`; evidence count 0 |
| #2 | `add_evidence(2, "acr_html", "https://docs.genlayer.com/developers")` | `0x4041c074554af882a8461fd10775493f322710b0899915fec30dfa784b0d6674` | `SUCCESS,ERROR` | evidence count 1; index 0 exact kind/URL |
| #2 | `add_evidence(2, "version_page", "https://docs.genlayer.com/developers/intelligent-contracts")` | `0x3e6355ee40718186eeeb0ba79135dd5a55fb7a52128333d7464f334fa2536671` | `SUCCESS,SUCCESS` | evidence count 2; index 1 exact kind/URL |
| #2 | `add_evidence(2, "critical_journey", "https://docs.genlayer.com/developers/frontend")` | `0x9a2ffd4dccd6ec4f85103b027f9bb036b9292931e6b6a185cfd0812f2e4e574f` | `SUCCESS,SUCCESS` | evidence count 3; index 2 exact kind/URL |
| #2 | `add_evidence(2, "critical_journey", "https://docs.genlayer.com/developers/studio")` | `0x036eda8fb222ed6da8fdb6bb235bc4857ed52635a3cf7a882058aaca027d3c91` | `SUCCESS,SUCCESS` | evidence count 4; index 3 exact kind/URL |
| #2 | `add_evidence(2, "critical_journey", "https://docs.genlayer.com/developers/networks")` | `0x59526c198aeb03579dd86cbed4e1abd7bf07d0c4f25495a3875e1ddd5af20c35` | `SUCCESS,ERROR` | evidence count 5; index 4 exact kind/URL |
| #2 | `freeze_profile(2)` | `0xb0845d15115bf2794a67fcd4498da82315fddac3e77c784284b71817dfb0ef1d` | `SUCCESS,SUCCESS` | `FROZEN`; attempts 0; `frozen_at = 2026-08-23T04:45:23.665797Z`; assessment empty |

Owner A (`0xeF5D...5902`) created profile `#1`, added exactly five references, and froze the source-reference boundary. Before any assessment, finalized readback was `state = FROZEN`, `attempts = 0`, empty verdict/consequence/assessed timestamp, and an empty assessment record.

Owner B (`0x34b92E...9D78`) then called `assess_scope(1)` in transaction `0xa05b2837a947fc6157a2b00937c302cea89df645517a80a7969821d31ea5967f`. The transaction reached `FINALIZED`; both leader receipts rolled back with the exact payload `Only the profile registrant can perform this action`. Finalized readback remained byte-for-byte equivalent in the decision fields: `state = FROZEN`, `attempts = 0`, empty verdict/consequence/assessed timestamp, and empty assessment. The unauthorized call therefore consumed no retry and stored no assessment-time digest.

Owner A then called the same method in transaction `0x6e5c31c959b29aa0bda77ec0d05c2b4d1911e02bf8634b1ca3fdb2184cef96c7`. It reached `FINALIZED`; the authorized call consumed exactly one attempt. Validator retrieval could not render every W3C reference, so the contract correctly failed closed to `UNRESOLVED / HUMAN_REVIEW_REQUIRED`.

## Assessment-time digest binding and supersession

Owner A created successor profile `#2`, added five references, and froze it. Its authorized assessment reached `FINALIZED` in transaction `0x65ac97d62b159f7e63e2ff8ca468a57438bd0cbf05bf8ee95110c4294e5ef6a7` and stored two SHA-256 bindings before a later source failed retrieval. Both stored entries bind kind, canonical URL, and normalized-content digest; no content digest existed at freeze time. The resulting state is the valid fail-closed `UNRESOLVED / HUMAN_REVIEW_REQUIRED`, with `attempts = 1`.

The two-argument call `supersede_profile(1, 2)` reached `FINALIZED` in transaction `0xa33e846f1502717fec72e0390f7de030409a1880dc5cf84f720dec0826d23b77`. Finalized readback proves profile `#1` is `SUPERSEDED` with `superseded_by = 2`, while profile `#2` has `supersedes = 1`.

The historical contract `0xe416bd995e6eD1998397EF2675f1a1f390Ab652a` remains independently readable. No profile or storage migration was performed.
