#define AppName "AI Linker Hermes Installer"
#define AppVersion "0.2.1"
#define AppPublisher "AI Linker"
#define AppExeName "AI-Linker-Hermes-Installer.exe"

[Setup]
AppId={{8F9C0E01-3BE9-4D24-8E95-AILINKER000001}
AppName={#AppName}
AppVersion={#AppVersion}
AppPublisher={#AppPublisher}
DefaultDirName={localappdata}\Programs\AI Linker\Hermes Installer
DefaultGroupName=AI Linker
DisableProgramGroupPage=yes
OutputDir=..\dist
OutputBaseFilename=AI-Linker-Hermes-Setup
Compression=lzma
SolidCompression=yes
WizardStyle=modern
SetupIconFile=..\assets\ai-linker.ico
UninstallDisplayIcon={app}\ai-linker.ico
PrivilegesRequired=lowest
ArchitecturesAllowed=x64compatible
ArchitecturesInstallIn64BitMode=x64compatible
SetupLogging=yes
DisableWelcomePage=no
DisableFinishedPage=no

[Languages]
Name: "english"; MessagesFile: "compiler:Default.isl"

[Messages]
WelcomeLabel1=AI Linker Hermes AI Agent Setup Wizard
WelcomeLabel2=This setup prepares the AI Linker Hermes installer on this PC.%n%nAfter setup, the launcher guides Hermes Agent creation, LLM defaults, and messenger readiness.

[Files]
Source: "..\dist\AI-Linker-Hermes-Installer.exe"; DestDir: "{app}"; Flags: ignoreversion
Source: "..\assets\ai-linker.ico"; DestDir: "{app}"; Flags: ignoreversion
Source: "..\assets\ai-linker-logo.svg"; DestDir: "{app}"; Flags: ignoreversion
Source: "..\assets\hermes\hermes-banner.png"; DestDir: "{app}\assets"; Flags: ignoreversion

[Icons]
Name: "{group}\AI Linker Hermes Installer"; Filename: "{app}\{#AppExeName}"; IconFilename: "{app}\ai-linker.ico"
Name: "{userdesktop}\AI Linker Hermes Installer"; Filename: "{app}\{#AppExeName}"; IconFilename: "{app}\ai-linker.ico"; Tasks: desktopicon

[Tasks]
Name: "desktopicon"; Description: "Create a desktop shortcut"; GroupDescription: "Additional options:"; Flags: checkedonce

[Run]
Filename: "{app}\{#AppExeName}"; Description: "Launch AI Linker Hermes Installer"; Flags: postinstall skipifsilent nowait
