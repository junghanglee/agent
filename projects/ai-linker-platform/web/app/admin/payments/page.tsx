import { StatusBadge } from '@/components/admin/status-badge'
import { StatCard } from '@/components/admin/stat-card'
import { Input } from '@/components/ui/input'
import { requireAdminPagePermission } from '@/lib/admin-auth'
import { formatDate, formatKrw, statusToBadge } from '@/lib/admin-format'
import { prisma } from '@/lib/prisma'
import { AlertCircle, DollarSign, RefreshCw, Search, TrendingUp } from 'lucide-react'

export const dynamic = 'force-dynamic'

type PaymentsPageProps = {
  searchParams: Promise<{ q?: string; status?: string; provider?: string }>
}

const monthStart = () => {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), 1)
}

export default async function PaymentsPage({ searchParams }: PaymentsPageProps) {
  await requireAdminPagePermission('PAYMENTS_READ')

  const { q = '', status = '', provider = '' } = await searchParams
  const query = q.trim()
  const currentMonthStart = monthStart()

  const where = {
    ...(status ? { status: status as never } : {}),
    ...(provider ? { provider } : {}),
    ...(query
      ? {
          OR: [
            { id: { contains: query } },
            { paymentKey: { contains: query } },
            { provider: { contains: query } },
            { purchase: { user: { name: { contains: query } } } },
            { purchase: { user: { email: { contains: query } } } },
            { purchase: { agentProduct: { name: { contains: query } } } },
          ],
        }
      : {}),
  }

  const [payments, monthPaidAggregate, monthPaidCount, refundedAggregate, failedCount, providers] = await Promise.all([
    prisma.payment.findMany({
      where,
      take: 100,
      orderBy: { createdAt: 'desc' },
      include: {
        purchase: {
          include: {
            user: { select: { id: true, name: true, email: true } },
            agentProduct: { select: { id: true, name: true, slug: true } },
          },
        },
      },
    }),
    prisma.payment.aggregate({
      where: { status: 'PAID', createdAt: { gte: currentMonthStart } },
      _sum: { amount: true },
    }),
    prisma.payment.count({ where: { status: 'PAID', createdAt: { gte: currentMonthStart } } }),
    prisma.payment.aggregate({
      where: { status: 'REFUNDED', createdAt: { gte: currentMonthStart } },
      _sum: { amount: true },
      _count: true,
    }),
    prisma.payment.count({ where: { status: 'FAILED', createdAt: { gte: currentMonthStart } } }),
    prisma.payment.findMany({ distinct: ['provider'], select: { provider: true }, orderBy: { provider: 'asc' } }),
  ])

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-foreground">결제관리</h1>
        <p className="text-sm text-muted-foreground mt-0.5">실제 결제 내역 및 구독 현황</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard title="이번 달 결제" value={formatKrw(monthPaidAggregate._sum.amount)} icon={DollarSign} iconColor="text-violet-600" iconBg="bg-violet-50" />
        <StatCard title="이번 달 건수" value={`${monthPaidCount}건`} icon={TrendingUp} iconColor="text-cyan-600" iconBg="bg-cyan-50" />
        <StatCard title="환불 처리" value={formatKrw(refundedAggregate._sum.amount)} change={`${refundedAggregate._count}건`} changeType="neutral" icon={RefreshCw} iconColor="text-amber-600" iconBg="bg-amber-50" />
        <StatCard title="결제 실패" value={`${failedCount}건`} icon={AlertCircle} iconColor="text-rose-600" iconBg="bg-rose-50" />
      </div>

      <form className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-56 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input name="q" placeholder="고객, 주문번호, 상품 검색..." className="pl-9 h-8 text-sm" defaultValue={query} />
        </div>
        <select name="status" defaultValue={status} className="h-8 bg-background border border-border rounded-md px-3 text-xs focus:outline-none focus:ring-1 focus:ring-primary">
          <option value="">전체 상태</option>
          <option value="PAID">결제완료</option>
          <option value="PENDING">대기중</option>
          <option value="REFUNDED">환불</option>
          <option value="FAILED">실패</option>
          <option value="CANCELLED">취소</option>
        </select>
        <select name="provider" defaultValue={provider} className="h-8 bg-background border border-border rounded-md px-3 text-xs focus:outline-none focus:ring-1 focus:ring-primary">
          <option value="">전체 Provider</option>
          {providers.map((item) => <option key={item.provider} value={item.provider}>{item.provider}</option>)}
        </select>
        <button className="h-8 rounded-md border border-border bg-card px-3 text-xs font-medium hover:bg-muted" type="submit">검색</button>
      </form>

      <div className="bg-card rounded-lg border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">결제 ID</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">고객</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">상품</th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground">금액</th>
                <th className="text-center px-4 py-3 font-medium text-muted-foreground">Provider</th>
                <th className="text-center px-4 py-3 font-medium text-muted-foreground">상태</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">결제일시</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Payment Key</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment) => (
                <tr key={payment.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 font-mono text-muted-foreground">{payment.id.slice(0, 12)}</td>
                  <td className="px-4 py-3">
                    <p className="font-medium">{payment.purchase?.user.name ?? '—'}</p>
                    <p className="font-mono text-[11px] text-muted-foreground">{payment.purchase?.user.email ?? '구매 연결 없음'}</p>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{payment.purchase?.agentProduct?.name ?? '토큰/기타 결제'}</td>
                  <td className="px-4 py-3 text-right font-semibold">{formatKrw(payment.amount)}</td>
                  <td className="px-4 py-3 text-center">
                    <span className="bg-muted text-muted-foreground px-2 py-0.5 rounded text-[11px]">{payment.provider}</span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <StatusBadge status={statusToBadge(payment.status)} />
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{formatDate(payment.paidAt ?? payment.createdAt)}</td>
                  <td className="px-4 py-3 font-mono text-[11px] text-muted-foreground">{payment.paymentKey ?? '—'}</td>
                </tr>
              ))}
              {payments.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-sm text-muted-foreground">조건에 맞는 결제 내역이 없습니다.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
