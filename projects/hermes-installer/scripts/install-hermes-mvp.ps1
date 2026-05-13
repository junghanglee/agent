<#
Hermes Agent One-Stop Installer MVP for Windows

Goal:
- Install Hermes Agent from start to finish without user interaction.
- Use the official Hermes installer without modifying Hermes itself.
- Apply safe default configuration where possible.
- Save install logs for troubleshooting.

Security:
- This script does not collect API keys or passwords.
- This script does not send user secrets to any custom server.
- API keys, messaging tokens, and OAuth logins remain optional post-install settings.
#>

$ErrorActionPreference = 'Continue'

function Write-Step {
    param([string]$Message)
    Write-Host ""
    Write-Host "[STEP] $Message" -ForegroundColor Cyan
}

function Write-AILinkerStage {
    param([string]$Stage)
    Write-Host "[AILINKER:stage:$Stage]"
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

function Invoke-Hermes {
    param(
        [string]$HermesExe,
        [string[]]$Arguments,
        [switch]$Required
    )

    if (-not $HermesExe -or -not (Test-Path $HermesExe)) {
        $message = 'Hermes executable was not found.'
        if ($Required) { throw $message }
        Write-WarnMsg $message
        return $false
    }

    Write-Host "> hermes $($Arguments -join ' ')"
    & $HermesExe @Arguments
    $exitCode = $LASTEXITCODE

    if ($exitCode -ne 0) {
        $message = "hermes $($Arguments -join ' ') exited with code $exitCode"
        if ($Required) { throw $message }
        Write-WarnMsg $message
        return $false
    }

    return $true
}

$logRoot = Join-Path $env:USERPROFILE 'Desktop\Hermes-Installer-Logs'
New-Item -ItemType Directory -Force -Path $logRoot | Out-Null
$timestamp = Get-Date -Format 'yyyyMMdd-HHmmss'
$logFile = Join-Path $logRoot "hermes-install-$timestamp.log"

Start-Transcript -Path $logFile -Append | Out-Null
$installSucceeded = $false

try {
    Clear-Host
    Write-Host '============================================================' -ForegroundColor Magenta
    Write-Host ' Hermes AI Agent One-Stop Installer MVP' -ForegroundColor Magenta
    Write-Host '============================================================' -ForegroundColor Magenta
    Write-Host ''
    Write-Host 'This installer runs without prompts and uses safe defaults.'
    Write-Host 'Do not close this window while installation is running.'
    Write-Host ''
    Write-Host "Log file: $logFile"

    Write-AILinkerStage 'environment-check'
    Write-Step 'Checking Windows and PowerShell environment'
    Write-Host "OS: $([System.Environment]::OSVersion.VersionString)"
    Write-Host "PowerShell: $($PSVersionTable.PSVersion)"

    Write-AILinkerStage 'download-check'
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

    Write-AILinkerStage 'download-official-installer'
    Write-Step 'Running official Hermes installer in unattended mode'
    Write-Host 'Official installer URL:'
    Write-Host 'https://raw.githubusercontent.com/NousResearch/hermes-agent/main/scripts/install.ps1'
    Write-Host ''
    Write-WarnMsg 'Installation may take several minutes.'

    $officialInstallUrl = 'https://raw.githubusercontent.com/NousResearch/hermes-agent/main/scripts/install.ps1'
    $installScript = Invoke-RestMethod -Uri $officialInstallUrl -UseBasicParsing

    Write-AILinkerStage 'install-hermes-runtime'
    Write-Host 'Running official installer with -SkipSetup to avoid interactive setup prompts.'
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

    Write-Step 'Finding Hermes executable'
    $hermesCmd = Get-Command hermes -ErrorAction SilentlyContinue
    $hermesExe = $null
    if ($hermesCmd) {
        $hermesExe = $hermesCmd.Source
    } else {
        $fallbackHermesExe = Join-Path $env:HERMES_HOME 'hermes-agent\venv\Scripts\hermes.exe'
        if (Test-Path $fallbackHermesExe) {
            $hermesExe = $fallbackHermesExe
            Write-WarnMsg 'Hermes command is not visible in this PowerShell PATH yet, so using the direct installed path.'
        }
    }

    if (-not $hermesExe) {
        throw "Hermes executable was not found. Expected location: $env:LOCALAPPDATA\hermes"
    }

    Write-Ok "Hermes executable found: $hermesExe"

    Write-Step 'Verifying Hermes version'
    Invoke-Hermes -HermesExe $hermesExe -Arguments @('--version') -Required | Out-Null

    Write-AILinkerStage 'config-llm-defaults'
    Write-Step 'Applying safe default configuration'
    Write-Host 'These defaults can be changed later with hermes config or hermes setup.'
    Invoke-Hermes -HermesExe $hermesExe -Arguments @('config', 'migrate') | Out-Null
    Invoke-Hermes -HermesExe $hermesExe -Arguments @('config', 'set', 'model.provider', 'auto') | Out-Null
    Invoke-Hermes -HermesExe $hermesExe -Arguments @('config', 'set', 'model.base_url', 'https://openrouter.ai/api/v1') | Out-Null
    Invoke-Hermes -HermesExe $hermesExe -Arguments @('config', 'set', 'model.default', 'anthropic/claude-opus-4.6') | Out-Null
    Invoke-Hermes -HermesExe $hermesExe -Arguments @('config', 'set', 'terminal.backend', 'local') | Out-Null
    Invoke-Hermes -HermesExe $hermesExe -Arguments @('config', 'set', 'terminal.working_dir', '.') | Out-Null

    Write-Step 'Checking configuration status'
    Invoke-Hermes -HermesExe $hermesExe -Arguments @('config', 'check') | Out-Null

    Write-AILinkerStage 'diagnostic-skills'
    Write-Step 'Checking bundled skills'
    Invoke-Hermes -HermesExe $hermesExe -Arguments @('skills', 'list') | Out-Null

    Write-AILinkerStage 'diagnostic-doctor'
    Write-Step 'Running Hermes doctor'
    Invoke-Hermes -HermesExe $hermesExe -Arguments @('doctor') | Out-Null

    Write-Step 'Installation summary'
    Write-Ok 'Hermes base installation is complete.'
    Write-Host ''
    Write-Host 'Installed with safe defaults:'
    Write-Host "   HERMES_HOME: $env:HERMES_HOME"
    Write-Host "   Hermes exe:  $hermesExe"
    Write-Host '   Model provider: auto'
    Write-Host '   Default model:  anthropic/claude-opus-4.6'
    Write-Host '   Terminal:       local'
    Write-Host '   Skills:         bundled skills enabled'
    Write-Host ''
    Write-Host 'Optional post-install changes, only if needed:'
    Write-Host '   hermes setup --quick      Configure missing API keys or account logins'
    Write-Host '   hermes model              Change LLM provider/model'
    Write-Host '   hermes gateway setup      Connect messaging platforms'
    Write-Host '   hermes skills             Manage optional skills'
    Write-Host ''
    Write-Host 'If something fails later, share this log file:'
    Write-Host "   $logFile" -ForegroundColor White

    Write-AILinkerStage 'complete'
    $installSucceeded = $true
    Write-Ok 'Hermes one-stop installer finished.'
} catch {
    Write-Fail 'Installation failed.'
    Write-Host $_
    Write-Host ''
    Write-Host 'Please check or share this log file:'
    Write-Host $logFile -ForegroundColor White
} finally {
    Stop-Transcript | Out-Null
    Write-Host ''
    if ($installSucceeded) {
        Write-Host 'This window will close automatically.'
        exit 0
    } else {
        Write-Host 'Installation failed. This window will close automatically.'
        exit 1
    }
}
