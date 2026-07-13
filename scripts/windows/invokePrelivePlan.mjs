const APPROVED_TOKENS = {
  EQUALIZER_APO_INSTALLATION: 'EQUALIZER_APO_INSTALLATION_APPROVAL_REQUIRED',
  WINDOWS_AUDIO_ENDPOINT_MUTATION: 'WINDOWS_AUDIO_ENDPOINT_MUTATION_APPROVAL_REQUIRED',
  LIVE_DSP_CANARY: 'LIVE_DSP_CANARY_APPROVAL_REQUIRED',
  LIVE_SONOS_WRITE: 'LIVE_SONOS_WRITE_APPROVAL_REQUIRED',
  PRODUCTION_DEPLOYMENT: 'PRODUCTION_CONTROLLER_DEPLOYMENT_APPROVAL_REQUIRED',
}
import path from 'node:path'
import { fileURLToPath } from 'node:url'

function isMissing(value) {
  return value === undefined || value === null || value === ''
}

function isValidHexHash(value) {
  return /^[0-9a-fA-F]{16,}$/.test(value)
}

function validateRequiredParam(name, value) {
  if (isMissing(value)) {
    throw new Error(`Missing required parameter: ${name}`)
  }
}

export function parsePrelivePlanArgs(argv) {
  const parsed = {}
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i]
    if (token === '-PlanOnly') {
      parsed.PlanOnly = true
      continue
    }
    if (!token.startsWith('-')) {
      continue
    }
    const key = token.replace(/^-+/, '')
    const value = argv[i + 1]
    if (!value || value.startsWith('-')) {
      throw new Error(`Missing value for parameter: ${key}`)
    }
    parsed[key] = value
    i += 1
  }
  return parsed
}

export function evaluatePrelivePlan(params) {
  const action = params.Action
  const targetIdentity = params.TargetIdentity
  const approvalToken = params.ApprovalToken
  const currentStateHash = params.CurrentStateHash
  const backupHash = params.BackupHash
  const priorResult = params.PriorResult ?? 'pending'

  const plan = {
    timestamp: new Date().toISOString(),
    action,
    targetIdentity,
    approved: false,
    performed: false,
    reason: null,
  }

  const expectedToken = APPROVED_TOKENS[action]
  if (!expectedToken) {
    plan.reason = 'unknown-action'
    return plan
  }

  validateRequiredParam('Action', action)
  validateRequiredParam('TargetIdentity', targetIdentity)
  validateRequiredParam('ApprovalToken', approvalToken)
  validateRequiredParam('CurrentStateHash', currentStateHash)
  validateRequiredParam('BackupHash', backupHash)

  if (approvalToken !== expectedToken) {
    plan.reason = 'approval-token-mismatch'
    return plan
  }

  if (/[\\/]/.test(targetIdentity)) {
    plan.reason = 'target-identity-contains-path-separator'
    return plan
  }

  if (targetIdentity.includes('..') || targetIdentity.includes(':')) {
    plan.reason = 'target-identity-potential-escape'
    return plan
  }

  if (!isValidHexHash(currentStateHash)) {
    plan.reason = 'missing-or-invalid-current-state-hash'
    return plan
  }

  if (!isValidHexHash(backupHash)) {
    plan.reason = action === 'PRODUCTION_DEPLOYMENT'
      ? 'backup-hash-required-for-production-deploy'
      : 'backup-hash-required'
    return plan
  }

  if (priorResult === 'stale' || priorResult === 'uncertain') {
    plan.reason = 'prior-result-stale-or-uncertain'
    return plan
  }

  plan.approved = true
  if (params.PlanOnly) {
    plan.performed = false
    plan.reason = 'plan-only-mode'
    return plan
  }

  plan.performed = false
  plan.reason = 'dry-run-only-script-no-mutation'
  return plan
}

if (fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const args = parsePrelivePlanArgs(process.argv.slice(2))
  const result = evaluatePrelivePlan(args)
  process.stdout.write(JSON.stringify(result))
}
