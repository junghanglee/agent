import { AdminUserCreateButton, AdminUserEditButton, AdminUserStatusButton } from '@/components/admin/admin-user-actions'
import { requireAdminPagePermission } from '@/lib/admin-auth'
import { prisma } from '@/lib/prisma'
import { Activity, ShieldCheck, UserCog } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function AdminUsersPage() {
  const session = await requireAdminPagePermission('ADMIN_USERS_MANAGE')

  if (session.role !== 'SUPER_ADMIN') {
    return (
      <div className="rounded-lg border border-border bg-card p-6">
        <h1 className="text-xl font-bold text-foreground">관리자 계정관리</h1>
        <p className="mt-2 text-sm text-muted-foreground">슈퍼관리자만 접근할 수 있습니다.</p>
      </div>
    )
  }

  const [admins, recentLogs] = await Promise.all([
    prisma.adminUser.findMany({
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
    }),
    prisma.auditLog.findMany({
      take: 20,
      orderBy: { createdAt: 'desc' },
      include: { adminUser: { select: { id: true, name: true, email: true, role: true } } },
    }),
  ])

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">관리자 계정관리</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">슈퍼관리자가 서브관리자 계정 생성/수정과 활동 모니터링을 합니다.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            <ShieldCheck className="h-3.5 w-3.5" /> SUPER ADMIN
          </div>
          <AdminUserCreateButton />
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <table className="w-full text-xs">
          <thead className="bg-muted/40 text-muted-foreground">
            <tr>
              <th className="px-4 py-3 text-left font-medium">관리자</th>
              <th className="px-4 py-3 text-center font-medium">권한</th>
              <th className="px-4 py-3 text-center font-medium">상태</th>
              <th className="px-4 py-3 text-center font-medium">활동 수</th>
              <th className="px-4 py-3 text-left font-medium">최근 활동</th>
              <th className="px-4 py-3 text-center font-medium">관리</th>
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
                  <td className="px-4 py-3 text-center"><span className="rounded-full bg-muted px-2 py-0.5 font-medium">{admin.role === 'SUPER_ADMIN' ? '슈퍼관리자' : '서브관리자'}</span></td>
                  <td className="px-4 py-3 text-center"><span className="rounded-full bg-primary/10 px-2 py-0.5 font-medium text-primary">{admin.status}</span></td>
                  <td className="px-4 py-3 text-center font-medium">{admin._count.auditLogs.toLocaleString()}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {latest ? `${latest.action} · ${latest.createdAt.toLocaleString('ko-KR')}` : '활동 없음'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-center gap-1.5">
                      <AdminUserEditButton admin={admin} />
                      <AdminUserStatusButton id={admin.id} status={admin.status} />
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <div className="flex items-center gap-2 border-b border-border px-4 py-3">
          <Activity className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-semibold text-foreground">최근 관리자 활동</h2>
        </div>
        <div className="divide-y divide-border/60">
          {recentLogs.length === 0 ? (
            <p className="px-4 py-6 text-sm text-muted-foreground">아직 기록된 관리자 활동이 없습니다.</p>
          ) : recentLogs.map((log) => (
            <div key={log.id} className="grid gap-2 px-4 py-3 text-xs md:grid-cols-[220px_1fr_160px]">
              <div>
                <p className="font-medium text-foreground">{log.adminUser?.name ?? '시스템/미확인'}</p>
                <p className="font-mono text-[11px] text-muted-foreground">{log.adminUser?.email ?? log.entityId ?? '-'}</p>
              </div>
              <div>
                <p className="font-medium text-foreground">{log.action}</p>
                <p className="text-muted-foreground">{log.entityType} · {log.entityId ?? '-'}</p>
              </div>
              <div className="text-muted-foreground md:text-right">{log.createdAt.toLocaleString('ko-KR')}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
