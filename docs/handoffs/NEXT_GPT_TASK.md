# Next GPT Task: test and audit the completed pre-live control surfaces

Continue from `agent/prelive-audio-control-stack` after the profile/DSP/REW checkpoint `f61a78bd4e620364aaf991e42ce4f228b132f232` and this accompanying handoff-update commit (draft PR [#5](https://github.com/Breeze2323/Sonos-Controller-EQ/pull/5)). Do not switch branches, force-push, merge, mark the PR ready, or modify `main`.

## Objective

Complete one coherent, software-only checkpoint: add test coverage and conduct a hostile security/completeness audit of the DSP, REW, scheduler, and native-control surfaces. This is not authorization for live Sonos, DSP, Equalizer APO, audio-endpoint, or production-controller mutation.

## Start here

1. Inspect `server/controller.js`, `server/services/dsp/MockDspAdapter.js`, `server/services/dsp/EqualizerApoAdapter.js`, and their tests.
2. Make `POST /api/dsp/stage` persist only a validated staged configuration. `apply` must be the explicit state-changing adapter operation; tests must prove the distinction with the mock.
3. Validate sandbox adapter paths against the injected sandbox root before every filesystem operation, including traversal and symlink-escape cases where the platform permits them.
4. Do not detect a real APO install, execute its configurator, or touch its active config.

## Acceptance and validation

- Stage and apply have observable, tested, non-overlapping semantics.
- Sandbox path rejection fails closed; no code discovers or reaches live APO locations.
- Run focused tests, `npm run lint`, `npm test`, `npm run build`, and `npm run check` with the bundled Node 24 runtime documented in `CURRENT_HANDOFF.md`.
- Perform a hostile review of route and filesystem boundaries and report any unresolved concern honestly.

## Continuity protocol

After the atomic unit, update `CURRENT_HANDOFF.md` and this file with exact SHA/test/CI facts, commit the implementation plus handoff updates, push normally to `origin/agent/prelive-audio-control-stack`, and add a concise checkpoint comment to fork PR #5. Use explicit repository scoping (`--repo Breeze2323/Sonos-Controller-EQ`) because unscoped `gh` resolves the upstream repository. Verify GitHub Actions for the exact pushed head before claiming success.

If interrupted or constrained, finish the smallest safe atomic unit, test it, commit/push it, and leave these handoffs accurate before stopping.
