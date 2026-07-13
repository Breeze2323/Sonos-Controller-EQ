[CmdletBinding()]
param(
    [string]$PackageRoot = "$PSScriptRoot\\..\\..\\artifacts\\releases",
    [string]$Version,
    [switch]$WhatIf
)

$ErrorActionPreference = 'Stop'
$repoRoot = Resolve-Path "$PSScriptRoot\\..\\.."
$packageStamp = Get-Date -Format 'yyyyMMdd-HHmmss'
if (-not (Test-Path $repoRoot)) { throw "Repository root not found: $repoRoot" }

if (-not $Version) {
    $package = Get-Content "$repoRoot\\package.json" -Raw | ConvertFrom-Json -ErrorAction Stop
    $Version = $package.version
}

$packageRootPath = Resolve-Path $PackageRoot -ErrorAction SilentlyContinue
if (-not $packageRootPath) { $packageRootPath = (New-Item -ItemType Directory -Path $PackageRoot -Force).FullName }
$targetDir = Join-Path $packageRootPath "$Version\\$packageStamp"
if (-not $WhatIf) {
    New-Item -ItemType Directory -Force -Path $targetDir | Out-Null
    New-Item -ItemType Directory -Force -Path $PackageRoot | Out-Null
}

$payload = [ordered]@{
    repositoryRoot = $repoRoot.Path
    generatedAt = (Get-Date).ToString('o')
    sourceSha = (git -C $repoRoot.Path rev-parse HEAD)
    packageJson = Get-Content "$repoRoot\\package.json" -Raw
    include = @('server', 'src', 'docs', 'scripts', 'shared', 'package.json', 'package-lock.json', 'index.html', 'server.js', 'dist')
    buildArtifactsPresent = Test-Path "$repoRoot\\dist"
}
$manifestPath = Join-Path $targetDir 'release-manifest.json'

$stagingRoot = Join-Path $targetDir 'source'
if (-not $WhatIf) {
    New-Item -ItemType Directory -Force -Path $stagingRoot | Out-Null
    foreach ($item in $payload.include) { Copy-Item "$repoRoot\\$item" -Destination $stagingRoot -Recurse -Force -ErrorAction Stop }
    Compress-Archive -Path "$stagingRoot\\*" -DestinationPath "$targetDir\\sonos-controller-eq-release-$Version-$packageStamp.zip"
    $zipPath = "$targetDir\\sonos-controller-eq-release-$Version-$packageStamp.zip"
    $payload.checksums = @{
        zip = (Get-FileHash -Algorithm SHA256 -Path $zipPath).Hash
        packageLock = (Get-FileHash -Algorithm SHA256 -Path "$repoRoot\\package-lock.json").Hash
    }
    $payload.artifact = [ordered]@{ path = $zipPath; name = Split-Path $zipPath -Leaf }
    $payload.version = $Version
    $payload.dependencyLock = 'package-lock.json'
    $payload.tests = 'npm ci --ignore-scripts; npm run lint; npm run build; npm run secret-scan'
    $payload.license = 'CC-BY-NC-4.0'
    $payload.mode = 'sandbox-package-only'
    $payload.dryRunInstallPlan = @(
        "npm ci --ignore-scripts --silent",
        "Expand-Archive -Path '$zipPath' -DestinationPath (Join-Path <temp> 'release')",
        "node ./scripts/windows/Invoke-PrelivePlan.ps1 ...",
        "No production endpoints touched"
    )
    $payload.dryRunRollbackPlan = @(
        'Delete staged extract root.',
        'Restore from known-good install backup.',
        'Do not mutate controller data before manual verification'
    )
    Set-Content $manifestPath -Value (ConvertTo-Json $payload -Depth 20)
    Write-Output "Release package created: $($payload.artifact.path)"
    Write-Output "Manifest: $manifestPath"
}
else {
    Write-Output "Plan only: would emit release package under $targetDir"
    Write-Output ([pscustomobject]@{ version=$Version; manifest=$manifestPath; whatIf=$true } | ConvertTo-Json -Compress)
    exit 0
}
