# Pre-live control stack decisions

## ADR-001: Sonos mutations are disabled by default

The HTTP Sonos adapter is capability-aware and may perform bounded read-only discovery, but write operations return a structured `LIVE_WRITES_DISABLED` block unless a future approved configuration explicitly enables them. This prevents accidental live volume, EQ, grouping, or playback changes during pre-live development.

## ADR-002: Equalizer APO work is sandbox-only

The Equalizer APO adapter accepts an injected sandbox root and is not allowed to discover or modify a real installation, its configurator, its active configuration, or a Windows audio endpoint. Any installation or real-path work requires `EQUALIZER_APO_INSTALLATION_APPROVAL_REQUIRED` first.

## ADR-003: Source coverage has explicit uncertainty states

Coverage is represented as `verified_processed`, `verified_bypassed`, `expected`, `unknown`, `unsupported`, `unavailable`, `mock_only`, or `sandbox_only`. UI and service consumers must not claim that a source is DSP-processed without path evidence.

## ADR-004: DSP estimates are labelled estimates

The browser response model is an electrical-filter estimate and clipping-risk heuristic, not microphone-calibrated room correction. It must remain labelled accordingly until verified measurement evidence is available.

## ADR-005: Preserve the pinned Sonos dependency during this milestone

`npm audit` reported 12 vulnerabilities in the inherited legacy `node-sonos-http-api` dependency. Changing it is out of scope for the current bounded milestone because it could alter the runtime controller integration. Record and review it separately rather than silently upgrading.

## ADR-006: Continuity artifacts are part of the work product

`CURRENT_HANDOFF.md`, `NEXT_GPT_TASK.md`, and this decision log are updated at coherent remote checkpoints. They contain exact branch/SHA/validation facts and are not substitutes for GitHub Actions evidence.
