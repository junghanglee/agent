# 19. Gate 6/7 운영 화면 실데이터 연결

## 작업 일시

- 2026-05-14

## 목표

관리자 백오피스의 운영 화면 중 목업 배열로 표시되던 결제, 토큰/크레딧, LLM Pool, 사용량 모니터링 화면을 실제 Prisma 데이터 조회 기반으로 전환한다.

## 완료 범위

### 1. 결제관리 `/admin/payments`

- 클라이언트 목업 배열 제거
- 서버 컴포넌트로 전환
- `requireAdminPagePermission('PAYMENTS_READ')` 적용
- `Payment`, `Purchase`, `User`, `AgentProduct` 관계 조회
- 결제 상태, Provider, 검색어 필터 지원
- 이번 달 결제 금액/건수, 환불 금액/건수, 실패 건수 집계
- 빈 데이터 상태 표시

### 2. 토큰/크레딧 `/admin/tokens`

- 클라이언트 목업 배열/모달 중심 구조 제거
- 서버 컴포넌트로 전환
- `requireAdminPagePermission('TOKENS_READ')` 적용
- `CreditWallet`, `CreditTransaction`, `User`, `Payment` 실제 조회
- 지갑 잔액, 최근 변동, 상태 표시
- 충전/지급/차감 내역 표시
- 총 잔액, 이번 달 충전/지급, 잔액 부족, 지갑 미생성 고객 집계
- 수동 지급/차감 액션은 다음 단계에서 AuditLog와 함께 연결하도록 안내 문구 처리

### 3. LLM 계정 Pool `/admin/llm-pool`

- 목업 Provider/계정/차트 데이터 제거
- 서버 컴포넌트로 전환
- `requireAdminPagePermission('LLM_POOL_READ')` 적용
- `LLMProvider`, `LLMAccount`, `LLMModel`, `UsageEvent` 실제 조회
- 계정 수, 오늘/이번 달 원가, 이상 상태 집계
- 오늘 모델별 비용 TOP 10 표시
- 오늘 Provider 라우팅 비중 표시
- Provider별 계정 상태 및 모델 원가/판매 단가 표시
- API Key 추가/수정은 암호화 저장 API 단계에서 연결하도록 안내 문구 처리

### 4. 사용량 모니터링 `/admin/monitoring`

- 목업 Recharts 데이터 제거
- 서버 컴포넌트로 전환
- `requireAdminPagePermission('MONITORING_READ')` 적용
- `UsageEvent`, `Payment`, `LLMProvider`, `AgentProduct` 실제 조회
- 오늘 분당 요청/토큰, 평균 토큰, 활성 고객, 활성 Provider, 결제 실패 집계
- 오늘 시간대별 요청/토큰 표시
- 최근 7일 비용/요청 표시
- Agent별 오늘 사용량 표시
- 오늘 요청/토큰/원가/고객 청구 합계 표시

## 검증

아래 검증을 통과했다.

```bash
npx tsc --noEmit
npm run lint
npm run build
```

## 추가 완료: 크레딧 수동 지급/차감

- `TOKENS_MANAGE` 권한 추가
- `SUPER_ADMIN`에게만 크레딧 수동 지급/차감 허용
- 일반 `ADMIN`은 토큰/크레딧 조회만 가능
- `/admin/tokens` 상단 및 지갑 행별 지급/차감 버튼 연결
- 지갑이 없는 활성 고객은 지급 시 자동 지갑 생성
- 차감 후 잔액이 음수가 되는 요청 차단
- `CreditTransaction(type=MANUAL_ADJUSTMENT)` 기록
- `AuditLog`에 `CREDIT_MANUAL_GRANT` / `CREDIT_MANUAL_DEDUCT` 기록

## 추가 완료: LLM Provider/API Key 관리

- `LLM_POOL_MANAGE` 권한 추가
- `SUPER_ADMIN`에게만 LLM Provider/계정 생성·수정·비활성화 허용
- 일반 `ADMIN`은 LLM Pool 조회만 가능
- Provider 관리 API 추가
  - `GET /api/admin/llm-providers`
  - `POST /api/admin/llm-providers`
  - `PATCH /api/admin/llm-providers/[id]`
  - `DELETE /api/admin/llm-providers/[id]` → soft disable
- LLM 계정 관리 API 추가
  - `GET /api/admin/llm-accounts`
  - `POST /api/admin/llm-accounts`
  - `PATCH /api/admin/llm-accounts/[id]`
  - `DELETE /api/admin/llm-accounts/[id]` → soft disable
- API Key 암호화 저장 유틸 추가
  - AES-256-GCM 기반 `encryptLLMSecret`
  - production에서는 32자 이상 `AI_LINKER_ENCRYPTION_KEY` 필수
  - 조회/API 응답/AuditLog에는 API Key 평문 미노출, 마스킹 처리
- `/admin/llm-pool` 화면에 Provider 추가/수정/비활성화 버튼 연결
- `/admin/llm-pool` 화면에 계정 추가/수정/비활성화 버튼 연결
- 모든 생성/수정/비활성화 작업 AuditLog 기록

## 남은 작업

- 결제 Provider 실제 웹훅/승인 API 연결
- 운영 차트 UX를 필요 시 클라이언트 차트 컴포넌트로 재도입
- 실제 운영 데이터가 없는 초기 상태용 seed 데이터 보강
