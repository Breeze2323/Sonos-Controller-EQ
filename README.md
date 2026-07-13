# Sonos Controller EQ

This is a safety-bounded adaptation of [tonypest0/sonos-controller](https://github.com/tonypest0/sonos-controller), preserving its React/Vite controller, profiles, live controls, grouping, scheduler, activity log, queue, installers, and `server.js` entry point.

Project changes add the foundation for capability-aware Sonos control and source-side DSP. Port 3000 remains a control plane; it is not a real-time DSP engine. Equalizer APO is the first candidate backend, while CamillaDSP remains deferred.

## Development

```text
npm ci
npm run lint
npm test
npm run build
npm run check
```

Use the Vite default port (5173) for development. Do not run a development server on the known-good production controller port.

## Safety and project authority

- Charter: GitHub issue #1; bounded milestone: issue #2.
- Local rules: `AGENTS.md`, `AUTONOMY.md`, and `docs/`.
- Production controller, Sonos API, Windows endpoint, DSP configuration, and Sonos playback/settings are out of scope unless a later task grants exact approval.

## Current milestone state

Active branch: `agent/prelive-audio-control-stack` with draft PR #6.

- Sonos-native control writes are policy-blocked and return preview payloads.
- DSP writes are scoped and validated through preview/stage/apply/bypass/rollback contracts.
- Equalizer APO behavior is explicit-path read-only probe only (`candidate_present`, `candidate_missing`), with no implicit discovery.
- Read-only Sonos and APO readiness evidence is captured in:
  - `docs/evidence/READ_ONLY_BEAST2_READINESS.md`
  - `docs/evidence/READ_ONLY_SONOS_DISCOVERY.md`
  - `docs/evidence/APO_READINESS_EXPLICIT_PATH_PROBE.md`
  - `docs/DISPOSABLE_INTEGRATION.md`

## Upstream and attribution

```text
origin   -> Breeze2323/Sonos-Controller-EQ
upstream -> tonypest0/sonos-controller
```

The selected upstream foundation is `fb3f7cca1bc920dace501cd7ff564e526aa8eec5`, licensed CC BY-NC 4.0. This repository contains changes and retains upstream attribution and license text. See `docs/UPSTREAM_INTEGRATION.md` for safe synchronization and contribution-back procedures.

## Current milestone

The project is establishing deterministic validation, an IPv4 loopback default, bounded persistence and proxy behavior, a read-only Windows readiness inventory, and a Phase 0 audio-path feasibility packet. It does not claim live DSP processing from mocks or documentation.
