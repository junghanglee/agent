import type { Prisma } from '@prisma/client'
import { StatCard } from '@/components/admin/stat-card'
import { StatusBadge } from '@/components/admin/status-badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { requireAdminPagePermission } from '@/lib/admin-auth'
import { formatDateTime } from '@/lib/admin-format'
import { prisma } from '@/lib/prisma'
import { Activity, AlertTriangle, ClipboardList, Filter, Search, ShieldCheck, UserCog } from 'lucide-react'

export const dynamic = 'force-dynamic'

type AuditPageProps = {
  searchParams: Promise<{ q?: string; action?: string; entityType?: string; adminId?: string }>
}

function actionLabel(action: string) {
  if (action.startsWith('ADMIN_LOGIN_FAILED')) return '로그인 실패'
  if (action.startsWith('ADMIN_LOGIN')) return '로그인'
  if (action.includes('CREATE')) return '생성'
  if (action.includes('UPDATE')) return '수정'
  if (action.includes('SUSPEND')) return '정지'
  if (action.includes('ACTIVATE')) return '활성화'
  if (action.includes('REVOKE')) return '폐기'
  if (action.includes('REFUNDED')) return '환불'
  if (action.includes('FAILED')) return '실패'
  if (action.includes('CANCELLED')) return '취소'
  return '기록'
}

function actionBadge(action: string) {
  if (action.includes('FAILED') || action.includes('SUSPEND') || action.includes('REVOKE')) return 'failed'
  if (action.includes('REFUNDED') || action.includes('CANCELLED')) return 'warning'
  if (action.includes('CREATE') || action.includes('ACTIVATE') || action.includes('APPROVE')) return 'active'
  if (action.includes('UPDATE')) return 'pending'
  return 'normal'
}

function compactJson(value?: string | null) {
  if (!value) return '—'
  try {
    const parsed = JSON.parse(value)
    const text = JSON.stringify(parsed)
    return text.length > 180 ? `${text.slice(0, 180)}...` : text
  } catch {
    return value.length > 180 ? `${value.slice(0, 180)}...` : value
  }
}

