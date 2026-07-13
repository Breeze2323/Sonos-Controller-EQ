[CmdletBinding()]
param(
    [Parameter(Mandatory)]
    [ValidateSet('EQUALIZER_APO_INSTALLATION','WINDOWS_AUDIO_ENDPOINT_MUTATION','LIVE_DSP_CANARY','LIVE_SONOS_WRITE','PRODUCTION_DEPLOYMENT')]
    [string]$Action,
    [Parameter(Mandatory)]
    [string]$TargetIdentity,
    [Parameter(Mandatory)]
    [string]$ApprovalToken,
    [Parameter(Mandatory)]
    [string]$CurrentStateHash,
    [Parameter(Mandatory)]
    [string]$BackupHash,
    [ValidateSet('pending','stale','known-good','uncertain')]
    [string]$PriorResult = 'pending',
    [switch]$PlanOnly
)

$ErrorActionPreference = 'Stop'

$approvedTokens = @{
    EQUALIZER_APO_INSTALLATION = 'EQUALIZER_APO_INSTALLATION_APPROVAL_REQUIRED'
    WINDOWS_AUDIO_ENDPOINT_MUTATION = 'WINDOWS_AUDIO_ENDPOINT_MUTATION_APPROVAL_REQUIRED'
    LIVE_DSP_CANARY = 'LIVE_DSP_CANARY_APPROVAL_REQUIRED'
    LIVE_SONOS_WRITE = 'LIVE_SONOS_WRITE_APPROVAL_REQUIRED'
    PRODUCTION_DEPLOYMENT = 'PRODUCTION_CONTROLLER_DEPLOYMENT_APPROVAL_REQUIRED'
}

$plan = [ordered]@{
    timestamp = (Get-Date).ToString('o')
    action = $Action
    targetIdentity = $TargetIdentity
    approved = $false
    performed = $false
    reason = $null
}

$expectedToken = $approvedTokens[$Action]
if (-not $expectedToken) {
    $plan.reason = 'unknown-action'
    Write-Output (ConvertTo-Json $plan -Compress)
    exit 0
}
if ($ApprovalToken -ne $expectedToken) {
    $plan.reason = 'approval-token-mismatch'
    Write-Output (ConvertTo-Json $plan -Compress)
    exit 0
}

if ($TargetIdentity -match '[\\/]') {
    $plan.reason = 'target-identity-contains-path-separator'
    Write-Output (ConvertTo-Json $plan -Compress)
    exit 0
}
if ($TargetIdentity -match '\.\.' -or $TargetIdentity.Contains(':')) {
    $plan.reason = 'target-identity-potential-escape'
    Write-Output (ConvertTo-Json $plan -Compress)
    exit 0
}

if (-not $CurrentStateHash -or -not ($CurrentStateHash -match '^[0-9a-fA-F]{16,}$')) {
    $plan.reason = 'missing-or-invalid-current-state-hash'
    Write-Output (ConvertTo-Json $plan -Compress)
    exit 0
}
if ($Action -ne 'PRODUCTION_DEPLOYMENT' -and -not ($BackupHash -match '^[0-9a-fA-F]{16,}$')) {
    $plan.reason = 'backup-hash-required'
    Write-Output (ConvertTo-Json $plan -Compress)
    exit 0
}
if ($Action -eq 'PRODUCTION_DEPLOYMENT' -and -not ($BackupHash -match '^[0-9a-fA-F]{16,}$')) {
    $plan.reason = 'backup-hash-required-for-production-deploy'
    Write-Output (ConvertTo-Json $plan -Compress)
    exit 0
}
if ($PriorResult -in @('stale','uncertain')) {
    $plan.reason = 'prior-result-stale-or-uncertain'
    Write-Output (ConvertTo-Json $plan -Compress)
    exit 0
}

$plan.approved = $true
if ($PlanOnly) {
    $plan.performed = $false
    $plan.reason = 'plan-only-mode'
    Write-Output (ConvertTo-Json $plan -Compress)
    exit 0
}

$plan.performed = $false
$plan.reason = 'dry-run-only-script-no-mutation'
Write-Output (ConvertTo-Json $plan -Compress)
