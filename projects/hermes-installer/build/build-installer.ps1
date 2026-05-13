<#
Builds the InStep Hermes installer executable.

Primary output:
- dist/InStep-Hermes-Installer.exe

This build uses the Windows .NET Framework C# compiler so it works even when
Inno Setup is not installed. If Inno Setup is installed, the .iss file can be
compiled separately for a wizard-style installer.
#>

$ErrorActionPreference = 'Stop'

$projectRoot = Resolve-Path (Join-Path $PSScriptRoot '..')
$distDir = Join-Path $projectRoot 'dist'
$assetsDir = Join-Path $projectRoot 'assets'
$scriptPath = Join-Path $projectRoot 'scripts\install-hermes-mvp.ps1'
$sourcePath = Join-Path $PSScriptRoot 'InStepInstallerLauncher.cs'
$iconPath = Join-Path $assetsDir 'instep.ico'
$outPath = Join-Path $distDir 'InStep-Hermes-Installer.exe'

New-Item -ItemType Directory -Force -Path $distDir | Out-Null

if (-not (Test-Path $scriptPath)) { throw "Installer script not found: $scriptPath" }
if (-not (Test-Path $sourcePath)) { throw "Launcher source not found: $sourcePath" }
if (-not (Test-Path $iconPath)) {
    Write-Host 'Icon not found. Generating icon...'
    & powershell.exe -NoProfile -ExecutionPolicy Bypass -File (Join-Path $PSScriptRoot 'New-InStepIcon.ps1')
}

$candidates = @(
    "$env:WINDIR\Microsoft.NET\Framework64\v4.0.30319\csc.exe",
    "$env:WINDIR\Microsoft.NET\Framework\v4.0.30319\csc.exe"
)
$csc = $candidates | Where-Object { Test-Path $_ } | Select-Object -First 1
if (-not $csc) { throw 'C# compiler csc.exe was not found.' }

if (Test-Path $outPath) { Remove-Item -Force $outPath }

$resourceArg = "/resource:$scriptPath,InStepInstaller.Resources.install-hermes-mvp.ps1"
$iconArg = "/win32icon:$iconPath"

& $csc /nologo /target:exe /platform:anycpu /optimize+ $iconArg $resourceArg "/out:$outPath" $sourcePath
if ($LASTEXITCODE -ne 0) { throw "csc.exe failed with exit code $LASTEXITCODE" }

Write-Host "Built: $outPath"
