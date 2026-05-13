# Hermes 통합 설치 인스톨러 로드맵

## Phase 0: 조사 및 설계

상태: 진행 중

- Hermes 원본 저장소 확인
- Windows 공식 설치 방식 확인
- MVP 범위 정의
- 설치 흐름 문서화

## Phase 1: PowerShell MVP

목표:

- 초보자용 통합 설치 스크립트 제작
- 더블클릭 실행 배치 파일 제작
- 설치 로그 저장
- 설치 후 진단 실행

산출물:

- `scripts/install-hermes-mvp.ps1`
- `installer/Run-Hermes-Installer.bat`

## Phase 2: 테스트

목표:

- 실제 Windows 환경에서 실행
- 설치 성공/실패 케이스 기록
- 로그 기반 오류 대응표 작성

테스트 항목:

- Git 미설치 PC
- Node 미설치 PC
- Python 미설치 PC
- PowerShell 실행 정책 제한 PC
- 인터넷 불안정 환경
- 이미 Hermes가 설치된 PC

## Phase 3: 초보자 UX 개선

목표:

- 안내 문구 개선
- 오류 메시지 한국어 번역
- 재시도 기능 추가
- 설치 완료 후 다음 행동 안내

## Phase 4: GUI 인스톨러

후보 기술:

- Tauri
- Electron
- .NET/WPF
- NSIS 또는 Inno Setup

추천:

처음에는 PowerShell + BAT로 검증하고, 성공 흐름이 안정화되면 Tauri 또는 Inno Setup으로 감싸는 방식이 좋습니다.

## Phase 5: LLM Gateway 연동

목표:

- 사장님 플랫폼 계정 로그인
- 사용자별 LLM 토큰 확인
- OpenAI-compatible endpoint 자동 설정
- Hermes 설정 자동 주입

## Phase 6: 메신저/Skill 확장

목표:

- Telegram 연결 가이드
- Discord 연결 가이드
- 추천 Skill 목록
- 직무별 Skill 프리셋

## Phase 7: 다른 Agent 추가

후보:

- OpenClaw
- Codex CLI
- Claude Code류
- 로컬 LLM Agent
- 업무 자동화 Agent

각 Agent마다 동일한 패턴으로 확장합니다.

1. 공식 설치 방식 확인
2. 초보자용 wrapper 제작
3. LLM 연결 방식 정리
4. 진단 명령 확인
5. 로그/오류 대응표 작성
