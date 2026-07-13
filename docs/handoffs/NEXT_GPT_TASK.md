# Next GPT Task: operator-readiness completion checkpoint

Continue on `agent/prelive-audio-control-stack` (do not switch branches, force-push, merge, or modify `main`).

## Objective

Complete the next bounded, non-mutating checkpoint for issue `#4` by finishing hostile-review and verification work around disposable integration, read-only readiness, and runbook readiness.

## Priority tasks

1. Finalize hostile-review pass for adapter boundaries and live gates:
   - path traversal, schedule persistence mocks, proxy scope, and timestamp/content mutation checks.
2. Make the disposable pre-live harness executable and deterministic:
   - implement remaining scenario set documented in `docs/DISPOSABLE_INTEGRATION.md`
   - persist machine-consumable evidence artifacts
3. Add or tighten tests around approval/plan scripts in `scripts/windows/Invoke-PrelivePlan.ps1` semantics.
4. If possible, tighten release packaging validation script:
   - checksum manifest
   - deterministic extract + dry-run smoke verification
5. Update `docs/PRELIVE_COMPLETION_AUDIT.md` and handoff files if additional evidence changes occur.

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
