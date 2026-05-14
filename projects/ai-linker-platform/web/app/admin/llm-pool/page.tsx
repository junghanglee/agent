import { StatusBadge } from '@/components/admin/status-badge'
import { StatCard } from '@/components/admin/stat-card'
import { requireAdminPagePermission } from '@/lib/admin-auth'
import { formatUsd } from '@/lib/admin-format'
import { prisma } from '@/lib/prisma'
import { AlertTriangle, DollarSign, Server } from 'lucide-react'

export const dynamic = 'force-dynamic'

const statusBadge = (status: string) => {
  if (status === 'ACTIVE') return 'active'
  if (status === 'WARNING') return 'warning'
  if (status === 'CRITICAL') return 'critical'
  if (status === 'DISABLED') return 'inactive'
  return 'normal'
}

const percent = (value: unknown, total: unknown) => {
  const valueNumber = Number(value ?? 0)
  const totalNumber = Number(total ?? 0)
  if (totalNumber <= 0) return 0
  return Math.round((valueNumber / totalNumber) * 100)
}

export default async function LLMPoolPage() {
  await requireAdminPagePermission('LLM_POOL_READ')

  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
  const dayStart = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate())

  const [providers, accountCount, todayCost, monthCost, warningProviders, warningAccounts, modelUsage, providerUsage] = await Promise.all([
    prisma.lLMProvider.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        accounts: { orderBy: [{ status: 'asc' }, { priority: 'asc' }] },
        models: { orderBy: { displayName: 'asc' } },
      },
    }),
    prisma.lLMAccount.count(),
    prisma.usageEvent.aggregate({ where: { createdAt: { gte: dayStart } }, _sum: { costUsd: true, chargedUsd: true } }),
    prisma.usageEvent.aggregate({ where: { createdAt: { gte: monthStart } }, _sum: { costUsd: true, chargedUsd: true } }),
    prisma.lLMProvider.count({ where: { status: { in: ['WARNING', 'CRITICAL'] } } }),
    prisma.lLMAccount.count({ where: { status: { in: ['WARNING', 'CRITICAL'] } } }),
    prisma.usageEvent.groupBy({
      by: ['modelId'],
      where: { createdAt: { gte: dayStart }, modelId: { not: null } },
      _sum: { inputTokens: true, outputTokens: true, costUsd: true },
      _count: true,
      orderBy: { _sum: { costUsd: 'desc' } },
      take: 10,
    }),
    prisma.usageEvent.groupBy({
      by: ['providerId'],
      where: { createdAt: { gte: dayStart }, providerId: { not: null } },
      _sum: { costUsd: true },
      _count: true,
      orderBy: { _sum: { costUsd: 'desc' } },
      take: 8,
    }),
  ])

  const totalTodayCost = Number(todayCost._sum.costUsd ?? 0)
  const modelIds = modelUsage.map((item) => item.modelId).filter(Boolean) as string[]
  const providerIds = providerUsage.map((item) => item.providerId).filter(Boolean) as string[]
  const [modelsById, providersById] = await Promise.all([
    prisma.lLMModel.findMany({ where: { id: { in: modelIds } }, include: { provider: true } }),
    prisma.lLMProvider.findMany({ where: { id: { in: providerIds } } }),
  ])
  const modelMap = new Map(modelsById.map((model) => [model.id, model]))
  const providerMap = new Map(providersById.map((provider) => [provider.id, provider]))

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">LLM 계정 Pool</h1>
          <p className="text-sm text-muted-foreground mt-0.5">실제 AI 프로바이더 계정, 모델 단가 및 라우팅 상태</p>
        </div>
        <div className="rounded-md border border-dashed border-border px-3 py-2 text-xs text-muted-foreground">
          API Key 추가/수정은 암호화 저장 API 단계에서 연결
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard title="총 계정 수" value={`${accountCount}개`} icon={Server} iconColor="text-violet-600" iconBg="bg-violet-50" />
        <StatCard title="오늘 원가" value={formatUsd(todayCost._sum.costUsd)} icon={DollarSign} iconColor="text-cyan-600" iconBg="bg-cyan-50" />
        <StatCard title="이상 감지" value={`${warningProviders + warningAccounts}건`} icon={AlertTriangle} iconColor="text-amber-600" iconBg="bg-amber-50" />
        <StatCard title="이번달 원가" value={formatUsd(monthCost._sum.costUsd)} icon={DollarSign} iconColor="text-rose-600" iconBg="bg-rose-50" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-card rounded-lg border border-border p-4">
          <h3 className="text-sm font-semibold text-foreground mb-4">오늘 모델별 비용 TOP 10</h3>
          <div className="space-y-3">
            {modelUsage.map((item) => {
              const model = item.modelId ? modelMap.get(item.modelId) : null
              const cost = Number(item._sum.costUsd ?? 0)
              return (
                <div key={item.modelId ?? 'unknown'} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <div>
                      <span className="font-medium text-foreground">{model?.displayName ?? '알 수 없는 모델'}</span>
                      <span className="ml-2 text-muted-foreground">{model?.provider.name ?? 'Unknown'} · {item._count}건</span>
                    </div>
                    <span className="font-semibold">{formatUsd(cost)}</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div className="h-full rounded-full bg-violet-500" style={{ width: `${Math.max(4, percent(cost, totalTodayCost))}%` }} />
                  </div>
                </div>
              )
            })}
            {modelUsage.length === 0 && <p className="py-8 text-center text-sm text-muted-foreground">오늘 LLM 사용 데이터가 없습니다.</p>}
          </div>
        </div>

        <div className="bg-card rounded-lg border border-border p-4">
          <h3 className="text-sm font-semibold text-foreground mb-4">오늘 Provider 라우팅 비중</h3>
          <div className="space-y-3">
            {providerUsage.map((item) => {
              const provider = item.providerId ? providerMap.get(item.providerId) : null
              const cost = Number(item._sum.costUsd ?? 0)
              return (
                <div key={item.providerId ?? 'unknown'} className="flex items-center justify-between rounded-lg border border-border/60 p-3 text-xs">
                  <div>
                    <p className="font-semibold text-foreground">{provider?.name ?? 'Unknown Provider'}</p>
                    <p className="text-muted-foreground mt-0.5">{item._count}건 · {percent(cost, totalTodayCost)}%</p>
                  </div>
                  <p className="font-bold text-foreground">{formatUsd(cost)}</p>
                </div>
              )
            })}
            {providerUsage.length === 0 && <p className="py-8 text-center text-sm text-muted-foreground">오늘 라우팅 데이터가 없습니다.</p>}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {providers.map((provider) => (
          <div key={provider.id} className="bg-card rounded-lg border border-border overflow-hidden">
            <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-muted/20">
              <h3 className="text-sm font-semibold text-foreground">{provider.name}</h3>
              <StatusBadge status={statusBadge(provider.status)} />
              <span className="text-xs text-muted-foreground">계정 {provider.accounts.length}개 · 모델 {provider.models.length}개 · type {provider.type}</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border/50 bg-muted/10">
                    <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">계정명</th>
                    <th className="text-right px-4 py-2.5 font-medium text-muted-foreground">월 한도</th>
                    <th className="text-right px-4 py-2.5 font-medium text-muted-foreground">이번달 사용</th>
                    <th className="text-center px-4 py-2.5 font-medium text-muted-foreground">우선순위</th>
                    <th className="text-center px-4 py-2.5 font-medium text-muted-foreground">상태</th>
                  </tr>
                </thead>
                <tbody>
                  {provider.accounts.map((account) => (
                    <tr key={account.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3 font-medium">{account.name}</td>
                      <td className="px-4 py-3 text-right font-semibold">{formatUsd(account.monthlyLimitUsd)}</td>
                      <td className="px-4 py-3 text-right text-muted-foreground">{formatUsd(account.usedThisMonthUsd)}</td>
                      <td className="px-4 py-3 text-center font-mono text-muted-foreground">{account.priority}</td>
                      <td className="px-4 py-3 text-center"><StatusBadge status={statusBadge(account.status)} /></td>
                    </tr>
                  ))}
                  {provider.accounts.length === 0 && (
                    <tr><td colSpan={5} className="px-4 py-8 text-center text-sm text-muted-foreground">등록된 LLM 계정이 없습니다.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 p-4 bg-muted/10">
              {provider.models.map((model) => (
                <div key={model.id} className="rounded-lg border border-border bg-card p-3 text-xs">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-semibold text-foreground truncate">{model.displayName}</p>
                    <StatusBadge status={statusBadge(model.status)} />
                  </div>
                  <p className="mt-1 font-mono text-[11px] text-muted-foreground truncate">{model.modelName}</p>
                  <div className="mt-3 grid grid-cols-2 gap-2 text-muted-foreground">
                    <div>원가 In <b className="text-foreground">{formatUsd(model.inputCostPer1M)}</b></div>
                    <div>원가 Out <b className="text-foreground">{formatUsd(model.outputCostPer1M)}</b></div>
                    <div>판매 In <b className="text-foreground">{formatUsd(model.saleInputPricePer1M)}</b></div>
                    <div>판매 Out <b className="text-foreground">{formatUsd(model.saleOutputPricePer1M)}</b></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
        {providers.length === 0 && <div className="rounded-lg border border-border bg-card p-8 text-center text-sm text-muted-foreground">등록된 LLM Provider가 없습니다.</div>}
      </div>
    </div>
  )
}
