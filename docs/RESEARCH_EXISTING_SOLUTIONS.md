# Existing-Solution Research

## Decision

No public, production-ready project was identified that combines maximum Sonos-native home-theater control with true multiband/parametric DSP for compatible Windows-originated audio, unified profiles, explicit source coverage, headroom protection, rollback, and REW import.

## Relevant partial solutions

### tonypest0/sonos-controller

Provides the upstream React/Vite/Node controller framework, profiles, scheduling, live controls, persistence, and a local Sonos HTTP proxy. It is the primary UX and application foundation.

### darthneel/sonos-adaptive-equalizer

Automates Sonos-native Bass, Treble, Loudness, Sub gain, and surround settings based on metadata. It does not provide frequency-band signal processing.

### Roon MUSE

Provides mature parametric EQ, convolution, procedural EQ, and headroom management for music delivered through Roon. It does not process TV/eARC, console, or direct Sonos sources.

### Equalizer APO

Provides mature Windows audio-effects processing, graphic/parametric filters, low latency, and REW-compatible filters. It is the first source-DSP backend candidate.

### CamillaDSP

Provides IIR/FIR filters, convolution, mixers, per-channel routing, and websocket control. It is more flexible but requires a proven Windows capture/playback routing architecture.

### jishi/node-sonos-http-api and SoCo

Expose local Sonos controls and capability evidence. They do not supply a true multiband signal-processing path inside bonded Sonos home-theater hardware.

## Build policy

Integrate mature DSP engines. Do not implement a custom real-time DSP engine.
