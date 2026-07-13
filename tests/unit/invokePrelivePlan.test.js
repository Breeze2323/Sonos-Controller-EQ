import assert from 'node:assert/strict'
import test from 'node:test'

import { evaluatePrelivePlan, parsePrelivePlanArgs } from '../../scripts/windows/invokePrelivePlan.mjs'

function runPlan(args) {
  return evaluatePrelivePlan(parsePrelivePlanArgs(args))
}

function runPlanFails(args, expectedError) {
  assert.throws(() => runPlan(args), expectedError)
}

test('Invoke-PrelivePlan rejects wrong or missing approval token', () => {
  const output = runPlan([
    '-Action', 'EQUALIZER_APO_INSTALLATION',
    '-TargetIdentity', 'beast2-controller',
    '-ApprovalToken', 'BAD_TOKEN',
    '-CurrentStateHash', '0123456789abcdef',
    '-BackupHash', '0011223344556677',
  ])
  assert.equal(output.approved, false)
  assert.equal(output.reason, 'approval-token-mismatch')
})

test('Invoke-PrelivePlan rejects missing required token parameter', () => {
  runPlanFails([
    '-Action', 'EQUALIZER_APO_INSTALLATION',
    '-TargetIdentity', 'beast2-controller',
    '-CurrentStateHash', '0123456789abcdef',
    '-BackupHash', '0011223344556677',
  ], /ApprovalToken/)
})

test('Invoke-PrelivePlan enforces action-specific token scope', () => {
  const output = runPlan([
    '-Action', 'LIVE_SONOS_WRITE',
    '-TargetIdentity', 'beast2-controller',
    '-ApprovalToken', 'EQUALIZER_APO_INSTALLATION_APPROVAL_REQUIRED',
    '-CurrentStateHash', '0123456789abcdef',
    '-BackupHash', '0011223344556677',
  ])
  assert.equal(output.approved, false)
  assert.equal(output.reason, 'approval-token-mismatch')
})

test('Invoke-PrelivePlan blocks escape-capable target identities', () => {
  const withSlash = runPlan([
    '-Action', 'EQUALIZER_APO_INSTALLATION',
    '-TargetIdentity', 'room/safe',
    '-ApprovalToken', 'EQUALIZER_APO_INSTALLATION_APPROVAL_REQUIRED',
    '-CurrentStateHash', '0123456789abcdef',
    '-BackupHash', '0011223344556677',
  ])
  assert.equal(withSlash.approved, false)
  assert.equal(withSlash.reason, 'target-identity-contains-path-separator')

  const withDrive = runPlan([
    '-Action', 'EQUALIZER_APO_INSTALLATION',
    '-TargetIdentity', 'C:beast2-safe',
    '-ApprovalToken', 'EQUALIZER_APO_INSTALLATION_APPROVAL_REQUIRED',
    '-CurrentStateHash', '0123456789abcdef',
    '-BackupHash', '0011223344556677',
  ])
  assert.equal(withDrive.approved, false)
  assert.equal(withDrive.reason, 'target-identity-potential-escape')
})

test('Invoke-PrelivePlan rejects invalid hash and stale state', () => {
  const invalidHash = runPlan([
    '-Action', 'EQUALIZER_APO_INSTALLATION',
    '-TargetIdentity', 'beast2-controller',
    '-ApprovalToken', 'EQUALIZER_APO_INSTALLATION_APPROVAL_REQUIRED',
    '-CurrentStateHash', 'not-a-hash',
    '-BackupHash', '0011223344556677',
  ])
  assert.equal(invalidHash.approved, false)
  assert.equal(invalidHash.reason, 'missing-or-invalid-current-state-hash')

  const stale = runPlan([
    '-Action', 'LIVE_DSP_CANARY',
    '-TargetIdentity', 'beast2-controller',
    '-ApprovalToken', 'LIVE_DSP_CANARY_APPROVAL_REQUIRED',
    '-CurrentStateHash', '0123456789abcdef',
    '-BackupHash', '0011223344556677',
    '-PriorResult', 'uncertain',
  ])
  assert.equal(stale.approved, false)
  assert.equal(stale.reason, 'prior-result-stale-or-uncertain')
})

test('Invoke-PrelivePlan enforces backup proof and plan-only non-mutation', () => {
  const missingBackup = runPlan([
    '-Action', 'LIVE_SONOS_WRITE',
    '-TargetIdentity', 'beast2-controller',
    '-ApprovalToken', 'LIVE_SONOS_WRITE_APPROVAL_REQUIRED',
    '-CurrentStateHash', '0123456789abcdef',
    '-BackupHash', 'short',
  ])
  assert.equal(missingBackup.approved, false)
  assert.equal(missingBackup.reason, 'backup-hash-required')

  const planOnly = runPlan([
    '-Action', 'PRODUCTION_DEPLOYMENT',
    '-TargetIdentity', 'beast2-controller',
    '-ApprovalToken', 'PRODUCTION_CONTROLLER_DEPLOYMENT_APPROVAL_REQUIRED',
    '-CurrentStateHash', '0123456789abcdef',
    '-BackupHash', '0011223344556677',
    '-PlanOnly',
  ])
  assert.equal(planOnly.approved, true)
  assert.equal(planOnly.performed, false)
  assert.equal(planOnly.reason, 'plan-only-mode')
})
