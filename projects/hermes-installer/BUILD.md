# InStep Hermes Installer Build

## Build output

Current distributable executable:

```text
projects/hermes-installer/dist/InStep-Hermes-Installer.exe
```

The `dist/` directory is ignored by Git because it contains generated build output.

## Build command

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

Inno Setup is not required for the current single-file launcher build.

For a wizard-style setup package later, compile:

```text
packaging/InStepHermesInstaller.iss
```

Expected output:

```text
projects/hermes-installer/dist/InStep-Hermes-Setup.exe
```
