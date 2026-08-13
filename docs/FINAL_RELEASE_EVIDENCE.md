# Final public release evidence

Checkpoint target: `POST_GITHUB_VERCEL_FINAL`

Evidence captured: 2026-08-13 (Asia/Saigon)

## Exact release identity

- Reviewed post-deploy commit: `7dc65dcef5e36e268bb52898d36bba89e29d3f47`
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
- Deployment ID: `dpl_7HLphF9P2Ju3RBSGo5TzZU9WnGD5`
- Status: `Ready`
- Production JavaScript: `/assets/index-DHpveAjY.js`
- Public/local bundle SHA-256: `3F423315BAFEC479F1CD6D7DADE952DC537067360F80BBF8C990689F8EF0181C`
- Public bundle size: `597,254` bytes

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

The first real-extension user check exposed duplicate Backpack announcements and a duplicate legacy MetaMask alias. The final discovery path deduplicates the same provider object and same EIP-6963 reverse-domain identity, uses normalized display name only to suppress an identity-less legacy alias, and preserves distinct reverse-domain identities even when display names match. Four focused regression cases pass. On the final production alias, the selector showed exactly four unique detected providers — Phantom, OKX Wallet, MetaMask and Backpack — with no duplicate or mislabeled row. The user then selected OKX Wallet and verified that the header displayed both the connected address (`0x0d4b8…ad563`) and `Studionet · 61999`. No write transaction was requested or signed.

## Gate history and scope disclosure

- Anonymous `PRE_DEPLOY`: `APPROVED` for the exact contract source later deployed.
- Anonymous `POST_DEPLOY_TEST`: `APPROVED` for commit `7dc65dcef5e36e268bb52898d36bba89e29d3f47` and the 28-entry post-deploy manifest.
- The contract source, dependencies and canonical Studionet deployment are unchanged. Frontend wallet discovery, its regression tests, the production bundle and release evidence changed after the user exposed duplicate provider aliases; prior final approval is therefore superseded and a fresh exact-revision review is required.
- The final evidence commit and manifest will be supplied to anonymous `POST_GITHUB_VERCEL_FINAL`; Task status remains pending until that exact package receives anonymous approval and the primary AI approves the same revision.

## User wallet test

Automated checks did not impersonate the user's wallet. The user completed the required connection-only check with OKX Wallet on the public production alias and returned screenshot evidence showing the provider name, abbreviated connected address and Studionet chain label. This test sent no project write transaction.
