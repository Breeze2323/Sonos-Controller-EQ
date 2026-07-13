# Next GPT Task: profile migration boundary

Continue from `agent/prelive-audio-control-stack` at `31124f09e9273d3d4fc91440ad493a54424c0204` (draft PR [#5](https://github.com/Breeze2323/Sonos-Controller-EQ/pull/5)). Do not switch branches, force-push, merge, mark the PR ready, or modify `main`.

## Objective

Complete one coherent, software-only checkpoint: make unified-profile migration safe at the persisted profile collection boundary. This is not authorization for live Sonos, DSP, Equalizer APO, audio-endpoint, or production-controller mutation.

## Start here

1. Inspect `src/hooks/useProfiles.js`, `src/lib/profileSchema.js`, its tests, and callers.
2. Move `DEFAULT_SOURCE_COVERAGE` to a shared pure module that both browser and server code can import without a browser-to-server dependency.
3. Apply `migrateProfiles` when persisted data is loaded. Preserve malformed entries and avoid silent destructive rewrites.
4. Add unit tests for legacy v1, current v2, mixed/malformed arrays, and idempotent reload behavior.

## Acceptance and validation

- Existing profile behavior remains compatible for valid current profiles.
- Invalid persisted entries remain observable and are not automatically discarded.
- The browser bundle contains no import from `server/`.
- Run focused tests, `npm run lint`, `npm test`, `npm run build`, and `npm run check` with the bundled Node 24 runtime documented in `CURRENT_HANDOFF.md`.
- Perform a hostile review of parsing/persistence boundaries and report any unresolved concern honestly.

## Continuity protocol

After the atomic unit, update `CURRENT_HANDOFF.md` and this file with exact SHA/test/CI facts, commit the implementation plus handoff updates, push normally to `origin/agent/prelive-audio-control-stack`, and add a concise checkpoint comment to fork PR #5. Use explicit repository scoping (`--repo Breeze2323/Sonos-Controller-EQ`) because unscoped `gh` resolves the upstream repository. Verify GitHub Actions for the exact pushed head before claiming success.

If interrupted or constrained, finish the smallest safe atomic unit, test it, commit/push it, and leave these handoffs accurate before stopping.
