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

Owner A (`0xeF5D...5902`) created profile `#1`, added exactly five references, and froze the source-reference boundary. Before any assessment, finalized readback was `state = FROZEN`, `attempts = 0`, empty verdict/consequence/assessed timestamp, and an empty assessment record.

Owner B (`0x34b92E...9D78`) then called `assess_scope(1)` in transaction `0xa05b2837a947fc6157a2b00937c302cea89df645517a80a7969821d31ea5967f`. The transaction reached `FINALIZED`; both leader receipts rolled back with the exact payload `Only the profile registrant can perform this action`. Finalized readback remained byte-for-byte equivalent in the decision fields: `state = FROZEN`, `attempts = 0`, empty verdict/consequence/assessed timestamp, and empty assessment. The unauthorized call therefore consumed no retry and stored no assessment-time digest.

Owner A then called the same method in transaction `0x6e5c31c959b29aa0bda77ec0d05c2b4d1911e02bf8634b1ca3fdb2184cef96c7`. It reached `FINALIZED`; the authorized call consumed exactly one attempt. Validator retrieval could not render every W3C reference, so the contract correctly failed closed to `UNRESOLVED / HUMAN_REVIEW_REQUIRED`.

## Assessment-time digest binding and supersession

Owner A created successor profile `#2`, added five references, and froze it. Its authorized assessment reached `FINALIZED` in transaction `0x65ac97d62b159f7e63e2ff8ca468a57438bd0cbf05bf8ee95110c4294e5ef6a7` and stored two SHA-256 bindings before a later source failed retrieval. Both stored entries bind kind, canonical URL, and normalized-content digest; no content digest existed at freeze time. The resulting state is the valid fail-closed `UNRESOLVED / HUMAN_REVIEW_REQUIRED`, with `attempts = 1`.

The two-argument call `supersede_profile(1, 2)` reached `FINALIZED` in transaction `0xa33e846f1502717fec72e0390f7de030409a1880dc5cf84f720dec0826d23b77`. Finalized readback proves profile `#1` is `SUPERSEDED` with `superseded_by = 2`, while profile `#2` has `supersedes = 1`.

The historical contract `0xe416bd995e6eD1998397EF2675f1a1f390Ab652a` remains independently readable. No profile or storage migration was performed.
