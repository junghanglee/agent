#define AppName "InStep Hermes Installer"
#define AppVersion "0.1.0"
#define AppPublisher "InStep"
#define AppExeName "Run-Hermes-Installer.bat"

[Setup]
AppId={{8F9C0E01-3BE9-4D24-8E95-INSTEP000001}
AppName={#AppName}
AppVersion={#AppVersion}
AppPublisher={#AppPublisher}
DefaultDirName={autopf}\InStep\Hermes Installer
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

[Files]
Source: "..\installer\Run-Hermes-Installer.bat"; DestDir: "{app}"; Flags: ignoreversion
Source: "..\scripts\install-hermes-mvp.ps1"; DestDir: "{app}\scripts"; Flags: ignoreversion
Source: "..\assets\instep.ico"; DestDir: "{app}"; Flags: ignoreversion
Source: "..\assets\instep-logo.svg"; DestDir: "{app}"; Flags: ignoreversion

[Icons]
Name: "{group}\InStep Hermes Installer"; Filename: "{app}\Run-Hermes-Installer.bat"; IconFilename: "{app}\instep.ico"
Name: "{userdesktop}\InStep Hermes Installer"; Filename: "{app}\Run-Hermes-Installer.bat"; IconFilename: "{app}\instep.ico"; Tasks: desktopicon

[Tasks]
Name: "desktopicon"; Description: "Create a desktop shortcut"; GroupDescription: "Additional shortcuts:"; Flags: checkedonce

[Run]
Filename: "{app}\Run-Hermes-Installer.bat"; Description: "Run InStep Hermes Installer now"; Flags: postinstall skipifsilent nowait
