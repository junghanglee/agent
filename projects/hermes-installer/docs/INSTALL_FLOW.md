# Hermes 통합 설치 흐름

## 전체 흐름

1. 사용자가 `Run-Hermes-Installer.bat` 더블클릭
2. PowerShell 창 실행
3. 설치 시작 안내 표시
4. 인터넷 연결 확인
5. Hermes 공식 설치 스크립트 실행
6. Hermes 명령어 설치 여부 확인
7. `hermes doctor` 진단 실행
8. LLM 연결 안내
9. 선택적으로 메신저/Skill 설정 안내
10. 로그 파일 위치 안내

## 상세 흐름

### 1. 시작

사용자에게 다음을 안내합니다.

- 설치에는 인터넷이 필요함
- 설치 중 창을 닫으면 안 됨
- 일부 단계는 시간이 오래 걸릴 수 있음
- 문제가 생기면 로그 파일을 보내면 됨

### 2. 사전 확인

확인 항목:

- Windows 환경 여부
- PowerShell 사용 가능 여부
- 인터넷 연결 여부
- GitHub 접속 가능 여부

### 3. Hermes 설치

공식 설치 명령을 실행합니다.

```powershell
irm https://raw.githubusercontent.com/NousResearch/hermes-agent/main/scripts/install.ps1 | iex
```

Hermes 공식 설치기가 처리하는 항목:

- uv 설치
- Python 3.11 준비
- Node.js 준비
- Git/Git Bash 준비
- Hermes Agent 설치

### 4. 설치 확인

확인 명령:

```powershell
hermes --version
hermes doctor
```

단, Windows PATH 반영이 늦을 수 있으므로 다음 위치도 확인합니다.

- `%LOCALAPPDATA%\hermes`
- `%LOCALAPPDATA%\hermes\hermes-agent`

### 5. LLM 연결

사용자에게 다음 선택지를 제공합니다.

- 직접 API 키 입력
- 사용자의 자체 LLM 토큰 계정 연결
- 나중에 설정

초기 MVP에서는 Hermes 기본 명령을 호출합니다.

```powershell
hermes model
```

### 6. 메신저 연결

선택 기능으로 제공합니다.

```powershell
hermes gateway setup
```

주의:

- Telegram, Discord, Slack 등은 각 플랫폼의 봇 토큰이 필요할 수 있음
- 초보자에게는 별도 가이드가 필요함

### 7. Skill 설치

MVP에서는 자동 설치보다 안내 중심으로 시작합니다.

```powershell
hermes skills
```

향후에는 추천 Skill 목록을 제공하고 선택 설치 기능을 추가합니다.

### 8. 오류 처리

모든 출력은 로그 파일로 저장합니다.

예상 로그 위치:

```text
%USERPROFILE%\Desktop\Hermes-Installer-Logs\
```

사용자가 오류를 설명하지 못해도 로그 파일만 전달하면 진단할 수 있도록 합니다.
