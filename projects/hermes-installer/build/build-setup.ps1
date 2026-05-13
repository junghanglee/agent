<#
Builds the wizard-style InStep Hermes setup package with Inno Setup.

Outputs:
- dist/InStep-Hermes-Installer.exe   GUI installer app
- dist/InStep-Hermes-Setup.exe       Windows setup package
#>

$ErrorActionPreference = 'Stop'

$projectRoot = Resolve-Path (Join-Path $PSScriptRoot '..')
$distDir = Join-Path $projectRoot 'dist'
$issPath = Join-Path $projectRoot 'packaging\InStepHermesInstaller.iss'
$launcherPath = Join-Path $distDir 'InStep-Hermes-Installer.exe'
$setupPath = Join-Path $distDir 'InStep-Hermes-Setup.exe'

if (-not (Test-Path $issPath)) { throw "Inno Setup script not found: $issPath" }

# Always rebuild the GUI installer first so the setup package contains the latest UX and script.
& powershell.exe -NoProfile -ExecutionPolicy Bypass -File (Join-Path $PSScriptRoot 'build-installer.ps1')
if ($LASTEXITCODE -ne 0) { throw "build-installer.ps1 failed with exit code $LASTEXITCODE" }
if (-not (Test-Path $launcherPath)) { throw "Launcher was not built: $launcherPath" }

$candidates = @(
    'C:\Program Files (x86)\Inno Setup 6\ISCC.exe',
    'C:\Program Files\Inno Setup 6\ISCC.exe',
    "$env:LOCALAPPDATA\Programs\Inno Setup 6\ISCC.exe"
)

$cmd = Get-Command ISCC.exe -ErrorAction SilentlyContinue
if ($cmd) { $candidates = @($cmd.Source) + $candidates }

$iscc = $candidates | Where-Object { $_ -and (Test-Path $_) } | Select-Object -First 1
if (-not $iscc) {
    throw 'Inno Setup compiler ISCC.exe was not found. Install with: winget install --id JRSoftware.InnoSetup -e'
}

if (Test-Path $setupPath) { Remove-Item -Force $setupPath }

Push-Location (Split-Path $issPath -Parent)
try {
    & $iscc (Split-Path $issPath -Leaf)
    if ($LASTEXITCODE -ne 0) { throw "ISCC.exe failed with exit code $LASTEXITCODE" }
} finally {
    Pop-Location
}

if (-not (Test-Path $setupPath)) { throw "Setup package was not created: $setupPath" }

Write-Host "Built launcher: $launcherPath"
Write-Host "Built setup:    $setupPath"
