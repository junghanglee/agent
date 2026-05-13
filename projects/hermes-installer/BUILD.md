# AI Linker Hermes Installer Build

## Build command

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "projects\hermes-installer\build\build-setup.ps1"
```

## Outputs

```text
projects/hermes-installer/dist/AI-Linker-Hermes-Setup.exe
projects/hermes-installer/dist/AI-Linker-Hermes-Installer.exe
```

## Package behavior

- Installs per-user, not machine-wide.
- Default install path:

```text
%LOCALAPPDATA%\Programs\AI Linker\Hermes Installer
```

- Runtime extraction path used by the GUI launcher:

```text
%LOCALAPPDATA%\AI Linker\HermesInstaller\install-hermes-mvp.ps1
```

## Assets

- `assets/ai-linker.ico` — Windows icon for AI Linker
- `assets/ai-linker-logo.svg` — SVG source logo
- `assets/hermes/hermes-banner.png` — Hermes banner used in the wizard

## Notes

- The GUI launcher owns the richer wizard UX.
- Inno Setup is intentionally kept simple and stable.
- Internal install script text stays mostly ASCII/English to reduce Windows encoding problems.
- User secrets such as API keys and messenger tokens are not bundled.
