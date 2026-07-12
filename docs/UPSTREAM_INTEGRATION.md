# Upstream Integration

## Remote model

```text
origin   -> Breeze2323/Sonos-Controller-EQ
upstream -> tonypest0/sonos-controller
```

This repository is independent rather than a GitHub-native fork. It can still share Git ancestry after the upstream framework is imported.

## Import policy

- Verify the exact upstream commit and license.
- Preserve commit history when practical.
- Retain CC BY-NC 4.0 attribution and notices.
- Record project-specific changes in the changelog.
- Do not overwrite existing repository work.

## Sync procedure

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