export default async function AuditPage({ searchParams }: AuditPageProps) {
  await requireAdminPagePermission('AUDIT_READ')

  const { q = '', action = '', entityType = '', adminId = '' } = await searchParams
  const query = q.trim()
  const where: Prisma.AuditLogWhereInput = {
    ...(query
      ? {
          OR: [
            { action: { contains: query } },
            { entityType: { contains: query } },
            { entityId: { contains: query } },
            { adminUser: { name: { contains: query } } },
            { adminUser: { email: { contains: query } } },
          ],
        }
      : {}),
    ...(action ? { action } : {}),
    ...(entityType ? { entityType } : {}),
    ...(adminId ? { adminUserId: adminId } : {}),
  }

  const now = new Date()
  const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const weekStart = new Date(now)
  weekStart.setDate(now.getDate() - 6)

  const [logs, admins, actionGroups, entityGroups, todayCount, weekCount, failedLoginCount] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      take: 100,
      orderBy: { createdAt: 'desc' },
      include: { adminUser: { select: { id: true, name: true, email: true, role: true, status: true } } },
    }),
    prisma.adminUser.findMany({
      orderBy: { name: 'asc' },
      select: { id: true, name: true, email: true, role: true, status: true },
    }),
    prisma.auditLog.groupBy({ by: ['action'], _count: true, orderBy: { _count: { action: 'desc' } }, take: 30 }),
    prisma.auditLog.groupBy({ by: ['entityType'], _count: true, orderBy: { _count: { entityType: 'desc' } }, take: 30 }),
    prisma.auditLog.count({ where: { createdAt: { gte: dayStart } } }),
    prisma.auditLog.count({ where: { createdAt: { gte: weekStart } } }),
    prisma.auditLog.count({ where: { action: 'ADMIN_LOGIN_FAILED', createdAt: { gte: dayStart } } }),
  ])

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-foreground">감사로그 / 관리자 활동</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">관리자 작업, 로그인 실패, 결제/고객/라이선스 변경 이력을 추적합니다.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard title="오늘 활동" value={`${todayCount}건`} icon={Activity} iconColor="text-violet-600" iconBg="bg-violet-50" />
        <StatCard title="최근 7일 활동" value={`${weekCount}건`} icon={ClipboardList} iconColor="text-cyan-600" iconBg="bg-cyan-50" />
        <StatCard title="오늘 로그인 실패" value={`${failedLoginCount}건`} icon={AlertTriangle} iconColor="text-amber-600" iconBg="bg-amber-50" />
        <StatCard title="관리자 계정" value={`${admins.length}명`} icon={ShieldCheck} iconColor="text-emerald-600" iconBg="bg-emerald-50" />
      </div>

      <form className="grid gap-2 rounded-lg border border-border bg-card p-3 md:grid-cols-[1fr_180px_180px_220px_auto]">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input name="q" placeholder="액션, 대상, 관리자 검색" className="h-9 pl-9 text-sm" defaultValue={query} />
        </div>
        <select name="action" defaultValue={action} className="h-9 rounded-md border border-input bg-background px-2 text-xs">
          <option value="">전체 액션</option>
          {actionGroups.map((item) => <option key={item.action} value={item.action}>{item.action} ({item._count})</option>)}
        </select>
        <select name="entityType" defaultValue={entityType} className="h-9 rounded-md border border-input bg-background px-2 text-xs">
          <option value="">전체 대상</option>
          {entityGroups.map((item) => <option key={item.entityType} value={item.entityType}>{item.entityType} ({item._count})</option>)}
        </select>
        <select name="adminId" defaultValue={adminId} className="h-9 rounded-md border border-input bg-background px-2 text-xs">
          <option value="">전체 관리자</option>
          {admins.map((admin) => <option key={admin.id} value={admin.id}>{admin.name} · {admin.email}</option>)}
        </select>
        <Button variant="outline" size="sm" className="h-9 gap-1.5">
          <Filter className="h-3.5 w-3.5" />필터
        </Button>
      </form>

      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-muted/40 text-muted-foreground">
              <tr>
                <th className="px-4 py-3 text-left font-medium">시간</th>
                <th className="px-4 py-3 text-left font-medium">관리자</th>
                <th className="px-4 py-3 text-center font-medium">액션</th>
                <th className="px-4 py-3 text-left font-medium">대상</th>
                <th className="px-4 py-3 text-left font-medium">변경 후 데이터 요약</th>
                <th className="px-4 py-3 text-left font-medium">IP</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} className="border-t border-border/60 align-top hover:bg-muted/30">
                  <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">{formatDateTime(log.createdAt)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary"><UserCog className="h-3.5 w-3.5" /></div>
                      <div>
                        <p className="font-medium text-foreground">{log.adminUser?.name ?? '시스템/미확인'}</p>
                        <p className="font-mono text-[11px] text-muted-foreground">{log.adminUser?.email ?? '-'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="space-y-1">
                      <StatusBadge status={actionBadge(log.action)} />
                      <p className="font-mono text-[10px] text-muted-foreground">{actionLabel(log.action)}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-foreground">{log.entityType}</p>
                    <p className="font-mono text-[11px] text-muted-foreground">{log.entityId ?? '—'}</p>
                    <p className="mt-1 font-mono text-[10px] text-muted-foreground">{log.action}</p>
                  </td>
                  <td className="max-w-md px-4 py-3 font-mono text-[11px] text-muted-foreground">{compactJson(log.afterData)}</td>
                  <td className="px-4 py-3 font-mono text-[11px] text-muted-foreground">{log.ipAddress ?? '—'}</td>
                </tr>
              ))}
              {logs.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-sm text-muted-foreground">조건에 맞는 감사로그가 없습니다.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
