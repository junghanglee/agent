# 09. 관리자/백엔드 디자인 레퍼런스

## 1. 받은 디자인 파일

사용자가 전달한 백엔드/관리자 디자인 ZIP을 아래 위치에 보관했습니다.

```text
projects/ai-linker-platform/design-reference/admin-dashboard-design.zip
projects/ai-linker-platform/design-reference/admin-dashboard-design/
```

## 2. 디자인 파일 성격

압축 해제 결과, 백엔드 서버 코드가 아니라 Next.js 기반 슈퍼관리자 대시보드 UI 코드 형태의 디자인 레퍼런스입니다. 실제 백엔드 개발 시에는 이 관리자 UI를 기준으로 API, DB, 인증, 권한, 운영 기능을 연결합니다.

주요 구조:

```text
app/admin/
components/admin/
components/ui/
package.json
pnpm-lock.yaml
```

주요 관리자 페이지:

```text
app/admin/page.tsx
app/admin/customers/page.tsx
app/admin/products/page.tsx
app/admin/releases/page.tsx
app/admin/licenses/page.tsx
app/admin/payments/page.tsx
app/admin/tokens/page.tsx
app/admin/llm-pool/page.tsx
app/admin/monitoring/page.tsx
app/admin/skills/page.tsx
app/admin/support/page.tsx
app/admin/community/page.tsx
app/admin/settings/page.tsx
```

주요 관리자 컴포넌트:

```text
components/admin/sidebar.tsx
components/admin/topbar.tsx
components/admin/stat-card.tsx
components/admin/status-badge.tsx
components/admin/dashboard-charts.tsx
components/admin/customer-drawer.tsx
```

## 3. 기술 스택 관찰

프론트엔드 디자인 파일과 동일한 계열입니다.

```text
Next.js 16.2.6
React 19
TypeScript
Tailwind CSS 4
Radix UI
lucide-react
recharts
shadcn 스타일 UI 컴포넌트 구조
pnpm
```

## 4. 관리자 디자인 핵심 방향

### 4.1 레이아웃

- 좌측 고정 Sidebar
- 상단 Topbar
- 우측 메인 콘텐츠
- 접기/펼치기 가능한 사이드바
- 테이블/차트/상태카드 중심의 SaaS 운영 대시보드

### 4.2 사이드바 메뉴

현재 디자인에 포함된 메뉴:

```text
대시보드
고객관리
상품관리
릴리즈관리
설치코드/라이선스
결제관리
토큰/크레딧
LLM 계정 Pool
사용량 모니터링
Skill/컴포넌트
상담/채팅
커뮤니티 관리
시스템 설정
```

이 메뉴 구조는 AI Linker 백오피스 개발 기준으로 유지합니다.

### 4.3 대시보드 지표

`app/admin/page.tsx` 기준 주요 카드:

```text
오늘 매출
월 누적 매출
신규 가입자
신규 구매자
설치코드 발급
활성 라이선스
토큰 충전액
LLM 원가
예상 마진
미처리 상담
```

### 4.4 대시보드 테이블/알림

포함된 영역:

```text
최근 주문
최근 설치코드 발급
미처리 상담
LLM 계정 이상 알림
```

### 4.5 운영 핵심 UI 패턴

- 상태 배지
- 통계 카드
- 차트
- 데이터 테이블
- 검색/필터
- 상세 Drawer
- 관리자 액션 버튼
- 상태별 색상 구분

## 5. 백엔드 개발 반영 방식

실제 백엔드 개발 시 이 디자인은 다음 API/DB 기능과 연결합니다.

```text
고객관리 → User, License, Purchase, CreditWallet, UsageEvent
상품관리 → AgentProduct, SkillProduct
릴리즈관리 → AgentRelease, InstallerFile
설치코드/라이선스 → InstallCode, License, DeviceActivation
결제관리 → Payment, Purchase, CreditTransaction
토큰/크레딧 → CreditWallet, CreditTransaction, UsageEvent
LLM 계정 Pool → LLMProvider, LLMAccount, LLMModel, LLMRoutingPolicy
사용량 모니터링 → UsageEvent 집계
상담/채팅 → SupportTicket, ChatMessage
커뮤니티 관리 → CommunityPost, CommunityComment
시스템 설정 → AdminUser, AuditLog, service settings
```

## 6. Gate 1 반영 범위

Gate 1에서 우선 반영할 관리자 부분:

```text
- /admin 라우트
- Admin layout
- Sidebar
- Topbar
- StatCard
- StatusBadge
- DashboardCharts 목업
- 대시보드 카드/테이블 UI
```

실제 DB/API 연결은 이후 Gate에서 순차적으로 진행합니다.

## 7. 통합 구현 주의사항

1. 사용자 프론트 디자인과 관리자 디자인은 같은 Next.js 앱 안에 통합합니다.
2. 공통 `components/ui`는 중복을 줄여 하나로 관리합니다.
3. 관리자 라우트는 `/admin` 하위로 분리합니다.
4. 실제 권한/인증은 Gate 5 이후 붙이되, UI 구조는 Gate 1에서 준비합니다.
5. 관리자 샘플 데이터는 실제 DB 연결 전까지 파일/상수 기반으로 둡니다.
6. LLM 계정/API Key는 실제 값 저장 전까지 절대 하드코딩하지 않습니다.
