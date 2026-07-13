# Audio Paths and Coverage

The project must never label a source as processed without evidence.

| Source path | Sonos-native controls | Beast2 DSP | Initial status |
|---|---:|---:|---|
| Beast2 shared stereo PCM | Yes | expected | expected |
| Beast2 multichannel PCM | Yes | expected | expected |
| Browser audio | Yes | expected | expected |
| Games | Yes | expected | expected |
| Shared-mode media | Yes | expected | expected |
| Exclusive/bitstream playback | Yes | unknown | unknown |
| Windows spatial audio | Yes | unknown | unknown |
| LG C2 internal applications | Yes | unsupported | unsupported |
| Consoles | Yes | unsupported | unsupported |
| Direct Sonos streams | Yes | unsupported | unsupported |
| Roon-to-Sonos | Yes | unknown | unknown |

Allowed status values:

- `verified_processed`
- `verified_bypassed`
- `expected`
- `unknown`
- `unsupported`

Evidence must record application, endpoint, format, sample rate, channel count, spatial mode, DSP engine state, test filter, observed result, and rollback result.
