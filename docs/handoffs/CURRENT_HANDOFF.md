# Current Handoff: Pre-live audio control stack

Updated: 2026-07-13T03:12:00-06:00

## Live-verified state

- Repository/worktree: `E:\Git\Sonos-Controller-EQ`
- Branch: `agent/prelive-audio-control-stack`
- Base: `1ee1eb396c97ae2d26a17bcba199b4ca295db918` (`main`)
- Last pushed handoff checkpoint: `ea18ca9`
- Latest implementation checkpoint: `4aa50809325c01044600ec188182f69e937388f9`
- Draft PR: [#5](https://github.com/Breeze2323/Sonos-Controller-EQ/pull/5), targeting `main`
- Exact-head CI: `ea18ca9` is green. Both Node 20 and 22 on Ubuntu and Windows completed successfully (two workflow runs, eight checks total). CI for `4aa5080` is pending push.
- Worktree was clean before the profile-migration checkpoint.

## Completed bounded checkpoints

- `3b21de3`: Sonos HTTP adapter contracts, source-coverage domain states, and basic REW filter parsing.
- `e87ddd9`: sandbox-only Equalizer APO adapter with recoverable configuration writes.
- `7705b9c`: scoped Sonos and DSP controller routes.
- `7861031`: client-side filter-response and clipping-risk calculation primitives.
- `8fccede`, corrected by `31124f0`: initial unified profile-schema migration and tests.
- `4aa5080`: persisted-collection migration, shared source-coverage contract, malformed-record recovery retention, and compatibility projection for the current profile UI.

## Current implementation state

- Sonos adapter defaults to read-only behavior; settings application returns a structured block unless writes are explicitly enabled. No live request has been made.
- Equalizer APO support is restricted to an injected sandbox root. It has not detected, installed, configured, or written to a live APO installation.
- DSP routes use the mock adapter by default. Their stage/apply semantics still need to be separated before any real adapter is considered.
- Unified profile migration is applied at the `useProfiles` persistence boundary. Valid v1 entries are upgraded, invalid entries remain persisted and are exposed through `profileMigrationRejections`, and an early nested-only v2 shape is repaired with a temporary flat UI projection.
- Source-coverage defaults now live in `shared/domain/sourceCoverage.js`; server consumers retain their existing import path through a re-export.

## Local validation evidence

Using the bundled Node 24 runtime, `npm test -- --test-name-pattern="profile"` passed (14 tests) and `npm run check` passed: lint, 23 tests, production build, and secret scan. Earlier in the milestone, `npm ci --ignore-scripts` and PowerShell parser validation also passed. `npm audit` reported 12 inherited vulnerabilities in the pinned legacy `node-sonos-http-api` dependency; no upgrade was made.

The default shell Node is older and emits engine warnings. Use the bundled runtime path before npm commands:

```powershell
$nodeBin='C:\Users\Ty\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin'
$fallback='C:\Users\Ty\.cache\codex-runtimes\codex-primary-runtime\dependencies\bin\fallback'
$override='C:\Users\Ty\.cache\codex-runtimes\codex-primary-runtime\dependencies\bin\override'
$env:PATH="$nodeBin;$override;$fallback;$env:PATH"
```

## Incomplete work and next atomic unit

1. Commit and push this handoff update, then verify exact-head CI for the resulting branch head.
2. Separate DSP configuration staging from applying in the mock route contract; staging must not claim or perform application.
3. Strengthen Equalizer APO sandbox-path validation (allowlist/canonical-path behavior) and add focused security tests without inspecting or touching a live APO path.
4. Commit/push the next atomic unit and update these handoffs again.

## Safety and approval gates

No Sonos writes, production-controller requests, port-3000 startup, Windows audio endpoint/DSP changes, Equalizer APO installation, or live playback changes were performed. The next non-code gate remains `EQUALIZER_APO_INSTALLATION_APPROVAL_REQUIRED`; live DSP and Sonos writes remain separately gated.
