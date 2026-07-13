[CmdletBinding()]
param(
    [Parameter(Mandatory)]
    [string]$ManifestPath
)

$ErrorActionPreference = 'Stop'
$manifest = Get-Content $ManifestPath -Raw | ConvertFrom-Json -ErrorAction Stop

if (-not (Test-Path -LiteralPath $manifest.artifact.path)) {
    throw "Packaged artifact not found: $($manifest.artifact.path)"
}

$expectedHash = $manifest.checksums.zip
$actualHash = (Get-FileHash -Algorithm SHA256 -Path $manifest.artifact.path).Hash
if ($expectedHash -ne $actualHash) {
    throw "Artifact checksum mismatch"
}

$scratch = Join-Path (Split-Path $manifest.artifact.path -Parent) 'test-extract'
New-Item -ItemType Directory -Force -Path $scratch | Out-Null
Expand-Archive -Path $manifest.artifact.path -DestinationPath $scratch -Force

$required = @('package.json', 'package-lock.json', 'server', 'src', 'shared', 'index.html', 'server.js')
foreach ($item in $required) {
    if (-not (Test-Path (Join-Path $scratch $item))) { throw "Missing packaged file: $item" }
}

Push-Location $scratch
try {
    if (-not (Test-Path 'index.html')) { throw 'Index entrypoint missing in extracted package' }
    node --version
    npm --version
    npm ci --ignore-scripts --silent | Out-Host
    npm run build | Out-Host
    node scripts/secret-scan.mjs "$PWD" | Out-Host
}
finally {
    Pop-Location
}

Write-Output "Release package validation passed: $($manifest.artifact.path)"
