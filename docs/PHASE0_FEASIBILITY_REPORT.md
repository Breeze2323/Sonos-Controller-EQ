# Phase 0 Feasibility Report

## Proven in repository

- Project architecture and source-coverage contracts exist.
- DSP adapter and validation scaffolding exist.
- Conservative headroom estimation exists.
- Read-only Windows readiness inventory exists.
- Unit tests and cross-platform CI scaffolding exist.
- Verified upstream seed: `main`, `origin/main`, and `upstream/main` are `fb3f7cca1bc920dace501cd7ff564e526aa8eec5`.
- The imported React/Vite controller builds with the pinned `node-sonos-http-api` source archive.
- The bounded controller proxy reaches a configured `127.0.0.1` mock API and rejects a different target.
- Store POST rejects malformed JSON and preserves existing keys through an atomic sibling-file write and backup.
- Deterministic lint, unit/integration tests, build, and secret scan exist; mocks are not live audio or Sonos validation.

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

## First live canary packet (do not execute)

Required approval token: `LIVE_DSP_CANARY_APPROVAL_REQUIRED`.

- Select and record one Windows playback endpoint identifier and Equalizer APO version.
- Back up the exact controller-owned include file before any write.
- Start at a conservative low volume; use shared stereo PCM and a short known test source.
- Apply one reversible conservative filter (for example, `Preamp: -6 dB` with a narrow `+1 dB` peak), then capture endpoint, engine-load, audible/measured result, timestamp, and hashes.
- Timeout or uncertain result: do not retry; restore the known-good backup manually or through the verified rollback path.
- Stop immediately on wrong endpoint, unexpected playback behavior, clipping, lost audio, unsupported path, or failed rollback; remove the canary include after evidence capture.

## Next gate

Codex must import and validate the upstream application, run the read-only readiness script, and produce a deterministic canary packet. Live installation or audio mutation stops at `EQUALIZER_APO_INSTALLATION_APPROVAL_REQUIRED` or `LIVE_DSP_CANARY_APPROVAL_REQUIRED`.
