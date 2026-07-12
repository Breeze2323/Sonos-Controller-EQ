# Audio Paths and Coverage

The project must never label a source as processed without evidence.

| Source path | Sonos-native controls | Beast2 DSP | Initial status |
|---|---:|---:|---|
| Beast2 shared stereo PCM | Yes | Expected | Unverified |
| Beast2 shared multichannel PCM | Yes | Expected | Unverified |
| Browser audio on Beast2 | Yes | Expected | Unverified |
| Games on Beast2 | Yes | Expected | Unverified |
| Shared-mode media player | Yes | Expected | Unverified |
| WASAPI exclusive / bitstream | Yes | Often bypassed | Unverified |
| Windows spatial audio / Atmos | Yes | Must be measured | Unverified |
| LG C2 internal applications | Yes | No | Architectural boundary |
| Console connected to TV | Yes | No | Architectural boundary |
| Direct Sonos service stream | Yes | No | Architectural boundary |
| Roon-to-Sonos | Yes | Roon DSP only | Separate path |

Allowed status values:

- `verified_processed`
- `verified_bypassed`
- `expected`
- `unknown`
- `unsupported`

Evidence must record application, endpoint, format, sample rate, channel count, spatial mode, DSP engine state, test filter, observed result, and rollback result.
