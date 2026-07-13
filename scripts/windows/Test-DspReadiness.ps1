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

function Get-SafeHash([string]$InputString) {
    if ([string]::IsNullOrEmpty($InputString)) { return $null }
    try {
        $bytes = [Text.Encoding]::UTF8.GetBytes($InputString)
        $sha = [Security.Cryptography.SHA256]::Create().ComputeHash($bytes)
        return [BitConverter]::ToString($sha).Replace('-', '').ToLowerInvariant()
    }
    catch { return $null }
}

function Resolve-ProcessByPort([int]$Port) {
    try {
        return Get-NetTCPConnection -State Listen -LocalPort $Port -ErrorAction SilentlyContinue | Select-Object -First 1
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
    processMetadata = @()
    audioDevices = @()
    equalizerApo = [ordered]@{
        candidates = @(
            [ordered]@{ installPath = 'C:\Program Files\EqualizerAPO'; found = $false }
            [ordered]@{ installPath = 'C:\Program Files (x86)\EqualizerAPO'; found = $false }
        )
        configuratorFound = $false
        configDirFound = $false
    }
    metadata = [ordered]@{
        sonosApiDefaultPort = 5005
        controllerDefaultPort = 3000
        loopbackServicesChecked = $CheckLoopbackServices.IsPresent
        defaultPlaybackEndpoint = $null
        scheduledTaskProbed = $false
        scheduledTaskNames = @()
    }
    unavailable = @()
}

try {
    $report.audioDevices = @(Get-CimInstance Win32_SoundDevice -ErrorAction Stop | ForEach-Object {
        [ordered]@{
            name = $_.Name
            manufacturer = $_.Manufacturer
            status = $_.Status
            deviceIdHash = Get-SafeHash $_.DeviceID
        }
    })
}
catch {
    $report.unavailable += "Win32_SoundDevice: $($_.Exception.Message)"
}

$dataFile = Join-Path $PSScriptRoot '..\\..\\sonos-data.json'
if (Test-Path -LiteralPath $dataFile -PathType Leaf) {
    try {
        $data = Get-Content $dataFile -Raw | ConvertFrom-Json -ErrorAction Stop
        if ($data.'sonos-config'.host -and $data.'sonos-config'.port) {
            $report.metadata.defaultPlaybackEndpoint = "${($data.'sonos-config'.host)}:${($data.'sonos-config'.port)}"
        }
    }
    catch {
        $report.unavailable += "sonos-data.json: $($_.Exception.Message)"
    }
}

foreach ($candidate in @($report.equalizerApo.candidates)) {
    if (Test-Path -LiteralPath $candidate.installPath -PathType Container) {
        $candidate.found = $true
        $report.equalizerApo.configuratorFound = $report.equalizerApo.configuratorFound -or (Test-Path -LiteralPath (Join-Path $candidate.installPath 'Configurator.exe') -PathType Leaf)
        $report.equalizerApo.configDirFound = $report.equalizerApo.configDirFound -or (Test-Path -LiteralPath (Join-Path $candidate.installPath 'config') -PathType Container)
    }
}

if ($CheckLoopbackServices) {
    foreach ($port in @(3000, 5005)) {
        $listener = Resolve-ProcessByPort -Port $port
        $meta = $null
        if ($listener) {
            try {
                $proc = Get-Process -Id $listener.OwningProcess -ErrorAction Stop
                $meta = [ordered]@{
                    port = $port
                    pid = $proc.Id
                    name = $proc.ProcessName
                    pathHint = if ($proc.Path) { [IO.Path]::GetFileName($proc.Path) } else { $null }
                }
                $report.processMetadata += $meta
            }
            catch {
                $report.unavailable += "port:$port:process-metadata:$($_.Exception.Message)"
            }
        }
        $report.listeners += [ordered]@{
            port = $port
            listening = [bool]$listener
            processId = if ($listener) { $listener.OwningProcess } else { $null }
        }
    }
}

if (Get-Command Get-ScheduledTask -ErrorAction SilentlyContinue) {
    $report.metadata.scheduledTaskProbed = $true
    try {
        $report.metadata.scheduledTaskNames = @(Get-ScheduledTask -TaskName 'Sonos*' -ErrorAction SilentlyContinue | Select-Object -ExpandProperty TaskName)
    }
    catch {
        $report.unavailable += "Get-ScheduledTask: $($_.Exception.Message)"
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
