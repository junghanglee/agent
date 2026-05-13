@echo off
setlocal

title Hermes AI Agent One-Stop Installer MVP

echo ============================================================
echo  Hermes AI Agent One-Stop Installer MVP
echo ============================================================
echo.
echo This file runs the unattended PowerShell installer script.
echo Do not close the window while installation is running.
echo.

set "SCRIPT_DIR=%~dp0"
set "PROJECT_DIR=%SCRIPT_DIR%.."
set "PS_SCRIPT=%PROJECT_DIR%\scripts\install-hermes-mvp.ps1"

if not exist "%PS_SCRIPT%" (
  echo [ERROR] Installer script not found.
  echo Path: %PS_SCRIPT%
  pause
  exit /b 1
)

powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%PS_SCRIPT%"

endlocal
