import { ShieldCheck } from 'lucide-react'
import { AILinkerLogo } from '@/components/brand/ai-linker-logo'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { adminLoginAction } from '@/lib/admin-auth-actions'

export const dynamic = 'force-dynamic'

function errorMessage(error?: string) {
  if (error === 'missing') return '이메일과 비밀번호를 입력하세요.'
  if (error === 'invalid') return '관리자 계정 정보가 올바르지 않습니다.'
  if (error === 'config') return '관리자 로그인 환경변수 설정이 필요합니다. 운영 배포용 비밀번호/세션 키를 확인하세요.'
  if (error === 'rate_limited') return '로그인 실패가 너무 많습니다. 15분 뒤 다시 시도하세요.'
  return null
}

export default async function AdminLoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams
  const message = errorMessage(error)

  return (
    <main className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-card border border-border rounded-2xl shadow-sm p-8">
        <div className="mb-7 space-y-4">
          <AILinkerLogo href="/" variant="dark" size="lg" priority />
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">관리자 로그인</h1>
              <p className="text-sm text-muted-foreground mt-0.5">운영 대시보드 접근 권한 확인</p>
            </div>
          </div>
        </div>

        {message && <div className="mb-4 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">{message}</div>}

        <form action={adminLoginAction} className="space-y-4">
          <div>
            <label className="text-xs font-medium block mb-1.5">관리자 이메일</label>
            <Input name="email" type="email" autoComplete="username" placeholder="admin@ailinker.local" required />
          </div>
          <div>
            <label className="text-xs font-medium block mb-1.5">비밀번호</label>
            <Input name="password" type="password" autoComplete="current-password" placeholder="관리자 비밀번호" required />
          </div>
          <Button type="submit" className="w-full">로그인</Button>
        </form>

        <p className="text-[11px] text-muted-foreground mt-5 leading-relaxed">
          로컬 개발에서는 `.env`의 `ADMIN_EMAIL`, `ADMIN_PASSWORD` 또는 `ADMIN_PASSWORD_HASH`로 로그인 값을 바꿀 수 있습니다. 운영 배포에서는 `ADMIN_EMAIL`, `ADMIN_PASSWORD_HASH`, `ADMIN_SESSION_SECRET`을 반드시 강한 값으로 설정해야 합니다.
        </p>
      </div>
    </main>
  )
}
