# 12. Gate 3 관리자 실데이터 연결 결과

## 1. 목표

Gate 3에서는 Gate 1에서 만든 관리자 UI와 Gate 2에서 만든 Prisma/DB/API 기반을 연결해, 주요 관리자 화면이 목업 배열이 아니라 실제 DB 데이터를 읽도록 변경했습니다.

## 2. 실데이터 연결 화면

```text
/admin
/admin/customers
/admin/products
/admin/releases
```

## 3. 변경 파일

```text
projects/ai-linker-platform/web/app/admin/page.tsx
projects/ai-linker-platform/web/app/admin/customers/page.tsx
projects/ai-linker-platform/web/app/admin/products/page.tsx
projects/ai-linker-platform/web/app/admin/releases/page.tsx
projects/ai-linker-platform/web/lib/admin-format.ts
```

## 4. 대시보드 연결 내용

`/admin` 대시보드는 다음 데이터를 Prisma로 직접 조회합니다.

```text
오늘 매출
월 누적 매출
신규 가입자
신규 구매자
설치코드 발급 수
활성 라이선스 수
토큰/크레딧 충전액
LLM 원가
예상 마진
미처리 상담 수
최근 주문
최근 설치코드 발급
미처리 상담 목록
LLM 계정 이상 알림
```

현재 차트 컴포넌트는 아직 기존 디자인 목업 데이터를 유지합니다. Gate 4 또는 Gate 5에서 UsageEvent/Payment 집계 기반으로 차트도 실데이터화할 예정입니다.

## 5. 고객관리 연결 내용

`/admin/customers`는 `User` 테이블을 기준으로 다음 관계를 함께 조회합니다.

```text
CreditWallet
Purchase 합계
License 상태
SupportTicket 카운트
```

검색/필터/고객 추가는 아직 비활성화 상태입니다. CRUD/검색/필터는 다음 Gate에서 연결합니다.

## 6. 상품관리 연결 내용

`/admin/products`는 `AgentProduct` 테이블을 기준으로 다음 데이터를 표시합니다.

```text
상품명
slug
카테고리
purposeTags
supportedPlatforms
가격
구매 수
라이선스 수
상품 상태
```

상품 추가/수정은 아직 비활성화 상태입니다. Gate 4에서 관리자 CRUD로 연결합니다.

## 7. 릴리즈관리 연결 내용

`/admin/releases`는 `AgentRelease`와 `InstallerFile` 관계를 조회합니다.

```text
Agent 이름/slug
플랫폼
버전
설치파일명
파일 크기
SHA256
최신 여부
공개 상태
업로드일
```

릴리즈 업로드/공개 전환/다운로드 테스트는 Gate 4에서 실제 액션으로 연결합니다.

## 8. 공통 포맷 유틸

`lib/admin-format.ts`를 추가했습니다.

```text
formatKrw
formatUsd
formatDate
formatBytes
statusToBadge
```

관리자 화면에서 DB Decimal/Date/Status 값을 UI용 문자열과 배지 상태로 변환합니다.

## 9. 품질 확인

아래 명령을 실행해 통과했습니다.

```bash
npm run lint
npm run build
```

결과:

```text
npm run lint  → 통과
npm run build → 통과
```

## 10. 다음 Gate 추천

Gate 4 추천 범위:

```text
1. 관리자 상품 CRUD API 구현
2. 릴리즈 등록/수정 API 구현
3. 설치파일 메타데이터 등록 구조 구현
4. 설치코드/라이선스 관리자 화면 실데이터 연결
5. 관리자 검색/필터 기능 연결
6. Zod 입력 검증 추가
```
