# 16. Gate 6 관리자 인증/권한 보호

## 1. 목표

Gate 6에서는 실제 배포 전에 관리자 화면과 관리자 운영 API가 누구에게나 열리지 않도록 기본 인증/권한 보호를 추가했습니다.

## 2. 추가 파일

```text
projects/ai-linker-platform/web/lib/admin-auth.ts
projects/ai-linker-platform/web/lib/admin-auth-actions.ts
projects/ai-linker-platform/web/app/admin/login/page.tsx
```

## 3. 보호 대상

관리자 레이아웃에서 세션을 확인합니다.

```text
/admin
/admin/customers
/admin/products
/admin/releases
/admin/licenses
```

관리자 API도 세션 검사를 추가했습니다.

```text
/api/admin/overview
/api/admin/products
/api/admin/products/:id
/api/admin/releases
/api/admin/releases/:id
/api/admin/install-codes
/api/admin/install-codes/:id
/api/admin/licenses
/api/admin/licenses/:id
```

관리자 Server Actions도 `requireAdminSession()`을 통해 로그인 상태에서만 실행되도록 했습니다.

## 4. 로그인 방식

로그인 페이지:

```text
/admin/login
```

환경변수:

```text
ADMIN_EMAIL
ADMIN_NAME
ADMIN_PASSWORD
ADMIN_PASSWORD_HASH
ADMIN_SESSION_SECRET
```

개발 기본 비밀번호 fallback:

```text
admin1234
```

운영 배포 전에는 반드시 `ADMIN_PASSWORD_HASH`와 `ADMIN_SESSION_SECRET`을 강한 값으로 설정해야 합니다.

## 5. 세션 쿠키

관리자 로그인 성공 시 HttpOnly 쿠키가 생성됩니다.

```text
ai_linker_admin_session
```

세션 특징:

```text
HttpOnly
SameSite=Lax
Production에서는 Secure
기본 유효시간 8시간
HMAC 서명 기반 변조 방지
```

## 6. AuditLog

로그인 성공 시 `AuditLog`에 `ADMIN_LOGIN` 이벤트를 기록합니다.

```text
entityType: AdminUser
action: ADMIN_LOGIN
```

## 7. 남은 보안 강화 과제

현재는 MVP용 기본 인증입니다. 다음 단계에서 강화가 필요합니다.

```text
1. bcrypt/argon2 기반 비밀번호 해시
2. DB 기반 세션 저장/강제 로그아웃
3. 로그인 실패 횟수 제한
4. CSRF 방어 강화
5. 관리자별 권한 분리
6. 모든 관리자 mutation AuditLog 기록
7. 2FA 또는 OTP
```
