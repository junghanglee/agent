# 13. Gate 4 관리자 운영 API/라이선스 연결 결과

## 1. 목표

Gate 4에서는 관리자 화면에서 운영에 필요한 핵심 API를 추가하고, 설치코드/라이선스 화면을 목업 데이터에서 실제 DB 데이터로 전환했습니다.

## 2. 추가 API

### 상품 관리

```text
GET    /api/admin/products
POST   /api/admin/products
GET    /api/admin/products/:id
PATCH  /api/admin/products/:id
DELETE /api/admin/products/:id
```

- `POST/PATCH`는 Zod 기반 입력 검증을 적용했습니다.
- `DELETE`는 실제 삭제가 아니라 `ARCHIVED` 상태로 전환합니다.

### 릴리즈 관리

```text
GET    /api/admin/releases
POST   /api/admin/releases
GET    /api/admin/releases/:id
PATCH  /api/admin/releases/:id
DELETE /api/admin/releases/:id
```

- 릴리즈 생성/수정 시 설치파일 메타데이터를 함께 생성하거나 기존 `installerFileId`에 연결할 수 있습니다.
- `isLatest=true`로 설정하면 동일 상품/플랫폼의 다른 릴리즈는 `isLatest=false`로 정리합니다.
- `DELETE`는 실제 삭제가 아니라 `ARCHIVED`, `isLatest=false`로 전환합니다.

### 설치코드 관리

```text
GET    /api/admin/install-codes
POST   /api/admin/install-codes
PATCH  /api/admin/install-codes/:id
DELETE /api/admin/install-codes/:id
```

- `GET`은 `q` 검색 파라미터를 지원합니다.
- `POST`는 결제 완료 구매(`purchaseId`) 기준으로 설치코드와 라이선스를 함께 발급합니다.
- `DELETE`는 실제 삭제가 아니라 `REVOKED` 상태로 전환합니다.

### 라이선스 관리

```text
GET    /api/admin/licenses
PATCH  /api/admin/licenses/:id
DELETE /api/admin/licenses/:id
```

- `GET`은 `q` 검색 파라미터를 지원합니다.
- `PATCH`로 라이선스 상태/종료일을 수정할 수 있습니다.
- `DELETE`는 실제 삭제가 아니라 `REVOKED` 상태로 전환합니다.

## 3. 추가 공통 유틸

```text
projects/ai-linker-platform/web/lib/admin-validation.ts
projects/ai-linker-platform/web/lib/api-response.ts
```

### admin-validation.ts

Zod 기반 검증 스키마를 추가했습니다.

```text
createProductSchema
updateProductSchema
createReleaseSchema
updateReleaseSchema
issueInstallCodeSchema
updateInstallCodeSchema
updateLicenseSchema
```

### api-response.ts

API 응답 구조를 통일했습니다.

```text
ok(data)
fail(message, status, details)
validationFail(error)
serializeForJson(value)
```

`Decimal`, `BigInt` 값을 JSON 응답에 안전하게 포함하기 위한 직렬화도 포함했습니다.

## 4. 설치코드/라이선스 화면 실데이터화

다음 화면을 목업 배열에서 Prisma DB 조회로 전환했습니다.

```text
/admin/licenses
```

표시 데이터:

```text
설치코드 목록
고객명/이메일
상품명
구매 플랫폼
코드 상태
활성화 수 / 최대 활성화 수
발급일/만료일
라이선스 목록
디바이스 활성화 수
발급 가능한 결제 완료 구매 목록
```

검색:

```text
/admin/licenses?q=검색어
```

검색 대상:

```text
설치코드
고객명
고객 이메일
상품명
```

## 5. 아직 남은 부분

이번 Gate는 API와 실데이터 조회 기반까지 연결했습니다.
버튼 클릭으로 실제 `POST/PATCH/DELETE`를 호출하는 클라이언트 액션/모달 폼은 다음 Gate에서 연결하는 것이 좋습니다.

## 6. 품질 확인

아래 명령을 실행해 통과했습니다.

```bash
npm run build
npm run lint
```

결과:

```text
npm run build → 통과
npm run lint  → 통과
```

## 7. 다음 Gate 추천

Gate 5 추천 범위:

```text
1. 관리자 상품 추가/수정 모달 UI 연결
2. 릴리즈 업로드/수정 모달 UI 연결
3. 설치코드 발급 모달 실제 API 호출 연결
4. 라이선스 활성/정지 버튼 실제 API 호출 연결
5. 서버 액션 또는 fetch 기반 mutation 패턴 정리
6. 관리자 인증/권한 보호 준비
```
