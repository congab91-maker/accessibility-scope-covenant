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
- Immutable deployment: `https://accessibility-scope-covenant-jd7ngxnix-brunogg.vercel.app`
- Deployment ID: `dpl_ANL16AMXqj3Ci9Ebz4DKJCWZp3dM`
- Status: `Ready`
- Production JavaScript: `/assets/index-CR9vpwsn.js`
- Public/local bundle SHA-256: `23F1F50E10C8D194B434D2BDD25EB018646DFBBC14AC13AACA49DA30D998E4DD`
- Public bundle size: `596,637` bytes

The public production bundle and local production bundle are byte-identical. The public bundle contains the canonical address and does not contain the disposable rehearsal address.

## Live frontend checks

- Production alias returned HTTP `200` and rendered `Accessibility Scope Covenant`.
- The page displayed `Studionet · 61999` and the canonical contract abbreviation `0xe416b…b652a`.
- At the live 1280-by-720 viewport, document width was 1265 pixels: no horizontal overflow.
- `Connect wallet` opened an explicit `Choose a wallet` provider-selector dialog.
- With no compatible EIP-1193 provider detected, the dialog displayed that state and only offered `Cancel`; it did not select MetaMask, select a first provider, or request a connection.
- Cancelling closed the dialog without a wallet request.
- Prior deterministic browser coverage verified widths 320, 375, 414, 768, and 1280, no unsafe links, and no console errors.

## Gate history and scope disclosure

- Anonymous `PRE_DEPLOY`: `APPROVED` for the exact contract source later deployed.
- Anonymous `POST_DEPLOY_TEST`: `APPROVED` for commit `7dc65dcef5e36e268bb52898d36bba89e29d3f47` and the 28-entry post-deploy manifest.
- This revision changes release/evidence documentation only. Contract source, frontend source, tests, dependencies, the canonical deployment, and the deployed production bundle are unchanged from the approved post-deploy revision.
- The final evidence commit and manifest will be supplied to anonymous `POST_GITHUB_VERCEL_FINAL`; Task status remains pending until that exact package receives anonymous approval and the primary AI approves the same revision.

## User wallet test boundary

Automated checks do not impersonate the user's wallet. The user may now open the production alias, choose their actual supported provider, approve the Studionet switch if prompted, and confirm that the connected address is displayed. No write transaction is required for this connection-only check.
