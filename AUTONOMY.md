# Autonomy Boundaries

## Authorized without additional approval

- Repository and GitHub inspection.
- Preservation inventory and non-destructive snapshots.
- Implementation inside the active issue/branch scope.
- Unit, integration, fixture, lint, build, and documentation work.
- Local mock servers and synthetic fixtures.
- Read-only checks of explicitly approved loopback endpoints.
- Focused commits, branch push, draft PR creation/update, and CI repair.

## Not authorized without exact later approval

- Modification or restart of the production controller or Sonos API.
- Installation, removal, or configuration of Equalizer APO, CamillaDSP, drivers, or virtual audio devices.
- Changes to the Windows default endpoint, channel layout, sample rate, bit depth, exclusive/shared mode, or spatial-audio configuration.
- Live DSP filter writes or endpoint binding.
- Sonos volume, playback, grouping, topology, calibration, room, Sub, surround, dialog, height, or other settings.
- Credential access, external uploads, commercial publication, merge, branch deletion, or production deployment.

## Named gates

- `UPSTREAM_REFERENCE_DRIFT_REVIEW_REQUIRED`
- `LOCAL_WORKTREE_PRESERVATION_REQUIRED`
- `EQUALIZER_APO_INSTALLATION_APPROVAL_REQUIRED`
- `WINDOWS_AUDIO_ENDPOINT_MUTATION_APPROVAL_REQUIRED`
- `LIVE_DSP_CANARY_APPROVAL_REQUIRED`
- `LIVE_SONOS_WRITE_APPROVAL_REQUIRED`
- `PRODUCTION_CONTROLLER_DEPLOYMENT_APPROVAL_REQUIRED`
- `PR_REVIEW_AND_MERGE_APPROVAL_REQUIRED`
