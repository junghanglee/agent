import { StatCard } from '@/components/admin/stat-card'
import { requireAdminPagePermission } from '@/lib/admin-auth'
import { formatUsd } from '@/lib/admin-format'
import { prisma } from '@/lib/prisma'
import { Activity, AlertTriangle, Clock, Server, Users, Zap } from 'lucide-react'

export const dynamic = 'force-dynamic'

const fmt = (value: number) =>
  value >= 1000000 ? `${(value / 1000000).toFixed(1)}M` : value >= 1000 ? `${(value / 1000).toFixed(0)}K` : String(value)

function bucketByHour(date: Date) {
  return `${String(date.getHours()).padStart(2, '0')}:00`
}

export default async function MonitoringPage() {
  await requireAdminPagePermission('MONITORING_READ')

  const now = new Date()
  const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const weekStart = new Date(now)
  weekStart.setDate(now.getDate() - 6)

  const [todayEvents, weeklyEvents, activeUsersToday, providerCount, agentUsage, failedPaymentsToday] = await Promise.all([
    prisma.usageEvent.findMany({
      where: { createdAt: { gte: dayStart } },
      orderBy: { createdAt: 'asc' },
      select: { createdAt: true, inputTokens: true, outputTokens: true, costUsd: true, chargedUsd: true, userId: true, agentProductId: true },
    }),
    prisma.usageEvent.findMany({
      where: { createdAt: { gte: weekStart } },
      orderBy: { createdAt: 'asc' },
      select: { createdAt: true, inputTokens: true, outputTokens: true, costUsd: true },
    }),
    prisma.usageEvent.groupBy({ by: ['userId'], where: { createdAt: { gte: dayStart } } }),
    prisma.lLMProvider.count({ where: { status: { not: 'DISABLED' } } }),
    prisma.usageEvent.groupBy({
      by: ['agentProductId'],
      where: { createdAt: { gte: dayStart }, agentProductId: { not: null } },
      _sum: { inputTokens: true, outputTokens: true, costUsd: true },
      _count: true,
      orderBy: { _count: { agentProductId: 'desc' } },
      take: 8,
    }),
    prisma.payment.count({ where: { status: 'FAILED', createdAt: { gte: dayStart } } }),
  ])

  const totalRequests = todayEvents.length
  const totalTokens = todayEvents.reduce((sum, event) => sum + event.inputTokens + event.outputTokens, 0)
  const totalCost = todayEvents.reduce((sum, event) => sum + Number(event.costUsd ?? 0), 0)
  const avgTokensPerRequest = totalRequests > 0 ? Math.round(totalTokens / totalRequests) : 0
  const minuteRequests = Math.round(totalRequests / Math.max(1, Math.ceil((now.getTime() - dayStart.getTime()) / 60000)))
  const minuteTokens = Math.round(totalTokens / Math.max(1, Math.ceil((now.getTime() - dayStart.getTime()) / 60000)))

  const hourlyMap = new Map<string, { time: string; requests: number; tokens: number; cost: number }>()
  for (let hour = 0; hour <= now.getHours(); hour += 1) {
    const key = `${String(hour).padStart(2, '0')}:00`
    hourlyMap.set(key, { time: key, requests: 0, tokens: 0, cost: 0 })
  }
  todayEvents.forEach((event) => {
    const key = bucketByHour(event.createdAt)
    const bucket = hourlyMap.get(key) ?? { time: key, requests: 0, tokens: 0, cost: 0 }
    bucket.requests += 1
    bucket.tokens += event.inputTokens + event.outputTokens
    bucket.cost += Number(event.costUsd ?? 0)
    hourlyMap.set(key, bucket)
  })
  const hourlyData = Array.from(hourlyMap.values())

  const weeklyMap = new Map<string, { date: string; requests: number; tokens: number; cost: number }>()
  for (let offset = 6; offset >= 0; offset -= 1) {
    const date = new Date(now)
    date.setDate(now.getDate() - offset)
    const key = `${date.getMonth() + 1}/${date.getDate()}`
    weeklyMap.set(key, { date: key, requests: 0, tokens: 0, cost: 0 })
  }
  weeklyEvents.forEach((event) => {
    const key = `${event.createdAt.getMonth() + 1}/${event.createdAt.getDate()}`
    const bucket = weeklyMap.get(key) ?? { date: key, requests: 0, tokens: 0, cost: 0 }
    bucket.requests += 1
    bucket.tokens += event.inputTokens + event.outputTokens
    bucket.cost += Number(event.costUsd ?? 0)
    weeklyMap.set(key, bucket)
  })
  const weeklyData = Array.from(weeklyMap.values())

  const agentIds = agentUsage.map((item) => item.agentProductId).filter(Boolean) as string[]
  const agents = await prisma.agentProduct.findMany({ where: { id: { in: agentIds } }, select: { id: true, name: true } })
  const agentMap = new Map(agents.map((agent) => [agent.id, agent]))

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-foreground">사용량 모니터링</h1>
        <p className="text-sm text-muted-foreground mt-0.5">실제 API 요청, 토큰, 비용 사용 현황</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
        <StatCard title="분당 요청" value={`${minuteRequests}`} icon={Activity} iconColor="text-violet-600" iconBg="bg-violet-50" />
        <StatCard title="분당 토큰" value={fmt(minuteTokens)} icon={Zap} iconColor="text-cyan-600" iconBg="bg-cyan-50" />
        <StatCard title="요청당 평균 토큰" value={fmt(avgTokensPerRequest)} icon={Clock} iconColor="text-emerald-600" iconBg="bg-emerald-50" />
        <StatCard title="오늘 활성 고객" value={`${activeUsersToday.length}`} icon={Users} iconColor="text-blue-600" iconBg="bg-blue-50" />
        <StatCard title="활성 Provider" value={`${providerCount}`} icon={Server} iconColor="text-indigo-600" iconBg="bg-indigo-50" />
        <StatCard title="결제 실패" value={`${failedPaymentsToday}`} icon={AlertTriangle} iconColor="text-amber-600" iconBg="bg-amber-50" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-card rounded-lg border border-border p-4">
          <h3 className="text-sm font-semibold text-foreground mb-4">오늘 시간대별 요청/토큰</h3>
          <div className="space-y-2">
            {hourlyData.slice(-12).map((item) => (
              <div key={item.time} className="grid grid-cols-[48px_1fr_90px] items-center gap-3 text-xs">
                <span className="font-mono text-muted-foreground">{item.time}</span>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div className="h-full rounded-full bg-violet-500" style={{ width: `${Math.max(2, Math.min(100, item.requests * 4))}%` }} />
                </div>
                <span className="text-right text-muted-foreground">{item.requests}건 · {fmt(item.tokens)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card rounded-lg border border-border p-4">
          <h3 className="text-sm font-semibold text-foreground mb-4">최근 7일 비용/요청</h3>
          <div className="space-y-2">
            {weeklyData.map((item) => (
              <div key={item.date} className="grid grid-cols-[48px_1fr_120px] items-center gap-3 text-xs">
                <span className="font-mono text-muted-foreground">{item.date}</span>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div className="h-full rounded-full bg-cyan-500" style={{ width: `${Math.max(2, Math.min(100, item.requests * 2))}%` }} />
                </div>
                <span className="text-right text-muted-foreground">{item.requests}건 · {formatUsd(item.cost)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card rounded-lg border border-border p-4">
          <h3 className="text-sm font-semibold text-foreground mb-4">Agent별 오늘 사용량</h3>
          <div className="space-y-2">
            {agentUsage.map((item) => {
              const tokens = Number(item._sum.inputTokens ?? 0) + Number(item._sum.outputTokens ?? 0)
              const agent = item.agentProductId ? agentMap.get(item.agentProductId) : null
              return (
                <div key={item.agentProductId ?? 'unknown'} className="rounded-lg border border-border/60 p-3 text-xs">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-foreground">{agent?.name ?? '알 수 없는 Agent'}</p>
                    <p className="font-mono text-muted-foreground">{item._count}건</p>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-muted-foreground">
                    <span>토큰 {fmt(tokens)}</span>
                    <span>원가 {formatUsd(item._sum.costUsd)}</span>
                  </div>
                </div>
              )
            })}
            {agentUsage.length === 0 && <p className="py-8 text-center text-sm text-muted-foreground">오늘 Agent 사용 데이터가 없습니다.</p>}
          </div>
        </div>

        <div className="bg-card rounded-lg border border-border p-4">
          <h3 className="text-sm font-semibold text-foreground mb-4">오늘 합계</h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-lg border border-border/60 p-4">
              <p className="text-xs text-muted-foreground">총 요청</p>
              <p className="mt-1 text-2xl font-bold">{fmt(totalRequests)}</p>
            </div>
            <div className="rounded-lg border border-border/60 p-4">
              <p className="text-xs text-muted-foreground">총 토큰</p>
              <p className="mt-1 text-2xl font-bold">{fmt(totalTokens)}</p>
            </div>
            <div className="rounded-lg border border-border/60 p-4">
              <p className="text-xs text-muted-foreground">원가</p>
              <p className="mt-1 text-2xl font-bold">{formatUsd(totalCost)}</p>
            </div>
            <div className="rounded-lg border border-border/60 p-4">
              <p className="text-xs text-muted-foreground">고객 청구</p>
              <p className="mt-1 text-2xl font-bold">{formatUsd(todayEvents.reduce((sum, event) => sum + Number(event.chargedUsd ?? 0), 0))}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
