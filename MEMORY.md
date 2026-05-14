# Long-Term Memory

## Repository

- Current canonical GitHub repository is `junghanglee/agent` (`https://github.com/junghanglee/agent.git`). Apply project work/pushes there. Earlier references to `choigangcheolmin-sudo/projectA` are outdated and should not be used as the target repository.


## Promoted From Short-Term Memory (2026-05-14)

<!-- openclaw-memory-promotion:memory:memory/2026-05-13.md:12:28 -->
- - Installer script internals should stay English/ASCII where practical for Windows encoding stability; docs may remain Korean. - Default unattended config applied by installer includes: `model.provider=auto`, `model.base_url=https://openrouter.ai/api/v1`, `model.default=anthropic/claude-opus-4.6`, `terminal.backend=local`, `terminal.working_dir=.`. - Installer runs `hermes config migrate`, `hermes config check`, `hermes skills list`, and `hermes doctor` automatically. - Success exits with `exit 0` and no pause/key prompt; failure exits with `exit 1`. - Logs are saved under Desktop `Hermes-Installer-Logs`. - If `hermes` is not on PATH immediately after install, verification should fallback to `C:\Users\Admin\AppData\Local\hermes\hermes-agent\venv\Scripts\hermes.exe`. - API keys, messenger tokens, OAuth logins, and paid LLM account credentials cannot be invented by installer; they remain optional later setup. Preferred future direction: do not bundle API keys; use platform account login/token issuance later. ## Build/package state - A one-stop installer script and docs were implemented and committed earlier: - `215b19d Add Hermes installer MVP plan and scripts` - `c751e03 Avoid Hermes setup wizard blocking installer` - `98a503e Make Hermes installer unattended by default` - Windows GUI launcher and Inno Setup packaging were created. Important source paths: - `projects/hermes-installer/scripts/install-hermes-mvp.ps1` - `projects/hermes-installer/installer/Run-Hermes-Installer.bat` - `projects/hermes-installer/build/InStepInstallerLauncher.cs` [score=0.833 recalls=4 avg=0.973 source=memory/2026-05-13.md:12-28]
