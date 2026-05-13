# LLM 연결 구조 계획

## 전제

사장님은 자체 보유 LLM 계정을 토큰 단위로 판매하거나 제공하는 구조를 원합니다.

즉, 최종 제품은 단순히 사용자가 OpenAI/OpenRouter API 키를 직접 넣는 방식이 아니라, 플랫폼이 제공하는 LLM 사용권 또는 토큰을 Hermes에 연결하는 흐름을 가져야 합니다.

## MVP 단계

초기 MVP에서는 자체 결제/토큰 서버를 만들지 않습니다.

대신 다음 방식으로 시작합니다.

1. Hermes 설치
2. `hermes model` 실행
3. 사용자가 지원 제공자 중 하나를 연결
4. 설치/연결 오류 데이터를 모음
5. 이후 자체 LLM 토큰 시스템 설계

## 향후 목표 구조

```text
사용자
  ↓
설치 프로그램
  ↓
사장님 플랫폼 계정 로그인
  ↓
LLM 토큰 잔액 확인
  ↓
Hermes 설정에 OpenAI-compatible endpoint/API key 주입
  ↓
Hermes 실행
```

## 권장 방식

Hermes가 다양한 provider/custom endpoint를 지원하므로, 사장님 플랫폼은 OpenAI-compatible API Gateway를 제공하는 방식이 좋습니다.

예시:

- Base URL: `https://api.example.com/v1`
- API Key: 사용자별 발급 토큰
- Model: `gpt-5.5`, `claude`, `qwen`, `deepseek` 등 내부 라우팅

Hermes 입장에서는 일반 OpenAI 호환 API처럼 보이게 합니다.

## 장점

- Hermes 자체 수정 최소화
- 다른 Agent에도 동일한 LLM Gateway 재사용 가능
- 사용자별 과금/토큰 차감 가능
- 모델 교체를 서버 쪽에서 처리 가능

## 주의사항

- 사용자 API 키를 설치 프로그램 서버로 수집하면 안 됨
- 자체 토큰 키도 PC 저장 시 암호화/권한 관리 필요
- 로그에 API 키가 찍히지 않게 해야 함
- LLM Gateway 장애 시 Hermes 오류 메시지를 쉽게 번역해야 함

## 나중에 필요한 서버 기능

- 사용자 로그인
- 토큰 구매/차감
- API key 발급/폐기
- 사용량 조회
- 모델 라우팅
- 장애/과금 로그
- 악용 방지 rate limit

## MVP에서는 보류할 것

- 결제
- 회원가입
- 자체 Gateway
- 토큰 차감
- 키 자동 주입

먼저 Hermes 설치 성공률을 검증한 뒤, LLM Gateway를 붙이는 것이 안전합니다.
