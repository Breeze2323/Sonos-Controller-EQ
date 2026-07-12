# Upstream Integration

## Remote model

```text
origin   -> Breeze2323/Sonos-Controller-EQ
upstream -> tonypest0/sonos-controller
```

This repository is independent rather than a GitHub-native fork. It can still preserve both histories by merging the upstream framework into a focused integration branch with `--allow-unrelated-histories`, resolving conflicts explicitly, and retaining attribution.

## Current integration state

- `main` contains the project-specific architecture, safety, test, CI, and DSP foundation.
- The complete upstream React/Vite/Node application has not yet been imported.
- The initial Codex branch is `agent/project-foundation-audio-path-feasibility`.

## Import policy

- Verify the exact upstream commit and license.
- Preserve both existing repository work and upstream history.
- Retain CC BY-NC 4.0 attribution and notices.
- Record project-specific changes in the changelog.
- Never reset this repository to upstream or overwrite the foundation.

## Initial import procedure

1. Add `upstream` and fetch `upstream/main`.
2. Inspect commits newer than the recorded planning reference.
3. Work only on `agent/project-foundation-audio-path-feasibility`.
4. Merge the selected upstream commit with `--allow-unrelated-histories`.
5. Resolve README, license, package/tooling, installer, server, and source conflicts by preserving both valid systems.
6. Keep `server.js` as the compatibility entry point.
7. Run the complete local gate.
8. Publish the integration through a draft PR to `main`.

## Ongoing sync procedure

1. Fetch `upstream`.
2. Inspect new commits and diff.
3. Create a focused `sync/upstream-YYYYMMDD` branch.
4. Reconcile conflicts without discarding project changes.
5. Run the complete local gate.
6. Open a reviewed PR into this repository.

## Contribution back

Generalized fixes can be proposed to Tony's repository:

1. Create a topic branch based directly on current `upstream/main`.
2. Cherry-pick or reimplement only broadly applicable commits.
3. Remove Beast2-specific assumptions and project-only dependencies.
4. Run upstream-compatible tests and build.
5. Open a focused pull request to `tonypest0/sonos-controller`.

Project-specific DSP architecture should remain in this repository unless upstream explicitly wants it.
