# Agent Instructions

## Authority order

1. Current user instruction.
2. Repository issue defining the active milestone.
3. `AUTONOMY.md`.
4. This file.
5. Architecture, roadmap, and safety documents.
6. Existing implementation and tests.

## Required execution sequence

VERIFY → PRESERVE → UNDERSTAND → IMPLEMENT → TEST → HOSTILE REVIEW → DOCUMENT → COMMIT → PUSH → EXACT-HEAD CI → HANDOFF → STOP AT NAMED GATES.

## Preservation rules

- Existing work is the primary work product.
- Inventory staged, unstaged, and untracked work before fetch, switch, pull, or edit.
- Never use destructive reset, clean, restore, force push, or silent conflict resolution.
- Do not rewrite valid work merely to match a preferred style.

## Fact classes

Every handoff must distinguish live-verified facts, operator-reported facts, assumptions, and blocked or unavailable facts. Never invent paths, SHAs, test results, devices, endpoints, PRs, or production state.

## Production boundary

Development must not modify the known-good port-3000 controller, port-5005 API, Windows audio endpoint, DSP configuration, or Sonos playback/settings without exact later approval.

## Engineering requirements

- Fail closed on malformed input, stale state, timeout, partial completion, unavailable dependencies, and failed verification.
- Do not automatically retry a consequential write after an uncertain response.
- Keep network targets and filesystem paths allowlisted.
- Use atomic writes and recoverable backups for configuration changes.
- Do not claim a source is DSP-processed without signal-path evidence.
- Mocks are not live integration tests.

## Git standard

- One bounded milestone per branch and draft PR.
- No direct project changes to `main` unless the user explicitly authorizes repository initialization.
- Keep focused commits and exact-head CI evidence.
- Do not mark ready, merge, or delete the branch without approval.

## Final handoff

Report repository/worktree, starting/final SHAs, branch/commits, files changed, tests, skips, security review, PR/CI state, parity, worktree status, actions not performed, exact gates, and next bounded milestone.
