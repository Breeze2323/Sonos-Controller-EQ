# Roadmap

## Phase 0 — feasibility and audio-path proof

- Import upstream framework and preserve attribution.
- Establish baseline tests and CI.
- Inventory Windows endpoints and DSP availability read-only.
- Design a reversible Equalizer APO canary.
- Test required formats only after explicit live approval.
- Probe Sonos capabilities read-only.
- Publish go/no-go evidence.

## Phase 1 — repository foundation

- Consolidate upstream React/Vite/Node code.
- Add lint, tests, CI, schema migrations, atomic persistence, and bounded routes.
- Preserve port-3000 behavior and IPv4-loopback compatibility.

## Phase 2 — maximum Sonos-native controls

- Loudness, Sub, surround, music mode, dialog, delay, and capability-probed Arc Ultra controls.
- Numeric inputs, live readback, safe ranges, and profile migration.

## Phase 3 — DSP adapter contract

- Typed models, mock adapter, validation, headroom, history, rollback, and `/api/dsp/*`.

## Phase 4 — Equalizer APO backend

- Installation detection, endpoint selection, dedicated include, generation, validation, bypass, rollback, and health verification.

## Phase 5 — multiband and parametric UI

- 15/31-band graphic EQ, parametric filters, response graph, A/B, presets, and accessibility.

## Phase 6 — unified profiles and automation

- Versioned Sonos + DSP profiles, scope labels, schedules, startup profile, failsafe-flat profile, and partial-apply reporting.

## Phase 7 — REW integration

- Parse, validate, visualize, persist, and audit REW filters and target curves.

## Phase 8 — optional CamillaDSP

Proceed only when Equalizer APO cannot satisfy a demonstrated requirement.

## Phase 9 — production release

- Stable installation path, reversible installer, health checks, backup/restore, reboot proof, release notes, and suitable upstream contributions.
