# 17. Gate 7 관리자 보안 강화 1차

## 1. 목표

관리자 로그인 기능을 실제 배포 전에 더 안전하게 만들기 위해 운영 환경에서 약한 기본값이 사용되지 않도록 차단했습니다.

## 2. 변경 사항

추가/수정 파일:

```text
projects/ai-linker-platform/web/lib/admin-auth.ts
projects/ai-linker-platform/web/lib/admin-auth-actions.ts
projects/ai-linker-platform/web/app/admin/login/page.tsx
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

## 5. 로그인 오류 처리

운영 환경변수가 잘못되어 있으면 관리자 로그인 화면에 설정 오류 안내가 표시됩니다.

```text
관리자 로그인 환경변수 설정이 필요합니다.
```

서버 로그에는 구체적인 설정 오류가 남습니다.

## 6. 검증

아래 검증을 통과했습니다.

```bash
npm run lint
npm run admin:hash-password -- "test-password"
```

## 7. 다음 작업 후보

```text
1. 로그인 실패 횟수 제한
2. 관리자 mutation 전체 AuditLog 기록 강화
3. CSRF 방어 강화
4. 관리자별 권한 분리
5. 2FA/OTP 추가
```
