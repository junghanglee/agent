# InStep Hermes 통합 설치 인스톨러 MVP

InStep은 비개발자도 Windows PC에서 AI Agent를 사용자 입력 없이 원스탑으로 기본 설치할 수 있도록 돕는 통합 설치 서비스입니다. 현재 MVP는 Hermes Agent 설치를 대상으로 합니다.

## MVP 목표

1. Hermes Agent 무인 설치
2. 안전한 기본 설정 자동 적용
3. 설치 후 진단 자동 실행
4. 기본 Skill 상태 자동 확인
5. 오류 로그 저장
6. 초보자용 한국어 안내 제공
7. API 키/메신저 토큰처럼 반드시 사용자 계정 정보가 필요한 항목만 선택 설정으로 분리

## 첫 버전 전략

Hermes 자체를 임의로 수정하지 않고, 공식 설치 스크립트를 안전하게 호출합니다.

공식 원본:
- https://github.com/NousResearch/hermes-agent
- Windows 공식 설치 방식: `irm https://raw.githubusercontent.com/NousResearch/hermes-agent/main/scripts/install.ps1 | iex`

## MVP 산출물

- `dist/InStep-Hermes-Installer.exe`
  - 배포용 단일 실행파일
- `assets/instep.ico`
  - InStep 실행파일 아이콘
- `assets/instep-logo.svg`
  - InStep 로고 원본
- `build/build-installer.ps1`
  - 배포용 실행파일 빌드 스크립트
- `build/InStepInstallerLauncher.cs`
  - PowerShell 설치 스크립트를 내장한 Windows 실행파일 런처
- `packaging/InStepHermesInstaller.iss`
  - Inno Setup용 정식 설치 마법사 패키징 스크립트
- `scripts/install-hermes-mvp.ps1`
  - 무인 설치 PowerShell 스크립트
- `installer/Run-Hermes-Installer.bat`
  - 더블클릭 실행용 Windows 배치 파일
- `docs/PRODUCT_SPEC.md`
  - 제품 기획서
- `docs/INSTALL_FLOW.md`
  - 설치 흐름
- `docs/LLM_CONNECTION_PLAN.md`
  - LLM 연결 구조
- `docs/ROADMAP.md`
  - 향후 개발 순서

## 현재 MVP 범위

포함:
- Windows 설치 지원
- Hermes 공식 설치기 실행
- 공식 설치기는 `-SkipSetup`으로 실행해 대화형 설정 마법사에서 멈추지 않게 처리
- 설치 후 현재 세션 PATH/HERMES_HOME 자동 반영
- Hermes 설치 확인
- `hermes --version` 자동 검증
- `hermes config migrate` 자동 실행
- 안전한 기본값 자동 적용
  - `model.provider=auto`
  - `model.base_url=https://openrouter.ai/api/v1`
  - `model.default=anthropic/claude-opus-4.6`
  - `terminal.backend=local`
  - `terminal.working_dir=.`
- `hermes config check` 자동 실행
- `hermes skills list` 자동 확인
- `hermes doctor` 자동 진단 실행
- 로그 저장
- 성공/실패에 따라 종료 코드 반환
- 성공 시 키 입력 없이 자동 종료

제외:
- 자체 결제 시스템
- 자체 LLM 토큰 발급 서버
- API 키/메신저 토큰/OAuth 로그인 자동 대체
- 완성형 GUI
- macOS/Linux 설치 파일
- 모든 Agent 일괄 지원

## 왜 이렇게 시작하는가

초기에는 설치 성공률과 오류 대응이 가장 중요합니다. Hermes 공식 설치기를 그대로 활용하면 유지보수 리스크를 줄이고, 우리는 초보자 UX와 연결/진단 흐름에 집중할 수 있습니다.
