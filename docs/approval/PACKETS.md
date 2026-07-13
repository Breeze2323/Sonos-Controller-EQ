# Operator approval packets (non-mutating)

All live operations remain blocked in this milestone. The packets below are
evidence-ready templates with required guardrails and explicit stop conditions.

## A — Equalizer APO installation

- Gate: `EQUALIZER_APO_INSTALLATION_APPROVAL_REQUIRED`
- Scope: read-only evidence lane only; no install or configurator execution in this branch.
- Required approval state:
  - exact token
  - operator target identity
  - current-state hash proof
  - backup hash proof
- Required evidence before execution:
  - installer source/version/hash (not yet collected)
  - target machine confirmation and service stop plan
  - backup/restore points
- Current status: `unapproved / not executed`.
- Stop conditions: no write path, no endpoint restart, no configurator execution.

## B — Endpoint binding/configuration

- Gate: `WINDOWS_AUDIO_ENDPOINT_MUTATION_APPROVAL_REQUIRED`
- Scope: endpoint mutation is not configured in this milestone.
- Required evidence before execution:
  - explicit endpoint GUID and format tuple
- Current status: no endpoint writes executed in this milestone; default endpoint discovery only.
- Stop conditions: no endpoint write and no discovery side-effects beyond read-only inventory.

## C — Live DSP canary

- Gate: `LIVE_DSP_CANARY_APPROVAL_REQUIRED`
- Required evidence before execution:
  - current configuration/state hash
  - deterministic backup path/hash
  - conservative filter spec (bounded preamp and gain)
  - exact endpoint and sample-path details
  - rollback window and timeout criteria
- Current status: evidence-only. `scripts/windows/Invoke-PrelivePlan.ps1` verifies plan-only + token and guardrails.

## D — Sonos write validation

- Gate: `LIVE_SONOS_WRITE_APPROVAL_REQUIRED`
- Current status: adapter returns `blocked` with preview payload by default.
- Required evidence before execution:
  - target room/hash and current value readback
  - bounded request count and rollback hash
  - explicit duration + restoration value
- Fail condition: no retries after uncertain result; dry-run required first.

## E — Production deployment

- Gate: `PRODUCTION_CONTROLLER_DEPLOYMENT_APPROVAL_REQUIRED`
- Current status: PR #6 remains draft.
- Required evidence before execution:
  - parity checks
  - release manifest + checksums
  - smoke/rollback evidence
  - post-deploy health probe
