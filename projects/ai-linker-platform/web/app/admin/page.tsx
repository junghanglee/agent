import { StatCard } from '@/components/admin/stat-card'
import { StatusBadge } from '@/components/admin/status-badge'
import { DashboardCharts } from '@/components/admin/dashboard-charts'
import { requireAdminPagePermission } from '@/lib/admin-auth'
import { prisma } from '@/lib/prisma'
import { formatKrw, formatUsd, statusToBadge } from '@/lib/admin-format'
import {
  DollarSign,
  TrendingUp,
  UserPlus,
  ShoppingBag,
  KeyRound,
  Shield,
  Zap,
  Server,
  BarChart3,
  MessageCircle,
} from 'lucide-react'

export const dynamic = 'force-dynamic'

const todayStart = () => {
  const date = new Date()
  date.setHours(0, 0, 0, 0)
  return date
}

const monthStart = () => {
  const date = new Date()
  date.setDate(1)
  date.setHours(0, 0, 0, 0)
  return date
}

export default async function AdminDashboard() {
  await requireAdminPagePermission('DASHBOARD_READ')

  const [
    todayPayments,
    monthPayments,
    newUsersToday,
    newPurchasesToday,
    installCodes,
    activeLicenses,
    creditTransactions,
    usageTotals,
    openTickets,
    recentOrders,
    recentInstallCodes,
    pendingSupport,
    llmAlerts,
  ] = await Promise.all([
    prisma.payment.aggregate({
      where: { status: 'PAID', paidAt: { gte: todayStart() } },
      _sum: { amount: true },
    }),
    prisma.payment.aggregate({
      where: { status: 'PAID', paidAt: { gte: monthStart() } },
      _sum: { amount: true },
    }),
    prisma.user.count({ where: { createdAt: { gte: todayStart() } } }),
    prisma.purchase.count({ where: { status: 'PAID', createdAt: { gte: todayStart() } } }),
    prisma.installCode.count(),
    prisma.license.count({ where: { status: 'ACTIVE' } }),
    prisma.creditTransaction.aggregate({
      where: { type: 'CHARGE' },
      _sum: { amountUsd: true },
    }),
    prisma.usageEvent.aggregate({
      _sum: { costUsd: true, chargedUsd: true },
    }),
    prisma.supportTicket.count({ where: { status: { in: ['OPEN', 'IN_PROGRESS', 'WAITING_CUSTOMER'] } } }),
    prisma.purchase.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { name: true } },
        agentProduct: { select: { name: true } },
      },
    }),
    prisma.installCode.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { name: true } },
        purchase: {
          include: { agentProduct: { select: { name: true } } },
        },
      },
    }),
    prisma.supportTicket.findMany({
      take: 5,
      where: { status: { in: ['OPEN', 'IN_PROGRESS', 'WAITING_CUSTOMER'] } },
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { name: true } } },
    }),
    prisma.lLMAccount.findMany({
      take: 5,
      where: { status: { in: ['WARNING', 'CRITICAL'] } },
      orderBy: [{ status: 'asc' }, { priority: 'asc' }],
      include: { provider: { select: { name: true } } },
    }),
  ])

  const revenueToday = Number(todayPayments._sum.amount ?? 0)
  const revenueMonth = Number(monthPayments._sum.amount ?? 0)
  const tokenChargeUsd = Number(creditTransactions._sum.amountUsd ?? 0)
  const llmCostUsd = Number(usageTotals._sum.costUsd ?? 0)
  const llmChargedUsd = Number(usageTotals._sum.chargedUsd ?? 0)
  const marginUsd = llmChargedUsd - llmCostUsd

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-foreground">대시보드</h1>
        <p className="text-sm text-muted-foreground mt-0.5">AI Linker 플랫폼 운영 현황 — 실데이터 연결</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        <StatCard title="오늘 매출" value={formatKrw(revenueToday)} change="실시간" changeType="neutral" icon={DollarSign} iconColor="text-violet-600" iconBg="bg-violet-50" />
        <StatCard title="월 누적 매출" value={formatKrw(revenueMonth)} change="이번 달" changeType="neutral" icon={TrendingUp} iconColor="text-cyan-600" iconBg="bg-cyan-50" />
        <StatCard title="신규 가입자" value={newUsersToday.toLocaleString()} change="오늘" changeType="up" icon={UserPlus} iconColor="text-blue-600" iconBg="bg-blue-50" />
        <StatCard title="신규 구매자" value={newPurchasesToday.toLocaleString()} change="오늘" changeType="up" icon={ShoppingBag} iconColor="text-indigo-600" iconBg="bg-indigo-50" />
        <StatCard title="설치코드 발급" value={installCodes.toLocaleString()} change="누적" changeType="neutral" icon={KeyRound} iconColor="text-emerald-600" iconBg="bg-emerald-50" />
        <StatCard title="활성 라이선스" value={activeLicenses.toLocaleString()} change="현재" changeType="neutral" icon={Shield} iconColor="text-teal-600" iconBg="bg-teal-50" />
        <StatCard title="토큰 충전액" value={formatUsd(tokenChargeUsd)} change="누적" changeType="neutral" icon={Zap} iconColor="text-yellow-600" iconBg="bg-yellow-50" />
        <StatCard title="LLM 원가" value={formatUsd(llmCostUsd)} change="누적" changeType="down" icon={Server} iconColor="text-orange-600" iconBg="bg-orange-50" />
        <StatCard title="예상 마진" value={formatUsd(marginUsd)} change="누적" changeType={marginUsd >= 0 ? 'up' : 'down'} icon={BarChart3} iconColor="text-violet-600" iconBg="bg-violet-50" />
        <StatCard title="미처리 상담" value={openTickets.toLocaleString()} change="현재" changeType={openTickets > 0 ? 'down' : 'neutral'} icon={MessageCircle} iconColor="text-rose-600" iconBg="bg-rose-50" />
      </div>

      <DashboardCharts />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-card rounded-lg border border-border">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <h3 className="text-sm font-semibold text-foreground">최근 주문</h3>
            <a href="/admin/payments" className="text-xs text-primary hover:underline">전체 보기</a>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead><tr className="border-b border-border bg-muted/40"><th className="text-left px-4 py-2 font-medium text-muted-foreground">주문ID</th><th className="text-left px-4 py-2 font-medium text-muted-foreground">고객</th><th className="text-left px-4 py-2 font-medium text-muted-foreground">상품</th><th className="text-right px-4 py-2 font-medium text-muted-foreground">금액</th><th className="text-center px-4 py-2 font-medium text-muted-foreground">상태</th></tr></thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-2.5 font-mono text-muted-foreground">{order.id.slice(-8)}</td>
                    <td className="px-4 py-2.5 font-medium">{order.user.name}</td>
                    <td className="px-4 py-2.5 text-muted-foreground truncate max-w-[120px]">{order.agentProduct?.name ?? '토큰/Skill'}</td>
                    <td className="px-4 py-2.5 text-right font-medium">{formatKrw(order.totalAmount)}</td>
                    <td className="px-4 py-2.5 text-center"><StatusBadge status={statusToBadge(order.status)} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-card rounded-lg border border-border">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border"><h3 className="text-sm font-semibold text-foreground">최근 설치코드 발급</h3><a href="/admin/licenses" className="text-xs text-primary hover:underline">전체 보기</a></div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead><tr className="border-b border-border bg-muted/40"><th className="text-left px-4 py-2 font-medium text-muted-foreground">코드</th><th className="text-left px-4 py-2 font-medium text-muted-foreground">고객</th><th className="text-left px-4 py-2 font-medium text-muted-foreground">상품</th><th className="text-center px-4 py-2 font-medium text-muted-foreground">상태</th></tr></thead>
              <tbody>{recentInstallCodes.map((item) => (<tr key={item.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors"><td className="px-4 py-2.5 font-mono text-muted-foreground">{item.code}</td><td className="px-4 py-2.5 font-medium">{item.user.name}</td><td className="px-4 py-2.5 text-muted-foreground">{item.purchase.agentProduct?.name ?? '—'}</td><td className="px-4 py-2.5 text-center"><StatusBadge status={statusToBadge(item.status)} /></td></tr>))}</tbody>
            </table>
          </div>
        </div>

        <div className="bg-card rounded-lg border border-border">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border"><h3 className="text-sm font-semibold text-foreground">미처리 상담</h3><a href="/admin/support" className="text-xs text-primary hover:underline">전체 보기</a></div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead><tr className="border-b border-border bg-muted/40"><th className="text-left px-4 py-2 font-medium text-muted-foreground">티켓</th><th className="text-left px-4 py-2 font-medium text-muted-foreground">고객</th><th className="text-left px-4 py-2 font-medium text-muted-foreground">제목</th><th className="text-center px-4 py-2 font-medium text-muted-foreground">상태</th></tr></thead>
              <tbody>{pendingSupport.map((ticket) => (<tr key={ticket.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors"><td className="px-4 py-2.5 font-mono text-muted-foreground">{ticket.id.slice(-8)}</td><td className="px-4 py-2.5 font-medium">{ticket.user.name}</td><td className="px-4 py-2.5 text-muted-foreground">{ticket.subject}</td><td className="px-4 py-2.5 text-center"><StatusBadge status={statusToBadge(ticket.status)} /></td></tr>))}</tbody>
            </table>
          </div>
        </div>

        <div className="bg-card rounded-lg border border-border">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border"><h3 className="text-sm font-semibold text-foreground">LLM 계정 이상 알림</h3><a href="/admin/llm-pool" className="text-xs text-primary hover:underline">전체 보기</a></div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead><tr className="border-b border-border bg-muted/40"><th className="text-left px-4 py-2 font-medium text-muted-foreground">Provider</th><th className="text-left px-4 py-2 font-medium text-muted-foreground">계정</th><th className="text-left px-4 py-2 font-medium text-muted-foreground">사용액/한도</th><th className="text-center px-4 py-2 font-medium text-muted-foreground">상태</th></tr></thead>
              <tbody>{llmAlerts.map((alert) => (<tr key={alert.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors"><td className="px-4 py-2.5 font-medium">{alert.provider.name}</td><td className="px-4 py-2.5 font-mono text-muted-foreground">{alert.name}</td><td className="px-4 py-2.5 text-muted-foreground">{formatUsd(alert.usedThisMonthUsd)} / {formatUsd(alert.monthlyLimitUsd)}</td><td className="px-4 py-2.5 text-center"><StatusBadge status={statusToBadge(alert.status)} /></td></tr>))}</tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
