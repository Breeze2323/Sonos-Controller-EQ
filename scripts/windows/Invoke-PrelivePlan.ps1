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

$engine = Join-Path $PSScriptRoot 'invokePrelivePlan.mjs'
$arguments = @(
    '-Action', $Action,
    '-TargetIdentity', $TargetIdentity,
    '-ApprovalToken', $ApprovalToken,
    '-CurrentStateHash', $CurrentStateHash,
    '-BackupHash', $BackupHash,
    '-PriorResult', $PriorResult
)
if ($PlanOnly) {
    $arguments += '-PlanOnly'
}

& node $engine $arguments
