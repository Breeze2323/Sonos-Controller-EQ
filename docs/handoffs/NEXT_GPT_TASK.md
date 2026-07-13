# Next GPT Task: operator-readiness completion checkpoint

Continue on `agent/prelive-audio-control-stack` (do not switch branches, force-push, merge, or modify `main`).

## Objective

Complete `agent/prelive-audio-control-stack` operator-readiness closure for the bounded non-live lane, then pause at explicit live gates after pushing verification evidence.

## Priority tasks

1. Verify exact-head CI remains green after this checkpoint.
2. Keep PR #6 draft and issue #4 open while preparing final operator packet set:
   - `EQUALIZER_APO_INSTALLATION_APPROVAL_REQUIRED`
   - `WINDOWS_AUDIO_ENDPOINT_MUTATION_APPROVAL_REQUIRED`
   - `LIVE_DSP_CANARY_APPROVAL_REQUIRED`
   - `LIVE_SONOS_WRITE_APPROVAL_REQUIRED`
   - `PRODUCTION_CONTROLLER_DEPLOYMENT_APPROVAL_REQUIRED`
   - `PR_REVIEW_AND_MERGE_APPROVAL_REQUIRED`
3. Perform no live writes and no production deployment until explicit gate authorization.
4. Continue handoff/pilot documentation with exact-head branch and validation facts.

## Constraint reminders

- No live mutation actions.
- PR #6 remains draft and must stay draft unless explicitly authorized.
- Never deploy or run production writes from this lane.

## Continuation protocol

After each atomic unit:
- update `docs/handoffs/CURRENT_HANDOFF.md`
- update `docs/PRELIVE_COMPLETION_AUDIT.md`
- commit and push to `origin/agent/prelive-audio-control-stack`
- run `gh run view <run-id>` on the branch head.
