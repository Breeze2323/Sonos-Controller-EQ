# Security Policy

## Local-only default

The controller and future DSP APIs must bind to loopback by default. LAN exposure requires explicit design, authentication/origin controls, and review.

## Prohibited interfaces

- Arbitrary URL proxying.
- Arbitrary command execution.
- Client-selected filesystem paths.
- Unbounded request or response bodies.
- Credential-bearing URLs.

## Configuration writes

All consequential configuration writes must validate input, create a recoverable backup, write a temporary sibling, atomically replace the target, verify engine load, and roll back after failed verification.

## Reporting

Do not include credentials, private paths, device identifiers, or retained live machine output in issues, commits, tests, or pull requests unless explicitly sanitized.
