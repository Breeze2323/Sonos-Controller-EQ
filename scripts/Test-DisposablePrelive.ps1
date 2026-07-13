[CmdletBinding()]
param(
    [string]$OutDir,
    [switch]$WhatIf
)

$ErrorActionPreference = 'Stop'

$workspace = Resolve-Path .
$stamp = Get-Date -Format 'yyyyMMdd-HHmmss'
if (-not $OutDir) { $OutDir = Join-Path $workspace "artifacts\disposable-prelive-$stamp" }
New-Item -ItemType Directory -Force -Path $OutDir | Out-Null

if ($WhatIf) {
    Write-Output ([pscustomobject]@{
        whatIf = $true
        note = 'No process mutation performed. Planned synthetic harness command below.'
        command = 'node scripts/disposable-prelive.mjs'
        outDir = $OutDir
    } | ConvertTo-Json -Compress)
    exit 0
}

$node = Get-Command node -ErrorAction Stop
Set-Location $workspace
$oldNodePath = $env:NODE_PATH
$oldEvidencePath = $env:DISPOSABLE_OUT_DIR
$env:NODE_PATH = Join-Path $workspace 'node_modules'
$env:DISPOSABLE_OUT_DIR = Join-Path $OutDir "artifacts"
New-Item -ItemType Directory -Force -Path $env:DISPOSABLE_OUT_DIR | Out-Null
$outLog = Join-Path $OutDir "disposable-prelive.log"
$outErr = Join-Path $OutDir "disposable-prelive.err"

try {
    $proc = Start-Process -FilePath $node.Source -ArgumentList 'scripts/disposable-prelive.mjs' -PassThru -NoNewWindow -Wait -RedirectStandardOutput $outLog -RedirectStandardError $outErr
}
finally {
    if ($null -eq $oldEvidencePath) { Remove-Item Env:DISPOSABLE_OUT_DIR -ErrorAction SilentlyContinue } else { $env:DISPOSABLE_OUT_DIR = $oldEvidencePath }
    if ($null -eq $oldNodePath) { Remove-Item Env:NODE_PATH -ErrorAction SilentlyContinue } else { $env:NODE_PATH = $oldNodePath }
}

if ($proc.ExitCode -ne 0) {
    throw "Disposable harness failed with exit code $($proc.ExitCode). See $OutDir\disposable-prelive.err"
}

Write-Output "Disposable prelive harness complete. Evidence in: $OutDir"
