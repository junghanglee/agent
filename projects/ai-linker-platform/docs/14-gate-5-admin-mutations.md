# 14. Gate 5 관리자 Mutation UI 연결 결과

## 1. 목표

Gate 5에서는 Gate 4에서 만든 관리자 운영 API/DB 구조 위에 실제 관리자 버튼과 모달 UI를 연결했습니다. 이제 주요 운영 화면에서 목업 버튼이 아니라 서버 액션을 통해 DB 변경이 가능합니다.

## 2. 추가 파일

```text
projects/ai-linker-platform/web/lib/admin-actions.ts
projects/ai-linker-platform/web/components/admin/product-actions.tsx
projects/ai-linker-platform/web/components/admin/release-actions.tsx
projects/ai-linker-platform/web/components/admin/license-actions.tsx
```

## 3. 변경 화면

```text
/admin/products
/admin/releases
/admin/licenses
```

## 4. 서버 액션

`lib/admin-actions.ts`에 관리자 운영용 Server Actions를 추가했습니다.

```text
createProductAction
updateProductAction
archiveProductAction
createReleaseAction
updateReleaseAction
archiveReleaseAction
issueInstallCodeAction
revokeInstallCodeAction
updateLicenseStatusAction
searchLicensesAction
```

모든 주요 입력은 Gate 4에서 만든 Zod 스키마를 재사용합니다.

## 5. 상품관리 UI

`/admin/products`에서 다음 액션이 가능합니다.

```text
상품 추가
상품 수정
상품 보관 처리
```

상품 추가/수정 모달 입력 필드:

```text
상품명
slug
카테고리
난이도
가격
상태
짧은 설명
상세 설명
태그
썸네일 URL
지원 플랫폼
```

상품 삭제는 실제 삭제가 아니라 `ARCHIVED` 상태 변경으로 처리합니다.

## 6. 릴리즈관리 UI

`/admin/releases`에서 다음 액션이 가능합니다.

```text
릴리즈 업로드
릴리즈 수정
릴리즈 보관 처리
```

릴리즈 업로드 입력 필드:

```text
상품
플랫폼
버전
상태
릴리즈 노트
파일명
스토리지 키
다운로드 URL
파일 크기(bytes)
SHA256
최신 릴리즈 여부
필수 업데이트 여부
```

현재 실제 파일 바이너리 업로드는 아직 연결하지 않았고, 다운로드 URL/메타데이터 등록 방식입니다.
실제 파일 업로드 스토리지 연동은 다음 단계에서 붙이는 것이 좋습니다.

## 7. 설치코드/라이선스 UI

`/admin/licenses`에서 다음 액션이 가능합니다.

```text
설치코드 발급
설치코드 복사
설치코드 폐기
라이선스 활성화
라이선스 정지
검색
```

설치코드 발급은 결제 완료 구매 내역을 선택해 생성합니다.
발급 시 설치코드와 라이선스가 함께 생성됩니다.

## 8. Mutation 패턴

이번 Gate에서는 Next.js Server Actions 기반으로 통일했습니다.

```text
form action={serverAction}
DB 변경
revalidatePath(...)
```

장점:

```text
클라이언트 fetch 코드 최소화
초기 MVP 구현 속도 빠름
DB 변경 후 관리자 화면 자동 갱신 가능
```

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

Gate 6 추천 범위:

```text
1. 관리자 인증/로그인 페이지
2. 관리자 세션/권한 보호
3. 관리자 액션 AuditLog 기록
4. 실제 파일 업로드 스토리지 구조
5. 결제/토큰 충전 플로우 연결
6. 민감한 관리자 API 보호 미들웨어
```
