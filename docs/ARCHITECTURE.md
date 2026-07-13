# Architecture

## System goal

Build a local control plane that combines capability-aware Sonos controls with granular DSP for verified Beast2 audio paths.

## Logical architecture

```text
Browser / Controller
  ├─ Profiles
  ├─ Sonos Native
  ├─ DSP Equalizer
  ├─ Measurements / REW
  ├─ Scheduler
  └─ Activity / Status
          │
          ▼
Node service
  ├─ /api/sonos/*
  ├─ /api/dsp/*
  ├─ /api/system/*
  └─ versioned persistence
          │
          ├─ Sonos adapter
          ├─ Equalizer APO adapter
          ├─ optional CamillaDSP adapter
          └─ mock adapter for tests
```

## Core principles

### Control plane, not DSP engine

The application edits, validates, applies, and visualizes configurations. Signal processing remains in an established engine.

### Adapter contract

```text
probe
getStatus
getConfiguration
validateConfiguration
applyConfiguration
bypass
rollback
```

Adapters must return structured results and may not silently treat partial completion as success.

### Source coverage

Each setting and profile must declare whether it affects all Sonos sources, compatible Beast2 audio, a specific application/service path, or an unknown/bypassed path.

### Capability-aware Sonos control

Discover topology and probe read-only capabilities before exposing writes. Unsupported or unverified controls remain hidden or disabled.

### Safe apply

Validate → calculate headroom → generate candidate → verify syntax → backup known-good state → atomic replace → verify engine load → rollback on failure → audit result.

## First DSP backend

Equalizer APO receives a controller-owned include file. The controller never rewrites the user's entire APO configuration.

```text
Equalizer APO config.txt
  Include: SonosControllerEQ/active.txt
```

## Future backend

CamillaDSP may be added behind the same adapter contract when FIR, convolution, limiter, or routing requirements are proven.
