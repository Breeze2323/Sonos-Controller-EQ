# Current Handoff: Pre-live audio control stack

Updated: 2026-07-13T04:10:00-06:00

## Live-verified state

- Repository/worktree: `E:\Git\Sonos-Controller-EQ`
- Branch: `agent/prelive-audio-control-stack`
- Base: `1ee1eb396c97ae2d26a17bcba199b4ca295db918` (`main`)
- Last pushed handoff checkpoint: `ea18ca9`
- Latest implementation checkpoint: `4aa50809325c01044600ec188182f69e937388f9`
- Subsequent pushed checkpoints: `cebd218` (separate staging), `623c87a` (DSP panel), `2029318` (REW preview API), `f5714f3` (REW UI preview), and `feb11f7` (validated Sonos controls).
- Latest implementation checkpoints: `ccfd7cf` (parametric/presets/A-B/source UI), `fb3afae` (read-only capability view), `02edad0` (preview-only scheduler), `8681cdf` (REW audit persistence), and `f61a78b` (save DSP draft to unified profile).
- Latest safety checkpoints: `74b6d22` makes inherited quick-control, transport, grouping, session, and slider actions preview-only; `12af627` makes the legacy bulk profile-apply hook return a structured preview-only block with no network requests.
- Latest validation checkpoints: `372c591` adds Vitest/jsdom UI coverage and includes it in `npm run check`; `b470050` adds an explicit-path, read-only Equalizer APO readiness probe.
- Draft PR: [#5](https://github.com/Breeze2323/Sonos-Controller-EQ/pull/5), targeting `main`
- Exact-head CI: `fb3afae` is green on Ubuntu/Windows and Node 20/22. CI for `8681cdf` and `f61a78b` is pending GitHub completion.
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
- DSP routes use the mock adapter by default; stage and apply have separated semantics and staging does not apply configuration.
- Unified profile migration is applied at the `useProfiles` persistence boundary. Valid v1 entries are upgraded, invalid entries remain persisted and are exposed through `profileMigrationRejections`, and an early nested-only v2 shape is repaired with a temporary flat UI projection.
- Source-coverage defaults now live in `shared/domain/sourceCoverage.js`; server consumers retain their existing import path through a re-export.
- The DSP tab supplies 15/31-band graphic controls, response/headroom estimates, and sandbox/mock-only stage, apply, and bypass actions. It also previews REW text and imports filters only into the in-memory draft.
- The REW API route is preview-only and returns explicit `applied: false` and `liveAudioProcessed: false` evidence.
- Sonos native control validation covers loudness, Sub, surround, night/speech, and dialog sync inputs, but writes remain blocked by default and were not invoked.
- A source scan found no remaining targeted direct mutation proxy calls in `src`; read-only metadata, queue, artwork, and capability requests remain separately scoped.
- Scheduled profile matches now emit preview/audit results instead of invoking the legacy live profile-apply path.
- REW imports retain bounded deduplicated local audit entries with hashes and normalized filters; an explicit action can save the DSP draft, coverage state, and import hash into the active profile without applying it.

## Local validation evidence

Using the bundled Node 24 runtime, focused REW-audit tests passed; the most recent full `npm run check` passed: lint, 27 tests, production build, and secret scan. Earlier in the milestone, `npm ci --ignore-scripts` and PowerShell parser validation also passed. `npm audit` reported 12 inherited vulnerabilities in the pinned legacy `node-sonos-http-api` dependency; no upgrade was made.

The default shell Node is older and emits engine warnings. Use the bundled runtime path before npm commands:

```powershell
$nodeBin='C:\Users\Ty\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin'
$fallback='C:\Users\Ty\.cache\codex-runtimes\codex-primary-runtime\dependencies\bin\fallback'
$override='C:\Users\Ty\.cache\codex-runtimes\codex-primary-runtime\dependencies\bin\override'
$env:PATH="$nodeBin;$override;$fallback;$env:PATH"
```

## Incomplete work and next atomic unit

1. Commit and push this handoff update, then verify exact-head CI for the resulting branch head.
2. Add component-level or browser-level coverage for the DSP/REW/native capability surfaces, and extend negative/security coverage.
3. Review the remaining inherited direct Sonos-write UI paths and make their pre-live policy explicit without breaking future approval-gated architecture.
4. Perform a requirement-by-requirement hostile completion audit and update documentation with verified limitations and named gates.
5. Do not claim completion: a real live endpoint canary, live Sonos-write validation, and production deployment remain named approval gates.

## Safety and approval gates

No Sonos writes, production-controller requests, port-3000 startup, Windows audio endpoint/DSP changes, Equalizer APO installation, or live playback changes were performed. The next non-code gate remains `EQUALIZER_APO_INSTALLATION_APPROVAL_REQUIRED`; live DSP and Sonos writes remain separately gated.
