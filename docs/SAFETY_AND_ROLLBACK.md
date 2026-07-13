# Safety and Rollback

## Acoustic safety

- Begin live tests at low volume.
- Apply positive EQ only with adequate negative preamp/headroom.
- Default boost range is bounded; expert ranges require explicit acknowledgement.
- Prefer correcting peaks over attempting to fill deep room nulls.

## Configuration safety

A DSP apply must:

1. Validate schema and ranges.
2. Reject NaN, infinity, invalid Q, unsupported type, excessive band count, and unknown channels.
3. Generate a candidate in a controller-owned path.
4. Verify generated syntax.
5. Back up the active known-good file.
6. Atomically replace the active include.
7. Verify the DSP engine loaded it.
8. Restore the backup after failure.
9. Record hashes and result.

## Uncertain outcomes

Do not retry a write after timeout or an ambiguous response. Preserve evidence and require operator review.

## Failsafe state

Maintain a one-action flat/bypass configuration and a separate known-good backup. Rollback must not depend on the browser remaining open.
