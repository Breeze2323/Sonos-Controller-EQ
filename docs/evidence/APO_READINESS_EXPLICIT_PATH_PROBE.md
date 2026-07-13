# Equalizer APO explicit readiness probe evidence

**Scripted command:** `node --input-type=module -e "import { EqualizerApoAdapter } from './server/services/dsp/EqualizerApoAdapter.js'; ..."`

## Probe targets

- `C:/Program Files/EqualizerAPO`
- `C:/Program Files (x86)/EqualizerAPO`

## Observed outcomes

- `C:/Program Files/EqualizerAPO` → `candidate_missing`
- `C:/Program Files (x86)/EqualizerAPO` → `candidate_missing`
- `relative/EqualizerAPO` → rejected with `readinessPath must be an absolute explicit path`

## Interpretation

- The adapter probe does not recurse directories and does not discover candidate paths automatically.
- The candidate must be explicitly passed, and missing candidates are reported as `candidate_missing`.
- Relative paths are not accepted by design.
- This lane does not configure or execute any Equalizer APO configurator or live endpoint.
