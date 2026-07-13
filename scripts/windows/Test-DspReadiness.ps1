[CmdletBinding()]
param(
    [string]$OutputPath,
    [switch]$CheckLoopbackServices
)

$ErrorActionPreference = 'Stop'

function Invoke-SafeCommandVersion {
    param([string]$Command, [string[]]$Arguments)
    try {
        $result = & $Command @Arguments 2>$null
        if ($LASTEXITCODE -ne 0) { return $null }
        return ($result | Select-Object -First 1).ToString().Trim()
    }
    catch { return $null }
}

$report = [ordered]@{
    schemaVersion = 1
    generatedAt = (Get-Date).ToString('o')
    host = $env:COMPUTERNAME
    windows = [ordered]@{
        version = [Environment]::OSVersion.VersionString
        architecture = $env:PROCESSOR_ARCHITECTURE
        powershell = $PSVersionTable.PSVersion.ToString()
    }
    tools = [ordered]@{
        node = Invoke-SafeCommandVersion -Command 'node' -Arguments @('--version')
        npm = Invoke-SafeCommandVersion -Command 'npm' -Arguments @('--version')
    }
    listeners = @()
    audioDevices = @()
    equalizerApo = [ordered]@{
        installed = $false
        installPath = $null
        configuratorPath = $null
        configPath = $null
    }
    unavailable = @()
}

try {
    $report.audioDevices = @(Get-CimInstance Win32_SoundDevice -ErrorAction Stop | ForEach-Object {
        [ordered]@{
            name = $_.Name
            manufacturer = $_.Manufacturer
            status = $_.Status
            deviceId = $_.DeviceID
        }
    })
}
catch {
    $report.unavailable += "Win32_SoundDevice: $($_.Exception.Message)"
}

$apoCandidates = @(
    'C:\Program Files\EqualizerAPO',
    'C:\Program Files (x86)\EqualizerAPO'
)
foreach ($candidate in $apoCandidates) {
    if (Test-Path -LiteralPath $candidate -PathType Container) {
        $report.equalizerApo.installed = $true
        $report.equalizerApo.installPath = $candidate
        $configurator = Join-Path $candidate 'Configurator.exe'
        $configPath = Join-Path $candidate 'config'
        if (Test-Path -LiteralPath $configurator) { $report.equalizerApo.configuratorPath = $configurator }
        if (Test-Path -LiteralPath $configPath) { $report.equalizerApo.configPath = $configPath }
        break
    }
}

if ($CheckLoopbackServices) {
    foreach ($port in @(3000, 5005)) {
        $listener = Get-NetTCPConnection -State Listen -LocalPort $port -ErrorAction SilentlyContinue | Select-Object -First 1
        $report.listeners += [ordered]@{
            port = $port
            listening = [bool]$listener
            processId = if ($listener) { $listener.OwningProcess } else { $null }
        }
    }
}

$json = $report | ConvertTo-Json -Depth 8
$json

if ($OutputPath) {
    $parent = Split-Path -Parent $OutputPath
    if ($parent -and -not (Test-Path -LiteralPath $parent)) {
        throw "Output directory does not exist: $parent"
    }
    [IO.File]::WriteAllText($OutputPath, $json, [Text.UTF8Encoding]::new($false))
}
