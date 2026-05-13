#define AppName "InStep Hermes Installer"
#define AppVersion "0.2.0"
#define AppPublisher "InStep"
#define AppExeName "InStep-Hermes-Installer.exe"

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
WizardImageFile=..\assets\wizard\welcome.bmp
WizardSmallImageFile=..\assets\wizard\small.bmp
UninstallDisplayIcon={app}\instep.ico
PrivilegesRequired=lowest
SetupLogging=yes

[Languages]
Name: "korean"; MessagesFile: "compiler:Languages\Korean.isl"

[Files]
Source: "..\dist\InStep-Hermes-Installer.exe"; DestDir: "{app}"; Flags: ignoreversion
Source: "..\assets\instep.ico"; DestDir: "{app}"; Flags: ignoreversion
Source: "..\assets\instep-logo.svg"; DestDir: "{app}"; Flags: ignoreversion
Source: "..\assets\hermes\hermes-banner.png"; DestDir: "{app}\assets"; Flags: ignoreversion

[Icons]
Name: "{group}\InStep Hermes Installer"; Filename: "{app}\{#AppExeName}"; IconFilename: "{app}\instep.ico"
Name: "{userdesktop}\InStep Hermes Installer"; Filename: "{app}\{#AppExeName}"; IconFilename: "{app}\instep.ico"; Tasks: desktopicon

[Tasks]
Name: "desktopicon"; Description: "바탕화면 바로가기 만들기"; GroupDescription: "추가 옵션:"; Flags: checkedonce

[Run]
Filename: "{app}\{#AppExeName}"; Description: "InStep Hermes 설치 마법사 실행"; Flags: postinstall skipifsilent nowait

[Code]
var
  StepPage: TWizardPage;
  StepMemo: TMemo;

procedure InitializeWizard;
begin
  WizardForm.Caption := 'InStep - Hermes AI Agent 설치 마법사';
  WizardForm.WelcomeLabel1.Caption := 'InStep Hermes AI Agent 설치 마법사';
  WizardForm.WelcomeLabel2.Caption :=
    'Hermes AI Agent를 생성하고, LLM 두뇌 연결과 메신저 연결 준비까지 안내합니다.';

  StepPage := CreateCustomPage(wpWelcome, '설치 여정', 'InStep이 Hermes AI Agent를 설치하는 3단계 흐름입니다.');
  StepMemo := TMemo.Create(StepPage);
  StepMemo.Parent := StepPage.Surface;
  StepMemo.Left := 0;
  StepMemo.Top := 0;
  StepMemo.Width := StepPage.SurfaceWidth;
  StepMemo.Height := StepPage.SurfaceHeight;
  StepMemo.ReadOnly := True;
  StepMemo.BorderStyle := bsNone;
  StepMemo.Color := WizardForm.Color;
  StepMemo.Font.Size := 10;
  StepMemo.Text :=
    '1단계. Hermes AI Agent 생성하기'#13#10 +
    '   필수 구성요소를 확인하고 Hermes 본체를 설치합니다.'#13#10#13#10 +
    '2단계. Hermes에 두뇌 이식하기 (LLM 연결)'#13#10 +
    '   기본 LLM 연결 설정을 적용합니다. API 키는 설치파일에 포함하지 않습니다.'#13#10#13#10 +
    '3단계. 메신저 연결 준비하기'#13#10 +
    '   Telegram, Discord 등 메신저 연결을 위한 Hermes Gateway와 Skills 상태를 점검합니다.'#13#10#13#10 +
    '설치 완료 후 진단 로그는 Desktop\Hermes-Installer-Logs에 저장됩니다.';
end;
