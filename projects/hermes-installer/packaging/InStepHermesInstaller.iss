#define AppName "InStep Hermes Installer"
#define AppVersion "0.2.1"
#define AppPublisher "InStep"
#define AppExeName "InStep-Hermes-Installer.exe"

[Setup]
AppId={{8F9C0E01-3BE9-4D24-8E95-INSTEP000001}
AppName={#AppName}
AppVersion={#AppVersion}
AppPublisher={#AppPublisher}
DefaultDirName={localappdata}\Programs\InStep\Hermes Installer
DefaultGroupName=InStep
DisableProgramGroupPage=yes
OutputDir=..\dist
OutputBaseFilename=InStep-Hermes-Setup
Compression=lzma
SolidCompression=yes
WizardStyle=modern
SetupIconFile=..\assets\instep.ico
UninstallDisplayIcon={app}\instep.ico
PrivilegesRequired=lowest
ArchitecturesAllowed=x64compatible
ArchitecturesInstallIn64BitMode=x64compatible
SetupLogging=yes
DisableWelcomePage=no
DisableFinishedPage=no

[Languages]
Name: "korean"; MessagesFile: "compiler:Languages\Korean.isl"
Name: "english"; MessagesFile: "compiler:Default.isl"

[Messages]
korean.WelcomeLabel1=InStep Hermes AI Agent 설치 마법사
korean.WelcomeLabel2=이 설치 프로그램은 InStep Hermes 설치 마법사를 사용자 PC에 준비합니다.%n%n설치 후 Hermes AI Agent 생성, LLM 기본 연결, 메신저 연결 준비 단계가 별도 마법사에서 진행됩니다.
english.WelcomeLabel1=InStep Hermes AI Agent Setup Wizard
english.WelcomeLabel2=This setup prepares the InStep Hermes installer on this PC.%n%nAfter setup, the installer will guide Agent creation, LLM defaults, and messenger readiness.

[Files]
Source: "..\dist\InStep-Hermes-Installer.exe"; DestDir: "{app}"; Flags: ignoreversion
Source: "..\assets\instep.ico"; DestDir: "{app}"; Flags: ignoreversion
Source: "..\assets\instep-logo.svg"; DestDir: "{app}"; Flags: ignoreversion
Source: "..\assets\hermes\hermes-banner.png"; DestDir: "{app}\assets"; Flags: ignoreversion

[Icons]
Name: "{group}\InStep Hermes Installer"; Filename: "{app}\{#AppExeName}"; IconFilename: "{app}\instep.ico"
Name: "{userdesktop}\InStep Hermes Installer"; Filename: "{app}\{#AppExeName}"; IconFilename: "{app}\instep.ico"; Tasks: desktopicon

[Tasks]
Name: "desktopicon"; Description: "바탕화면 바로가기 만들기"; GroupDescription: "추가 옵션:"; Flags: checkedonce; Languages: korean
Name: "desktopicon"; Description: "Create a desktop shortcut"; GroupDescription: "Additional options:"; Flags: checkedonce; Languages: english

[Run]
Filename: "{app}\{#AppExeName}"; Description: "InStep Hermes 설치 마법사 실행"; Flags: postinstall skipifsilent nowait; Languages: korean
Filename: "{app}\{#AppExeName}"; Description: "Launch InStep Hermes Installer"; Flags: postinstall skipifsilent nowait; Languages: english
