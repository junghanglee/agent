# InStep Hermes Installer Build

## Build outputs

Current distributable files:

```text
projects/hermes-installer/dist/InStep-Hermes-Setup.exe
projects/hermes-installer/dist/InStep-Hermes-Installer.exe
```

Recommended file for normal users:

```text
InStep-Hermes-Setup.exe
```

The `dist/` directory is ignored by Git because it contains generated build output.

## Build commands

Build the final setup package:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "projects\hermes-installer\build\build-setup.ps1"
```

Build only the GUI installer executable:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "projects\hermes-installer\build\build-installer.ps1"
```

## Generated assets

- `assets/instep.ico` — Windows icon for InStep
- `assets/instep-logo.svg` — SVG source logo

## Launcher build

The current executable is a self-contained .NET Framework launcher. It embeds:

```text
scripts/install-hermes-mvp.ps1
```

At runtime it extracts the script to:

```text
%LOCALAPPDATA%\InStep\HermesInstaller\install-hermes-mvp.ps1
```

Then it runs:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File <extracted-script>
```

## Inno Setup packaging

The final setup package is built with Inno Setup.

Install Inno Setup if needed:

```powershell
winget install --id JRSoftware.InnoSetup -e --accept-package-agreements --accept-source-agreements
```

Then run:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "projects\hermes-installer\build\build-setup.ps1"
```

Expected output:

```text
projects/hermes-installer/dist/InStep-Hermes-Setup.exe
```

The setup package installs per-user under:

```text
%LOCALAPPDATA%\Programs\InStep\Hermes Installer
```

This avoids requiring administrator privileges on normal Windows PCs.
