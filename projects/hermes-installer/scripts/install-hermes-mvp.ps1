<#
Hermes Agent Installer MVP for Windows

Goal:
- Help non-developers install Hermes Agent on Windows.
- Use the official Hermes installer without modifying Hermes itself.
- Save install logs for troubleshooting.
- Guide the user to LLM, gateway, and skills setup after install.

Security:
- This script does not collect API keys or passwords.
- This script does not send user secrets to any custom server.
#>

$ErrorActionPreference = 'Continue'

function Write-Step {
    param([string]$Message)
    Write-Host ""
    Write-Host "[STEP] $Message" -ForegroundColor Cyan
}

function Write-Ok {
    param([string]$Message)
    Write-Host "[OK] $Message" -ForegroundColor Green
}

function Write-WarnMsg {
    param([string]$Message)
    Write-Host "[WARN] $Message" -ForegroundColor Yellow
}

function Write-Fail {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor Red
}

$logRoot = Join-Path $env:USERPROFILE 'Desktop\Hermes-Installer-Logs'
New-Item -ItemType Directory -Force -Path $logRoot | Out-Null
$timestamp = Get-Date -Format 'yyyyMMdd-HHmmss'
$logFile = Join-Path $logRoot "hermes-install-$timestamp.log"

Start-Transcript -Path $logFile -Append | Out-Null

try {
    Clear-Host
    Write-Host '============================================================' -ForegroundColor Magenta
    Write-Host ' Hermes AI Agent Installer MVP' -ForegroundColor Magenta
    Write-Host '============================================================' -ForegroundColor Magenta
    Write-Host ''
    Write-Host 'This installer uses the official Hermes Agent installer.'
    Write-Host 'Do not close this window while installation is running.'
    Write-Host ''
    Write-Host "Log file: $logFile"

    Write-Step 'Checking Windows and PowerShell environment'
    Write-Host "OS: $([System.Environment]::OSVersion.VersionString)"
    Write-Host "PowerShell: $($PSVersionTable.PSVersion)"

    Write-Step 'Checking internet access to GitHub'
    try {
        $response = Invoke-WebRequest -Uri 'https://github.com' -UseBasicParsing -TimeoutSec 20
        if ($response.StatusCode -ge 200 -and $response.StatusCode -lt 400) {
            Write-Ok 'GitHub is reachable.'
        } else {
            Write-WarnMsg "GitHub response code: $($response.StatusCode)"
        }
    } catch {
        Write-Fail 'Could not reach GitHub. Check internet connection, firewall, or proxy.'
        Write-Host $_
        throw
    }

    Write-Step 'Running official Hermes installer'
    Write-Host 'Official installer URL:'
    Write-Host 'https://raw.githubusercontent.com/NousResearch/hermes-agent/main/scripts/install.ps1'
    Write-Host ''
    Write-WarnMsg 'Installation may take several minutes.'

    $officialInstallUrl = 'https://raw.githubusercontent.com/NousResearch/hermes-agent/main/scripts/install.ps1'
    $installScript = Invoke-RestMethod -Uri $officialInstallUrl -UseBasicParsing

    Write-Host 'Running official installer with -SkipSetup to avoid blocking on the interactive setup wizard.'
    $officialInstaller = [scriptblock]::Create($installScript)
    & $officialInstaller -SkipSetup
    if ($LASTEXITCODE -ne 0) {
        throw "Official Hermes installer failed with exit code $LASTEXITCODE"
    }

    Write-Step 'Refreshing PATH and Hermes environment for this PowerShell session'
    $userPath = [Environment]::GetEnvironmentVariable('Path', 'User')
    $machinePath = [Environment]::GetEnvironmentVariable('Path', 'Machine')
    $env:Path = "$userPath;$machinePath;$env:Path"
    $env:HERMES_HOME = [Environment]::GetEnvironmentVariable('HERMES_HOME', 'User')
    if (-not $env:HERMES_HOME) {
        $env:HERMES_HOME = Join-Path $env:LOCALAPPDATA 'hermes'
    }

    Write-Step 'Checking Hermes command'
    $hermesCmd = Get-Command hermes -ErrorAction SilentlyContinue
    $hermesExe = $null
    if ($hermesCmd) {
        $hermesExe = $hermesCmd.Source
    } else {
        $fallbackHermesExe = Join-Path $env:HERMES_HOME 'hermes-agent\venv\Scripts\hermes.exe'
        if (Test-Path $fallbackHermesExe) {
            $hermesExe = $fallbackHermesExe
            Write-WarnMsg 'Hermes command is not visible in this PowerShell PATH yet, so using the direct installed path for verification.'
        }
    }

    if ($hermesExe) {
        Write-Ok "Hermes executable found: $hermesExe"
        try {
            & $hermesExe --version
        } catch {
            Write-WarnMsg 'Hermes version check failed, but Hermes may still be installed.'
            Write-Host $_
        }
    } else {
        Write-WarnMsg 'Hermes command was not found in this PowerShell session.'
        Write-WarnMsg 'Open a new PowerShell window and try again.'
        Write-Host 'Expected install location:'
        Write-Host "$env:LOCALAPPDATA\hermes"
    }

    Write-Step 'Running Hermes doctor when available'
    if ($hermesExe) {
        try {
            & $hermesExe doctor
        } catch {
            Write-WarnMsg 'hermes doctor failed. Check the log file.'
            Write-Host $_
        }
    } else {
        Write-WarnMsg 'Skipping hermes doctor because Hermes executable was not found.'
    }

    Write-Step 'Next steps'
    Write-Host '1. Open a new PowerShell window, then verify Hermes:'
    Write-Host '   hermes --version' -ForegroundColor White
    Write-Host ''
    Write-Host '2. Finish missing setup items only:'
    Write-Host '   hermes setup --quick' -ForegroundColor White
    Write-Host ''
    Write-Host '3. Connect an LLM provider:'
    Write-Host '   hermes model' -ForegroundColor White
    Write-Host ''
    Write-Host '4. Start Hermes:'
    Write-Host '   hermes' -ForegroundColor White
    Write-Host ''
    Write-Host '5. Optional messaging gateway setup:'
    Write-Host '   hermes gateway setup' -ForegroundColor White
    Write-Host ''
    Write-Host '6. Optional skills:'
    Write-Host '   hermes skills' -ForegroundColor White
    Write-Host ''
    Write-Host 'If something fails, share this log file:'
    Write-Host "   $logFile" -ForegroundColor White

    Write-Ok 'Hermes installer MVP finished.'
} catch {
    Write-Fail 'Installation failed.'
    Write-Host $_
    Write-Host ''
    Write-Host 'Please check or share this log file:'
    Write-Host $logFile -ForegroundColor White
} finally {
    Stop-Transcript | Out-Null
    Write-Host ''
    Write-Host 'Press any key to close this window.'
    $null = $Host.UI.RawUI.ReadKey('NoEcho,IncludeKeyDown')
}
