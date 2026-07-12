# Phase 0 Feasibility Report

## Proven in repository

- Project architecture and source-coverage contracts exist.
- DSP adapter and validation scaffolding exist.
- Conservative headroom estimation exists.
- Read-only Windows readiness inventory exists.
- Unit tests and cross-platform CI scaffolding exist.
- The repository foundation was locally reconstructed and validated before publication: JavaScript syntax passed, 9 Node tests passed, and the structure gate passed.

## Live-verified GitHub state

- Canonical repository: `Breeze2323/Sonos-Controller-EQ`.
- Foundation commit on `main`: `968593b2ed604fbc727f6e353bb530f52e166828`.
- Initial Codex branch: `agent/project-foundation-audio-path-feasibility`.
- Project charter: issue #1.
- Initial import/build milestone: issue #2.

## Operator-reported production facts

- Beast2 runs the working controller at `127.0.0.1:3000`.
- The local Sonos HTTP API runs at `127.0.0.1:5005`.
- Target group: Arc Ultra + Sub + 2 × Era 300.
- Audio path: Beast2 HDMI → LG C2 → eARC → Arc Ultra.

These remain operator-reported until reverified by the active Codex worktree.

## Deferred repository work

- Import the complete `tonypest0/sonos-controller` application into the existing scaffold while preserving both histories and attribution.
- Reconcile README, license, package/tooling, installers, server, and React application without discarding foundation contracts.
- Add regression coverage for the known IPv4-loopback behavior in the imported application.
- Harden the imported proxy and persistence implementation.

## Deferred live evidence

- Equalizer APO installation/version and endpoint binding.
- Selected Windows HDMI endpoint and current format.
- Stereo and multichannel processing proof.
- Exclusive/bitstream bypass proof.
- Windows spatial-audio/Atmos behavior.
- Live Arc Ultra capability ranges beyond current readback.
- Production deployment and reboot validation.

## Next gate

Codex must import and validate the upstream application, run the read-only readiness script, and produce a deterministic canary packet. Live installation or audio mutation stops at `EQUALIZER_APO_INSTALLATION_APPROVAL_REQUIRED` or `LIVE_DSP_CANARY_APPROVAL_REQUIRED`.
