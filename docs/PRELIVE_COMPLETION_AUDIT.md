# Pre-live completion audit

Audit date: 2026-07-13

This audit distinguishes implemented software evidence from approval-gated live work. It does not claim live DSP processing, live Sonos writes, or production deployment.

| Objective area | Evidence | Status |
| --- | --- | --- |
| Sonos discovery and capability contract | `HttpSonosAdapter`, scoped `/api/sonos/*`, validated native setting schema, policy-disabled mutations | Implemented pre-live |
| Native controls | Capability view includes loudness, Sub, surround, night/speech, and dialog-sync controls; mutation UI is disabled | Implemented pre-live |
| DSP contract | scoped status/config/validate/stage/apply/bypass/rollback/history routes with mock adapter tests | Implemented sandbox/mock |
| Equalizer APO | sandbox-only generation, staging, atomic replacement, backup, rollback, symlink/root safeguards, explicit-path read-only readiness reporting, and tests | Implemented sandbox-only |
| DSP UI | 15/31 band EQ, parametric filters, response estimate, preamp/headroom, clipping status, A/B slots, presets, bypass, source coverage | Implemented local draft/sandbox |
| Unified profiles and schedule | versioned migration, DSP draft association, malformed-entry retention; schedule action emits a preview audit event | Implemented pre-live |
| REW | bounded parser, preview route, UI preview/import, bounded deduplicated local audit | Implemented pre-live |
| Regression/security validation | `npm run check`: 36 Node tests, 2 jsdom UI tests, lint, build, secret scan; source scan found no targeted direct write proxy invocation | Local evidence |
| Read-only readiness evidence | Beast2 readiness script + Sonos/API discovery + APO explicit-path probe evidence generated in this checkpoint | Repository-proven evidence |
| CI and PR | Draft PR #6; branch head `5db59598073b01426d8a2bc9d0d7512f1f2c30ae`; latest exact-head CI success at `29254828799` (push CI run `29254828799`) and `29254831995` (PR CI run `29254831995`) | Local checkpoint evidence |

## Remaining approval-gated work

- `EQUALIZER_APO_INSTALLATION_APPROVAL_REQUIRED`
- `WINDOWS_AUDIO_ENDPOINT_MUTATION_APPROVAL_REQUIRED`
- `LIVE_DSP_CANARY_APPROVAL_REQUIRED`
- `LIVE_SONOS_WRITE_APPROVAL_REQUIRED`
- `PRODUCTION_CONTROLLER_DEPLOYMENT_APPROVAL_REQUIRED`
- `PR_REVIEW_AND_MERGE_APPROVAL_REQUIRED`

## Unverified or incomplete evidence

- Fail-closed planning behavior is now unit-tested with `tests/unit/invokePrelivePlan.test.js`.
- Disposable harness evidence has completed all currently executable scenarios in this lane; remaining schedule-related scenarios are blocked-by-design due missing persistent schedule control endpoints in the synthetic API.
- The legacy controller's read-only metadata proxy paths remain available by design; they are not evidence of live integration capability.
- Equalizer APO readiness is sandbox-only. The adapter has not inspected a real installation or endpoint.
- A read-only live Sonos discovery request was performed against `127.0.0.1:5005` (`/zones` and `/<room>/state`) and used for capability evidence. No Sonos write path was attempted.

The deterministic next live action is not automatic: it requires a separately approved, bounded Equalizer APO/endpoint canary, followed independently by bounded Sonos write validation.
