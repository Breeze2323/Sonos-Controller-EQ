# Current Handoff: Pre-live audio control stack

Updated: 2026-07-13T02:59:51-06:00

## Live-verified state

- Repository/worktree: `E:\Git\Sonos-Controller-EQ`
- Branch: `agent/prelive-audio-control-stack`
- Base: `1ee1eb396c97ae2d26a17bcba199b4ca295db918` (`main`)
- Current and pushed head: `31124f09e9273d3d4fc91440ad493a54424c0204`
- Draft PR: [#5](https://github.com/Breeze2323/Sonos-Controller-EQ/pull/5), targeting `main`
- Exact-head CI: green. Both Node 20 and 22 on Ubuntu and Windows completed successfully (two workflow runs, eight checks total).
- Worktree was clean before this handoff checkpoint.

## Completed bounded checkpoints

- `3b21de3`: Sonos HTTP adapter contracts, source-coverage domain states, and basic REW filter parsing.
- `e87ddd9`: sandbox-only Equalizer APO adapter with recoverable configuration writes.
- `7705b9c`: scoped Sonos and DSP controller routes.
- `7861031`: client-side filter-response and clipping-risk calculation primitives.
- `8fccede`, corrected by `31124f0`: initial unified profile-schema migration and tests.

## Current implementation state

- Sonos adapter defaults to read-only behavior; settings application returns a structured block unless writes are explicitly enabled. No live request has been made.
- Equalizer APO support is restricted to an injected sandbox root. It has not detected, installed, configured, or written to a live APO installation.
- DSP routes use the mock adapter by default. Their stage/apply semantics still need to be separated before any real adapter is considered.
- Unified profile migration exists as a pure helper but is not yet connected to `useProfiles`, profile UI, persistence, scheduler behavior, REW import persistence, or the complete DSP editor.
- `src/lib/profileSchema.js` currently imports the source-coverage defaults from the server tree. Move the shared pure contract outside the server tree before treating the UI integration as complete.

## Local validation evidence

Earlier in this milestone, using the bundled Node 24 runtime: `npm ci --ignore-scripts`, `npm run lint`, focused `npm test` suites, `npm run build`, `npm run secret-scan`, `npm run check`, and PowerShell parser validation all passed. `npm audit` reported 12 inherited vulnerabilities in the pinned legacy `node-sonos-http-api` dependency; no upgrade was made.

The default shell Node is older and emits engine warnings. Use the bundled runtime path before npm commands:

```powershell
$nodeBin='C:\Users\Ty\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin'
$fallback='C:\Users\Ty\.cache\codex-runtimes\codex-primary-runtime\dependencies\bin\fallback'
$override='C:\Users\Ty\.cache\codex-runtimes\codex-primary-runtime\dependencies\bin\override'
$env:PATH="$nodeBin;$override;$fallback;$env:PATH"
```

## Incomplete work and next atomic unit

1. Extract the shared source-coverage contract from the server-only import path.
2. Integrate migration at the `useProfiles` persistence boundary, preserving malformed entries without data loss.
3. Add focused tests for persisted v1/v2/malformed collections, then run lint and the full suite.
4. Commit, push, update this file and `NEXT_GPT_TASK.md`, then confirm CI for the new exact head.

## Safety and approval gates

No Sonos writes, production-controller requests, port-3000 startup, Windows audio endpoint/DSP changes, Equalizer APO installation, or live playback changes were performed. The next non-code gate remains `EQUALIZER_APO_INSTALLATION_APPROVAL_REQUIRED`; live DSP and Sonos writes remain separately gated.
