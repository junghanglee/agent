# 제품 기획서: AI Linker Hermes 통합 설치 인스톨러 MVP

AI Linker는 비개발자가 Windows PC에서 AI Agent를 원스탑으로 설치할 수 있게 돕는 통합 설치 서비스입니다. 첫 MVP는 Hermes AI Agent를 대상으로 합니다.

## MVP 범위

- Hermes AI Agent 공식 설치 흐름을 감싸는 초보자용 Windows 설치 마법사 제공
- Hermes 자체 소스 수정 없이 공식 설치기를 사용
- 기본 LLM 설정 자동 적용
- 기본 도구/스킬 확인 및 진단 실행
- 사용자 API 키, 메신저 토큰, OAuth 비밀값은 설치파일에 포함하지 않음

## 사용자 흐름

1. AI Linker Hermes Setup 실행
2. GUI 마법사에서 설치 단계 확인
3. Hermes 설치 및 기본 설정 자동 진행
4. 진단 결과와 로그 확인
5. 추후 API 키/메신저 연결은 별도 설정

## 배포 파일

```text
AI-Linker-Hermes-Setup.exe
```

## 내부 GUI 실행파일

```text
AI-Linker-Hermes-Installer.exe
```

## 디자인 방향

- Inno Setup은 안정적인 기본 설치 UI만 담당
- AI Linker GUI 런처가 브랜드 경험과 단계 안내를 담당
- 좌측 단계 영역은 카드형 디자인으로 겹침을 방지
- 본문 텍스트는 짧고 명확하게 유지
