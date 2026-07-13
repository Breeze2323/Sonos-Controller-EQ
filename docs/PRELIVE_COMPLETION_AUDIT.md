# Pre-live completion audit

Audit date: 2026-07-13

This audit distinguishes implemented software evidence from approval-gated live work. It does not claim live DSP processing, live Sonos writes, or production deployment.

| Objective area | Evidence | Status |
| --- | --- | --- |
| Sonos discovery and capability contract | `HttpSonosAdapter`, scoped `/api/sonos/*`, validated native setting schema, policy-disabled mutations | Implemented pre-live |
| Native controls | Capability view includes loudness, Sub, surround, night/speech, and dialog-sync controls; mutation UI is disabled | Implemented pre-live |
| DSP contract | scoped status/config/validate/stage/apply/bypass/rollback/history routes with mock adapter tests | Implemented sandbox/mock |
| Equalizer APO | sandbox-only generation, staging, atomic replacement, backup, rollback, symlink/root safeguards, and tests | Implemented sandbox-only |
| DSP UI | 15/31 band EQ, parametric filters, response estimate, preamp/headroom, clipping status, A/B slots, presets, bypass, source coverage | Implemented local draft/sandbox |
| Unified profiles and schedule | versioned migration, DSP draft association, malformed-entry retention; schedule action emits a preview audit event | Implemented pre-live |
| REW | bounded parser, preview route, UI preview/import, bounded deduplicated local audit | Implemented pre-live |
| Regression/security validation | `npm run check`: 29 tests, lint, build, secret scan; source scan found no targeted direct write proxy invocation | Local evidence |
| CI and PR | Draft PR #6, exact-head CI green on Node 20/22 for Ubuntu/Windows at `8070fe6` | CI evidence |

## Remaining approval-gated work

- `EQUALIZER_APO_INSTALLATION_APPROVAL_REQUIRED`
- `WINDOWS_AUDIO_ENDPOINT_MUTATION_APPROVAL_REQUIRED`
- `LIVE_DSP_CANARY_APPROVAL_REQUIRED`
- `LIVE_SONOS_WRITE_APPROVAL_REQUIRED`
- `PRODUCTION_CONTROLLER_DEPLOYMENT_APPROVAL_REQUIRED`
- `PR_REVIEW_AND_MERGE_APPROVAL_REQUIRED`

## Unverified or incomplete evidence

- No browser/component or physical-device end-to-end test has been run. Current UI coverage is build-level; service/domain coverage is Node tests.
- The legacy controller's read-only metadata proxy paths remain available by design; they are not evidence of a live integration test.
- Equalizer APO readiness is sandbox-only. The adapter has not inspected a real installation or endpoint.
- A live Sonos discovery request has not been performed in this run. Capability behavior is verified with contracts and mocks only.

The deterministic next live action is not automatic: it requires a separately approved, bounded Equalizer APO/endpoint canary, followed independently by bounded Sonos write validation.
