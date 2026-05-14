# 17. Gate 7 관리자 보안 강화 1차

## 1. 목표

관리자 로그인 기능을 실제 배포 전에 더 안전하게 만들기 위해 운영 환경에서 약한 기본값이 사용되지 않도록 차단했습니다.

## 2. 변경 사항

추가/수정 파일:

```text
projects/ai-linker-platform/web/lib/admin-auth.ts
projects/ai-linker-platform/web/lib/admin-auth-actions.ts
projects/ai-linker-platform/web/lib/admin-audit.ts
projects/ai-linker-platform/web/lib/admin-actions.ts
projects/ai-linker-platform/web/app/admin/login/page.tsx
projects/ai-linker-platform/web/app/api/admin/products/route.ts
projects/ai-linker-platform/web/app/api/admin/products/[id]/route.ts
projects/ai-linker-platform/web/app/api/admin/releases/route.ts
projects/ai-linker-platform/web/app/api/admin/releases/[id]/route.ts
projects/ai-linker-platform/web/app/api/admin/install-codes/route.ts
projects/ai-linker-platform/web/app/api/admin/install-codes/[id]/route.ts
projects/ai-linker-platform/web/app/api/admin/licenses/[id]/route.ts
projects/ai-linker-platform/web/scripts/hash-admin-password.mjs
projects/ai-linker-platform/web/package.json
projects/ai-linker-platform/web/.env.example
```

## 3. 운영 보안 규칙

운영 환경(`NODE_ENV=production`)에서는 아래 값이 반드시 설정되어야 합니다.

```text
ADMIN_EMAIL
ADMIN_PASSWORD_HASH
ADMIN_SESSION_SECRET
```

`ADMIN_SESSION_SECRET`은 최소 32자 이상의 강한 랜덤 문자열이어야 합니다.

아래 placeholder 값은 운영 환경에서 허용하지 않습니다.

```text
replace-with-strong-random-key
replace-with-strong-random-session-secret
replace-with-sha256-password-hash
```

## 4. 관리자 비밀번호 해시 생성

비밀번호를 직접 정해서 해시를 만들 때:

```bash
npm run admin:hash-password -- "your-strong-password"
```

랜덤 비밀번호와 해시를 함께 만들 때:

```bash
npm run admin:hash-password
```

출력된 `ADMIN_PASSWORD_HASH` 값을 Vercel 환경변수에 등록합니다.

주의:

```text
생성된 원본 비밀번호는 다시 확인할 수 없으므로 안전한 곳에 따로 보관해야 합니다.
```

## 5. 로그인 실패 횟수 제한

관리자 로그인 실패가 15분 안에 5회 이상 발생하면 추가 로그인을 잠시 차단합니다.

기준:

```text
이메일 + 요청 IP
```

실패 기록은 `AuditLog`에 남습니다.

```text
action: ADMIN_LOGIN_FAILED
entityType: AdminUser
reason: email | password | rate_limited
```

사용자에게는 아래 메시지가 표시됩니다.

```text
로그인 실패가 너무 많습니다. 15분 뒤 다시 시도하세요.
```

## 6. 관리자 변경 AuditLog 강화

관리자 mutation은 `AuditLog`에 변경 전/후 데이터를 기록합니다.

대상:

```text
상품 생성/수정/보관
릴리즈 생성/수정/보관
설치코드 발급/수정/폐기
라이선스 상태 변경/폐기
```

기록되는 주요 값:

```text
adminUserId
 action
entityType
entityId
beforeData
afterData
createdAt
```

`lib/admin-audit.ts`의 `recordAdminAudit()` 헬퍼를 통해 Server Action과 Admin API가 같은 방식으로 감사를 남깁니다.

## 7. 로그인 오류 처리

운영 환경변수가 잘못되어 있으면 관리자 로그인 화면에 설정 오류 안내가 표시됩니다.

```text
관리자 로그인 환경변수 설정이 필요합니다.
```

서버 로그에는 구체적인 설정 오류가 남습니다.

## 8. 검증

아래 검증을 통과했습니다.

```bash
npm run lint
npm run admin:hash-password -- "test-password"
npm run build
```

## 9. 다음 작업 후보

```text
1. CSRF 방어 강화
2. 관리자별 권한 분리
3. 2FA/OTP 추가
```
