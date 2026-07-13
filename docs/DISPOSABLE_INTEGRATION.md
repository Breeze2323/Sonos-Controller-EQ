# Disposable pre-live integration harness

## Purpose

Run bounded, synthetic, non-production end-to-end checks for Sonos/DSP control behavior before live approvals.

## Launcher

- `scripts/Test-DisposablePrelive.ps1`

The launcher creates a timestamped output directory, starts a synthetic Sonos API, starts a disposable controller instance with a temporary `sonos-data.json`, and writes a deterministic JSON summary.

## Current scope

The following scenarios are covered in this checkpoint:

1. clean startup
2. read-only `/sonos-proxy` discovery against synthetic `/zones`
3. legacy profile migration and malformed retention behavior
4. profile create/edit/clone scaffold
5. Sonos capability readback
6. native write policy block (`/api/sonos/settings/apply` remains preview-blocked)
7. DSP draft staging and validation
8. 15/31-band handling and parametric validation
9. 31-band validation
10. headroom assessment signal
11. stage/apply separation
12. sandbox apply and bypass
13. rollback request
14. crash/restart recovery through controller restart
15. REW parse/import dedupe path checks
16. history/audit/state association checks
17. hostile URL/body/path blocking checks
18. strict cleanup evidence and temp-root removal

## Failing behavior rules

- Fail closed on:
  - pre-existing root collision
  - reserved/system path usage
  - non-local endpoint in synthetic URLs
  - cleanup uncertainty

## Notes

- The synthetic endpoint is explicitly configured in temp `sonos-data.json` for deterministic
  `/sonos-proxy` execution.
- Scheduler and duplicate-schedule suppression scenarios remain blocked-by-design until scheduler routes are added.
- Cleanup is now handled inside the disposable evidence workflow and summarized in each JSON report.

## TODO (next bounded extension)

- Add explicit coverage scenarios for:
  - scheduler preview and duplicate suppression assertions
  - production-like production-port conflict and recovery behavior

## Artifacts

Script writes a JSON file named `artifacts/disposable-prelive-<timestamp>.json` under the launch directory with per-scenario pass/fail/skip status and counts.

Latest run: `artifacts/disposable-prelive-20260713-064246/artifacts/disposable-prelive-1783946571509.json`
Result: `pass=23`, `fail=0`, `skip=2` (`schedule preview`, `duplicate schedule suppression`).
