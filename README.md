# Sonos Controller EQ

A local, safety-bounded control plane for Sonos home-theater settings and granular source-side DSP.

## Status

This repository is the independent development home for the Sonos Controller EQ project. It is designed to build on the architecture and user experience of [`tonypest0/sonos-controller`](https://github.com/tonypest0/sonos-controller) while keeping DSP development isolated until it is proven safe and useful.

The first target system is:

- Windows 11 host (`Beast2`)
- Sonos Arc Ultra
- Sonos Sub
- 2 × Era 300 surrounds
- HDMI from Beast2 to LG C2, then eARC to Arc Ultra

## Project objective

Provide one local interface for:

- capability-aware Sonos-native home-theater controls;
- 15-band and 31-band graphic EQ for verified Beast2 audio paths;
- parametric EQ filters with frequency, gain, Q, type, channel assignment, and bypass;
- automatic headroom management and clipping-risk indication;
- unified Sonos and DSP profiles;
- REW filter import and response visualization;
- atomic configuration apply, backup, verification, and rollback;
- explicit indication of which source path is actually processed.

## Architecture principle

Port 3000 is the control plane. Real-time signal processing remains in a mature DSP engine.

Initial DSP backend:

- Equalizer APO

Optional later backend:

- CamillaDSP

## Repository authority

- Project charter: issue #1
- Initial build milestone: issue #2
- Agent rules: `AGENTS.md`
- Autonomy boundaries: `AUTONOMY.md`
- Architecture: `docs/ARCHITECTURE.md`
- Roadmap: `docs/ROADMAP.md`

## Upstream relationship

This repository is not a GitHub-native fork. The intended Git remote layout is:

```text
origin   -> Breeze2323/Sonos-Controller-EQ
upstream -> tonypest0/sonos-controller
```

Generalized improvements can later be isolated on branches based on `upstream/main` and proposed back through focused pull requests.

## Production boundary

The known-good production controller and Sonos API must not be modified by development work unless a later task includes explicit approval for that exact deployment or live test.

## Current phase

Phase 0/1 foundation:

- repository structure;
- architecture and safety contracts;
- test and CI scaffolding;
- DSP adapter interfaces;
- read-only Windows readiness inventory;
- feasibility evidence for the first controlled DSP canary.

## Development commands

The repository foundation uses Node's built-in test runner until the upstream React/Vite application is imported and its toolchain is consolidated.

```text
npm install
npm test
npm run lint
npm run build
npm run check
```

## License and attribution

Project-specific files are provided under the license in `LICENSE`.

When upstream source from `tonypest0/sonos-controller` is imported or adapted, preserve its CC BY-NC 4.0 attribution, license, and change notices. See `docs/UPSTREAM_INTEGRATION.md`.
