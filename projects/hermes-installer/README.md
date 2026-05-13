# AI Linker Hermes 통합 설치 인스톨러 MVP

AI Linker는 비개발자도 Windows PC에서 AI Agent를 쉽게 설치할 수 있도록 돕는 통합 설치 서비스입니다. 현재 MVP는 Hermes AI Agent 설치를 대상으로 합니다.

## 목표

- Hermes AI Agent를 Windows에서 원스탑으로 설치
- 공식 Hermes 설치 스크립트를 안전하게 감싸는 GUI 설치 마법사 제공
- 기본 LLM 설정과 진단 명령을 자동 실행
- API 키, 메신저 토큰, OAuth 로그인 같은 비밀값은 설치파일에 포함하지 않음

## 주요 파일

- `scripts/install-hermes-mvp.ps1`
  - Hermes 공식 설치기 실행, 기본 설정 적용, 진단 실행
- `build/AILinkerInstallerLauncher.cs`
  - AI Linker GUI 설치 마법사 소스
- `build/build-installer.ps1`
  - 단일 GUI 실행파일 빌드
- `build/build-setup.ps1`
  - Inno Setup 기반 설치 패키지 빌드
- `packaging/AILinkerHermesInstaller.iss`
  - Inno Setup 패키징 설정
- `assets/ai-linker.ico`
  - AI Linker 실행파일 아이콘
- `assets/ai-linker-logo.svg`
  - AI Linker 로고 원본
- `assets/hermes/hermes-banner.png`
  - Hermes 공식 배너 이미지

## 빌드

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "projects\hermes-installer\build\build-setup.ps1"
```

## 출력물

```text
projects/hermes-installer/dist/AI-Linker-Hermes-Installer.exe
projects/hermes-installer/dist/AI-Linker-Hermes-Setup.exe
```

`dist/` 폴더의 생성 파일은 Git에 포함하지 않습니다.
