# Hermes 통합 설치 인스톨러 MVP

비개발자도 Windows PC에서 Hermes Agent를 설치하고, LLM 연결과 기본 편의 기능 설정까지 진행할 수 있도록 돕는 설치형 프로그램 프로젝트입니다.

## MVP 목표

1. Hermes Agent 설치
2. LLM 제공자 연결 안내
3. 설치 후 진단 실행
4. 메신저 연결 선택 진입점 제공
5. Skill 설치 선택 진입점 제공
6. 오류 로그 저장
7. 초보자용 한국어 안내 제공

## 첫 버전 전략

Hermes 자체를 임의로 수정하지 않고, 공식 설치 스크립트를 안전하게 호출합니다.

공식 원본:
- https://github.com/NousResearch/hermes-agent
- Windows 공식 설치 방식: `irm https://raw.githubusercontent.com/NousResearch/hermes-agent/main/scripts/install.ps1 | iex`

## MVP 산출물

- `scripts/install-hermes-mvp.ps1`
  - 초보자용 통합 설치 PowerShell 스크립트
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
- Hermes 설치 확인
- `hermes --version` 검증 안내
- `hermes setup --quick` 후속 설정 안내
- `hermes model` 실행 안내
- `hermes doctor` 진단 실행
- `hermes gateway setup` 선택 실행
- 로그 저장

제외:
- 자체 결제 시스템
- 자체 LLM 토큰 발급 서버
- 완성형 GUI
- macOS/Linux 설치 파일
- 모든 Agent 일괄 지원

## 왜 이렇게 시작하는가

초기에는 설치 성공률과 오류 대응이 가장 중요합니다. Hermes 공식 설치기를 그대로 활용하면 유지보수 리스크를 줄이고, 우리는 초보자 UX와 연결/진단 흐름에 집중할 수 있습니다.
