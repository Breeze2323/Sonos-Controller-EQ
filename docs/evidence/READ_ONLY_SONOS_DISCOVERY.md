# Read-only Sonos discovery evidence

**Executed against:** `http://127.0.0.1:5005`
**Date:** `2026-07-13T06:43:07-06:00`
**Mode:** read-only HTTP GET checks only

## Fact classes

- Locally observed (read-only): Sonos API topology and state fields
- Repository-proven: Sonos adapter contracts in `server/services/sonos/HttpSonosAdapter.js`
- Operator-reported: not introduced in this report
- Unverified/live: no confirmed end-to-end write path
- Unavailable: none for read-only checks in this run

## Endpoint findings

- `/zones` is reachable and returned a single-zone state payload for `Living Room`.
- `/<room>/state` is reachable for the discovered room name (`Living Room`) and returned read-only state data.
- Example values observed:
  - `playbackState`: `STOPPED`
  - `volume`: `64`
  - `mute`: `False`
  - `equalizer.loudness`: `True`
  - `equalizer.nightMode`: `False`
  - `equalizer.speechEnhancement`: `False`
  - `sub.enabled`: `True`
  - `sub.gain`: `5`
- State shape includes `groupState` and `currentTrack`/`nextTrack` objects.

## Topology snapshot

- Zone count: `1`
- Grouped topology: single-member zone (`False`)
- Room hash (redacted): `TGl2aW5nIFJv`
- Coordinator/zone UUID read for consistency was redacted from this report and preserved only in local evidence tooling.

## Capability verification

- The raw discovery state exposes read-only capabilities expected by the Sonos adapter contract (`equalizer.loudness`, `equalizer.nightMode`, `equalizer.speechEnhancement`, `sub.enabled`, `sub.gain`) and group/presence metadata.
- No direct Sonos write action endpoints were called in this lane.

## Safety conclusion

- Read-only discovery is functional for the local `127.0.0.1:5005` API.
- Write-capable API calls (apply/profile sync) remain blocked by adapter policy in this lane.
