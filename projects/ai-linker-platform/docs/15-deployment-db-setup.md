# 15. 실제 웹 배포 / DB 설정 가이드

## 1. 목표

AI Linker를 로컬 SQLite 개발 환경에서 실제 웹 확인이 가능한 배포 구조로 전환합니다.

권장 구성:

```text
Vercel   → Next.js 웹 배포
Supabase → PostgreSQL DB
GitHub   → 코드 저장소 연동
```

## 2. 현재 변경 사항

배포 준비를 위해 Prisma datasource를 PostgreSQL로 전환했습니다.

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

DB를 조회하는 관리자 화면은 Vercel 빌드 중 DB 조회가 발생하지 않도록 요청 시점 동적 렌더링으로 설정했습니다.

```ts
export const dynamic = 'force-dynamic'
```

적용 화면:

```text
/admin
/admin/customers
/admin/products
/admin/releases
/admin/licenses
```

추가 파일:

```text
web/.env.example
web/.env.local.example
web/vercel.json
```

## 3. 환경변수

### Vercel / Production

Vercel에는 아래 값을 등록합니다.

```text
DATABASE_URL
DIRECT_URL
AI_LINKER_ENCRYPTION_KEY
ADMIN_EMAIL
ADMIN_NAME
```

권장:

```text
DATABASE_URL = Supabase pooled connection URL
DIRECT_URL   = Supabase direct connection URL
```

### Local SQLite 개발

로컬 SQLite만 사용할 때는 `.env.local.example` 내용을 `.env`에 복사합니다.

```text
DATABASE_URL="file:./dev.db"
DIRECT_URL="file:./dev.db"
```

단, 현재 Prisma schema provider는 PostgreSQL입니다. SQLite로 되돌려 로컬만 쓰려면 provider도 `sqlite`로 맞춰야 합니다.

## 4. Supabase 설정 순서

1. Supabase 접속
2. New Project 생성
3. Region은 가능하면 한국/일본/싱가포르 근처 선택
4. Database Password 저장
5. Project Settings → Database 이동
6. Connection string 확인
7. URI 형식의 direct URL 확보
8. Pooler/Transaction URL 확보

필요한 값:

```text
PROJECT_REF
DB PASSWORD
Pooled connection URL
Direct connection URL
```

## 5. DB 생성 명령

Supabase URL을 `.env`에 넣은 뒤 실행:

```bash
npm run db:generate
npm run db:push
npm run db:seed
```

주의:

```text
db:push는 현재 Prisma schema를 DB에 반영합니다.
seed는 데모 데이터를 생성합니다.
```

## 6. Vercel 설정 순서

1. Vercel 접속
2. Add New Project
3. GitHub 저장소 연결
4. Root Directory를 아래로 설정

```text
projects/ai-linker-platform/web
```

5. Environment Variables 등록
6. Deploy 실행

`vercel.json`은 빌드 전에 Prisma Client를 생성합니다.

```json
{
  "buildCommand": "prisma generate && next build",
  "installCommand": "npm install"
}
```

## 7. 배포 후 확인 주소

```text
/admin
/admin/products
/admin/releases
/admin/licenses
```

## 8. 검증

배포 준비 변경 후 아래 검증을 통과했습니다.

```bash
npm run db:generate
npm run lint
npm run build
```

## 9. 다음 작업

배포 URL이 열리면 다음 Gate부터는 실제 웹 주소를 보면서 작업합니다.

추천 후속 작업:

```text
1. 관리자 로그인/권한 보호
2. 관리자 AuditLog
3. 실제 파일 업로드 스토리지
4. 결제/토큰 충전 연동
```
