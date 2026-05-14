import { requireAdminSession } from '@/lib/admin-auth'
import { prisma } from '@/lib/prisma'
import { ShieldCheck, UserCog } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function AdminUsersPage() {
  const session = await requireAdminSession()

  if (session.role !== 'SUPER_ADMIN') {
    return (
      <div className="rounded-lg border border-border bg-card p-6">
        <h1 className="text-xl font-bold text-foreground">관리자 계정관리</h1>
        <p className="mt-2 text-sm text-muted-foreground">슈퍼관리자만 접근할 수 있습니다.</p>
      </div>
    )
  }

  const admins = await prisma.adminUser.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      status: true,
      createdAt: true,
      updatedAt: true,
      _count: { select: { auditLogs: true } },
      auditLogs: { take: 1, orderBy: { createdAt: 'desc' }, select: { action: true, createdAt: true } },
    },
  })

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">관리자 계정관리</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">슈퍼관리자가 서브관리자 계정과 활동 이력을 관리합니다.</p>
        </div>
        <div className="flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
          <ShieldCheck className="h-3.5 w-3.5" /> SUPER ADMIN
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[360px_1fr]">
        <form className="rounded-lg border border-border bg-card p-5 space-y-3" action="/api/admin/admin-users" method="post">
          <div>
            <h2 className="text-sm font-semibold text-foreground">서브관리자 생성</h2>
            <p className="mt-1 text-xs text-muted-foreground">API가 준비되어 있어 운영 UI 연결 시 즉시 생성 가능합니다.</p>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium">이메일</label>
            <input name="email" type="email" className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm" placeholder="sub-admin@example.com" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium">이름</label>
            <input name="name" className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm" placeholder="서브관리자" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium">초기 비밀번호</label>
            <input name="password" type="password" className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm" placeholder="8자 이상" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1.5">
              <label className="text-xs font-medium">권한</label>
              <select name="role" defaultValue="ADMIN" className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm">
                <option value="ADMIN">서브관리자</option>
                <option value="SUPER_ADMIN">슈퍼관리자</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium">상태</label>
              <select name="status" defaultValue="ACTIVE" className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm">
                <option value="ACTIVE">활성</option>
                <option value="SUSPENDED">정지</option>
                <option value="PENDING">대기</option>
              </select>
            </div>
          </div>
          <p className="rounded-md bg-muted px-3 py-2 text-xs text-muted-foreground">
            현재 화면은 목록/모니터링 중심입니다. 생성/수정은 `/api/admin/admin-users` API로 처리되며, 다음 UI 패스에서 버튼 액션을 연결하면 됩니다.
          </p>
        </form>

        <div className="rounded-lg border border-border bg-card overflow-hidden">
          <table className="w-full text-xs">
            <thead className="bg-muted/40 text-muted-foreground">
              <tr>
                <th className="px-4 py-3 text-left font-medium">관리자</th>
                <th className="px-4 py-3 text-center font-medium">권한</th>
                <th className="px-4 py-3 text-center font-medium">상태</th>
                <th className="px-4 py-3 text-center font-medium">활동 수</th>
                <th className="px-4 py-3 text-left font-medium">최근 활동</th>
              </tr>
            </thead>
            <tbody>
              {admins.map((admin) => {
                const latest = admin.auditLogs[0]
                return (
                  <tr key={admin.id} className="border-t border-border/60">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary"><UserCog className="h-4 w-4" /></div>
                        <div>
                          <p className="font-medium text-foreground">{admin.name}</p>
                          <p className="font-mono text-[11px] text-muted-foreground">{admin.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center"><span className="rounded-full bg-muted px-2 py-0.5 font-medium">{admin.role}</span></td>
                    <td className="px-4 py-3 text-center"><span className="rounded-full bg-primary/10 px-2 py-0.5 font-medium text-primary">{admin.status}</span></td>
                    <td className="px-4 py-3 text-center font-medium">{admin._count.auditLogs.toLocaleString()}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {latest ? `${latest.action} · ${latest.createdAt.toLocaleString('ko-KR')}` : '활동 없음'}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
