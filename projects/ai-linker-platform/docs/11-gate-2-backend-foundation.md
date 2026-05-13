# 11. Gate 2 백엔드 기초 구현 결과

## 1. 구현 위치

```text
projects/ai-linker-platform/web
```

## 2. Gate 2 목표

Gate 2에서는 AI Linker 웹서비스와 관리자 백오피스가 실제 백엔드로 이어질 수 있도록 다음 기반을 만들었습니다.

```text
- Prisma ORM 세팅
- 로컬 개발용 SQLite DB 세팅
- AI Linker 핵심 데이터 모델 구현
- 개발용 seed 데이터 구현
- 관리자/API 기본 라우트 구현
- 설치코드 검증 API 기본 구현
- 최신 릴리즈 조회 API 기본 구현
- LLM 사용량/크레딧 차감 API 기본 구현
```

## 3. 설치/DB 명령어

```bash
npm run db:generate
npm run db:push
npm run db:seed
npm run db:studio
```

로컬 개발 DB:

```text
projects/ai-linker-platform/web/prisma/dev.db
```

환경 파일:

```text
projects/ai-linker-platform/web/.env.example
projects/ai-linker-platform/web/.env
```

주의:

```text
.env는 로컬 개발용입니다. 실제 운영 API Key, LLM Key, 결제 Secret은 절대 Git에 커밋하면 안 됩니다.
```

## 4. 구현된 Prisma 모델

```text
User
AdminUser
AgentProduct
AgentRelease
InstallerFile
Purchase
Payment
InstallCode
License
DeviceActivation
CreditWallet
CreditTransaction
UsageEvent
LLMProvider
LLMAccount
LLMModel
LLMRoutingPolicy
SkillProduct
SkillProductAgent
SkillRelease
CommunityPost
CommunityComment
SupportTicket
ChatMessage
AuditLog
```

## 5. 구현된 API 라우트

```text
GET  /api/admin/overview
GET  /api/admin/products
GET  /api/admin/releases
POST /api/install-codes/verify
GET  /api/releases/latest
POST /api/llm/usage
```

### 5.1 관리자 요약

```text
GET /api/admin/overview
```

반환 항목:

```text
- 사용자 수
- 상품 수
- 릴리즈 수
- 구매 수
- 결제 수
- 설치코드 수
- 라이선스 수
- 지갑 수
- LLM Provider 수
- 상담 티켓 수
- 최근 구매
- LLM 경고 계정
```

### 5.2 상품 목록

```text
GET /api/admin/products
```

상품, 최근 릴리즈, 구매/라이선스 카운트를 반환합니다.

### 5.3 릴리즈 목록

```text
GET /api/admin/releases
```

Agent 릴리즈와 설치파일 정보를 반환합니다.

### 5.4 설치코드 검증

```text
POST /api/install-codes/verify
Content-Type: application/json

{
  "code": "AIL-DEMO-0001"
}
```

반환 항목:

```text
- 설치코드 존재 여부
- 활성화 가능 여부
- 사용자 정보
- 상품 정보
- 라이선스 정보
```

### 5.5 최신 릴리즈 조회

```text
GET /api/releases/latest?productSlug=hermes-agent&platform=WINDOWS
```

구매자가 최신 설치파일을 다운로드하기 위한 릴리즈 정보를 반환합니다.

### 5.6 LLM 사용량 기록/차감

```text
POST /api/llm/usage
Content-Type: application/json

{
  "userId": "사용자ID",
  "requestId": "unique-request-id",
  "inputTokens": 1000,
  "outputTokens": 500,
  "costUsd": 0.01,
  "chargedUsd": 0.005
}
```

현재는 Gate 2 수준의 기본 사용량 기록/잔액 차감 API입니다. 실제 OpenAI-compatible Gateway 프록시는 Gate 7에서 구현합니다.

## 6. Seed 데이터

`npm run db:seed` 실행 시 생성되는 개발용 데이터:

```text
관리자: admin@ailinker.local
사용자: customer@example.com
Agent 상품: Hermes AI Agent
릴리즈: Hermes Windows 1.0.0
설치파일: AI-Linker-Hermes-Setup.exe
설치코드: AIL-DEMO-0001
초기 크레딧: $10
LLM Provider: OpenRouter
LLM Model: anthropic/claude-opus-4.6
Skill: Workflow Starter Pack
커뮤니티 게시글/댓글
상담 티켓/메시지
감사 로그
```

## 7. 품질 확인

아래 명령을 실행해 통과했습니다.

```bash
npm run db:generate
npm run db:push
npm run db:seed
npm run lint
npm run build
```

빌드 결과 API 라우트 포함 확인:

```text
/api/admin/overview
/api/admin/products
/api/admin/releases
/api/install-codes/verify
/api/llm/usage
/api/releases/latest
```

## 8. 기술적 결정

### 8.1 Prisma 버전

처음 설치된 Prisma 7.x는 datasource URL 설정 방식이 바뀌어 현재 스키마와 맞지 않았습니다. MVP 안정성을 위해 Prisma 6.19.0으로 고정했습니다.

```text
@prisma/client: 6.19.0
prisma: 6.19.0
```

### 8.2 DB

현재는 로컬 개발 속도를 위해 SQLite를 사용합니다.

운영 전환 시에는 PostgreSQL로 변경해야 합니다.

```text
개발: SQLite
운영 권장: PostgreSQL
```

## 9. 다음 Gate 후보

Gate 3 추천 범위:

```text
1. 관리자 화면을 실제 API 데이터와 연결
2. 상품/릴리즈/설치코드 관리자 CRUD 구현
3. 관리자 대시보드 통계 실데이터화
4. API 응답 타입 정리
5. Zod 기반 입력 검증 추가
6. 권한/Auth 적용 전 임시 관리자 보호 구조 설계
```
