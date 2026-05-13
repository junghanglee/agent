<#
Builds the AI Linker Hermes installer executable.

Primary output:
- dist/AI-Linker-Hermes-Installer.exe
#>

$ErrorActionPreference = 'Stop'

$projectRoot = Resolve-Path (Join-Path $PSScriptRoot '..')
$distDir = Join-Path $projectRoot 'dist'
$assetsDir = Join-Path $projectRoot 'assets'
$scriptPath = Join-Path $projectRoot 'scripts\install-hermes-mvp.ps1'
$sourcePath = Join-Path $PSScriptRoot 'AILinkerInstallerLauncher.cs'
$iconPath = Join-Path $assetsDir 'ai-linker.ico'
$hermesBannerPath = Join-Path $assetsDir 'hermes\hermes-banner.png'
$outPath = Join-Path $distDir 'AI-Linker-Hermes-Installer.exe'

New-Item -ItemType Directory -Force -Path $distDir | Out-Null
New-Item -ItemType Directory -Force -Path $assetsDir | Out-Null

if (-not (Test-Path $scriptPath)) { throw "Installer script not found: $scriptPath" }
if (-not (Test-Path $sourcePath)) { throw "Launcher source not found: $sourcePath" }
if (-not (Test-Path $hermesBannerPath)) { throw "Hermes banner asset not found: $hermesBannerPath" }
if (-not (Test-Path $iconPath)) { throw "AI Linker icon not found: $iconPath" }

$candidates = @(
    "$env:WINDIR\Microsoft.NET\Framework64\v4.0.30319\csc.exe",
    "$env:WINDIR\Microsoft.NET\Framework\v4.0.30319\csc.exe"
)
$csc = $candidates | Where-Object { Test-Path $_ } | Select-Object -First 1
if (-not $csc) { throw 'C# compiler csc.exe was not found.' }

if (Test-Path $outPath) { Remove-Item -Force $outPath }

$resourceArg = "/resource:$scriptPath,AILinkerInstaller.Resources.install-hermes-mvp.ps1"
$bannerResourceArg = "/resource:$hermesBannerPath,AILinkerInstaller.Resources.hermes-banner.png"
$iconResourceArg = "/resource:$iconPath,AILinkerInstaller.Resources.ai-linker.ico"
$iconArg = "/win32icon:$iconPath"

& $csc /nologo /target:winexe /platform:anycpu /optimize+ /reference:System.Windows.Forms.dll /reference:System.Drawing.dll $iconArg $resourceArg $bannerResourceArg $iconResourceArg "/out:$outPath" $sourcePath
if ($LASTEXITCODE -ne 0) { throw "csc.exe failed with exit code $LASTEXITCODE" }

Write-Host "Built: $outPath"
