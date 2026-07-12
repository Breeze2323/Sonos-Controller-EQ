# Phase 0 Feasibility Report

## Proven in repository

- Project architecture and source-coverage contracts exist.
- DSP adapter and validation scaffolding exist.
- Conservative headroom estimation exists.
- Read-only Windows readiness inventory exists.
- Unit tests and CI scaffolding exist.

## Operator-reported production facts

- Beast2 runs the working controller at `127.0.0.1:3000`.
- The local Sonos HTTP API runs at `127.0.0.1:5005`.
- Target group: Arc Ultra + Sub + 2 × Era 300.
- Audio path: Beast2 HDMI → LG C2 → eARC → Arc Ultra.

These remain operator-reported until reverified by the active Codex worktree.

## Deferred live evidence

- Equalizer APO installation/version and endpoint binding.
- Selected Windows HDMI endpoint and current format.
- Stereo and multichannel processing proof.
- Exclusive/bitstream bypass proof.
- Windows spatial-audio/Atmos behavior.
- Live Arc Ultra capability ranges beyond current readback.
- Production deployment and reboot validation.

## Next gate

Codex must first import and validate the upstream application, run the read-only readiness script, and produce a deterministic canary packet. Live installation or audio mutation stops at `EQUALIZER_APO_INSTALLATION_APPROVAL_REQUIRED` or `LIVE_DSP_CANARY_APPROVAL_REQUIRED`.
