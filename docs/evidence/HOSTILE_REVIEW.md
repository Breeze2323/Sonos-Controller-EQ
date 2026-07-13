# Hostile review (non-mutating, pre-live lane)

Date: 2026-07-13

Scope: read-only evidence tooling, disposable harness, fail-closed plan script, proxy boundaries, and release packaging validation.

## Findings and checks

- Read-only probe paths were reviewed for escape and unintended mutation.
  - `Test-DspReadiness.ps1` avoids recursive filesystem scanning and collects only required fields.
  - APO explicit-readiness probes validate only explicitly supplied absolute paths.
  - `scripts/windows/Invoke-PrelivePlan.ps1` rejects path separators (`/`, `\\`) and escape tokens (`..`, `:`) in target identity.
- Proxy scope review passed:
  - Sonos proxy endpoint is constrained to loopback URLs in the disposable lane.
  - Hostile inputs (`not-a-url`, malformed JSON, path-like values) are rejected with 400-level results.
- Release packaging review:
  - Packaging validates manifest checksum and extracted required files.
  - Validation runs in a temporary extraction directory and re-runs `npm run build` + `node scripts/secret-scan.mjs` in sandbox.
- Timestamp/content mutation review:
  - Sandbox-only controller/dsp writes are confined to synthetic artifacts and temporary directories.
  - No production-facing `sonos-data.json`, ports 3000/5005 binding, endpoint data, or APO include files were written during this checkpoint.
- No blocked/high-severity hostile issues were introduced by this checkpoint.

## Required repairs completed

- Added unit coverage for approval planner boundary conditions:
  - wrong/missing tokens
  - cross-action token reuse
  - path escape targets
  - invalid hashes
  - stale prior state
  - missing backup hash
  - plan-only non-mutation behavior
- Updated handoff/audit docs with exact-head state and non-mutating completion status.

## Next remediation/verification

- Remaining executable scenarios continue to be approval-gated:
  - Equalizer APO install
  - endpoint mutation
  - live canary
  - Sonos write validation
  - production deployment/merge
