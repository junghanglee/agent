import { StatusBadge } from '@/components/admin/status-badge'
import { StatCard } from '@/components/admin/stat-card'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { requireAdminPagePermission } from '@/lib/admin-auth'
import { formatDate, formatUsd } from '@/lib/admin-format'
import { prisma } from '@/lib/prisma'
import { AlertTriangle, Coins, Gift, Search, TrendingUp } from 'lucide-react'

export const dynamic = 'force-dynamic'

type TokensPageProps = {
  searchParams: Promise<{ q?: string }>
}

const monthStart = () => {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), 1)
}

const transactionTypeLabel: Record<string, string> = {
  CHARGE: '충전',
  GRANT_INITIAL: '초기지급',
  USAGE_DEDUCTION: '사용차감',
  REFUND: '환불',
  MANUAL_ADJUSTMENT: '관리자조정',
}

const transactionTypeClass: Record<string, string> = {
  CHARGE: 'bg-violet-50 text-violet-700',
  GRANT_INITIAL: 'bg-emerald-50 text-emerald-700',
  USAGE_DEDUCTION: 'bg-rose-50 text-rose-700',
  REFUND: 'bg-amber-50 text-amber-700',
  MANUAL_ADJUSTMENT: 'bg-cyan-50 text-cyan-700',
}

type WalletBadge = 'active' | 'suspended' | 'failed' | 'warning'

function walletState(balanceUsd: unknown, status: string): { label: string; className: string; badge: WalletBadge } {
  const balance = Number(balanceUsd ?? 0)
  if (status !== 'ACTIVE') return { label: '정지', className: 'text-rose-600', badge: 'suspended' }
  if (balance <= 0) return { label: '소진', className: 'text-rose-600', badge: 'failed' }
  if (balance < 5) return { label: '부족', className: 'text-amber-600', badge: 'warning' }
  return { label: '정상', className: 'text-emerald-600', badge: 'active' }
}

export default async function TokensPage({ searchParams }: TokensPageProps) {
  await requireAdminPagePermission('TOKENS_READ')

  const { q = '' } = await searchParams
  const query = q.trim()
  const currentMonthStart = monthStart()

  const [wallets, transactions, totalBalance, monthlyCharges, lowBalanceCount, usersWithoutWallet] = await Promise.all([
    prisma.creditWallet.findMany({
      where: query
        ? {
            OR: [
              { user: { name: { contains: query } } },
              { user: { email: { contains: query } } },
            ],
          }
        : undefined,
      take: 100,
      orderBy: { updatedAt: 'desc' },
      include: {
        user: { select: { id: true, name: true, email: true, createdAt: true } },
        transactions: { take: 1, orderBy: { createdAt: 'desc' } },
      },
    }),
    prisma.creditTransaction.findMany({
      take: 50,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, name: true, email: true } },
        relatedPayment: { select: { id: true, amount: true, provider: true, status: true } },
      },
    }),
    prisma.creditWallet.aggregate({ _sum: { balanceUsd: true } }),
    prisma.creditTransaction.aggregate({
      where: { type: { in: ['CHARGE', 'GRANT_INITIAL', 'MANUAL_ADJUSTMENT'] }, createdAt: { gte: currentMonthStart }, amountUsd: { gt: 0 } },
      _sum: { amountUsd: true },
    }),
    prisma.creditWallet.count({ where: { status: 'ACTIVE', balanceUsd: { lt: 5 } } }),
    prisma.user.count({ where: { status: 'ACTIVE', creditWallet: null } }),
  ])

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">토큰 / 크레딧</h1>
          <p className="text-sm text-muted-foreground mt-0.5">실제 고객 크레딧 지갑 및 충전/차감 내역</p>
        </div>
        <div className="rounded-md border border-dashed border-border px-3 py-2 text-xs text-muted-foreground">
          수동 지급/차감 액션은 다음 단계에서 권한/AuditLog와 함께 연결
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard title="총 크레딧 잔액" value={formatUsd(totalBalance._sum.balanceUsd)} icon={Coins} iconColor="text-violet-600" iconBg="bg-violet-50" />
        <StatCard title="이번달 충전/지급" value={formatUsd(monthlyCharges._sum.amountUsd)} icon={TrendingUp} iconColor="text-cyan-600" iconBg="bg-cyan-50" />
        <StatCard title="잔액 부족 알림" value={`${lowBalanceCount}명`} icon={AlertTriangle} iconColor="text-amber-600" iconBg="bg-amber-50" />
        <StatCard title="지갑 미생성 고객" value={`${usersWithoutWallet}명`} icon={Gift} iconColor="text-emerald-600" iconBg="bg-emerald-50" />
      </div>

      <Tabs defaultValue="wallets">
        <TabsList>
          <TabsTrigger value="wallets" className="text-xs">지갑 현황</TabsTrigger>
          <TabsTrigger value="history" className="text-xs">충전/차감 내역</TabsTrigger>
          <TabsTrigger value="pricing" className="text-xs">요금제</TabsTrigger>
        </TabsList>

        <TabsContent value="wallets" className="mt-4 space-y-4">
          <form className="relative max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input name="q" placeholder="고객명/이메일 검색..." className="pl-9 h-8 text-sm" defaultValue={query} />
          </form>
          <div className="bg-card rounded-lg border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border bg-muted/40">
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">고객</th>
                    <th className="text-right px-4 py-3 font-medium text-muted-foreground">크레딧 잔액</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">최근 변동</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">가입일</th>
                    <th className="text-center px-4 py-3 font-medium text-muted-foreground">상태</th>
                  </tr>
                </thead>
                <tbody>
                  {wallets.map((wallet) => {
                    const state = walletState(wallet.balanceUsd, wallet.status)
                    const latest = wallet.transactions[0]
                    return (
                      <tr key={wallet.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3">
                          <p className="font-medium">{wallet.user.name}</p>
                          <p className="font-mono text-[11px] text-muted-foreground">{wallet.user.email}</p>
                        </td>
                        <td className={`px-4 py-3 text-right font-bold tabular-nums ${state.className}`}>{formatUsd(wallet.balanceUsd)}</td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {latest ? `${transactionTypeLabel[latest.type]} · ${formatUsd(latest.amountUsd)} · ${formatDate(latest.createdAt)}` : '—'}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">{formatDate(wallet.user.createdAt)}</td>
                        <td className="px-4 py-3 text-center"><StatusBadge status={state.badge} /></td>
                      </tr>
                    )
                  })}
                  {wallets.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-4 py-10 text-center text-sm text-muted-foreground">조건에 맞는 크레딧 지갑이 없습니다.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="history" className="mt-4">
          <div className="bg-card rounded-lg border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border bg-muted/40">
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">고객</th>
                    <th className="text-right px-4 py-3 font-medium text-muted-foreground">크레딧</th>
                    <th className="text-center px-4 py-3 font-medium text-muted-foreground">유형</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">사유</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">관련 결제</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">일시</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((item) => (
                    <tr key={item.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-medium">{item.user.name}</p>
                        <p className="font-mono text-[11px] text-muted-foreground">{item.user.email}</p>
                      </td>
                      <td className={`px-4 py-3 text-right font-semibold ${Number(item.amountUsd) >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>{formatUsd(item.amountUsd)}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${transactionTypeClass[item.type] ?? 'bg-muted text-muted-foreground'}`}>
                          {transactionTypeLabel[item.type] ?? item.type}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{item.reason}</td>
                      <td className="px-4 py-3 font-mono text-[11px] text-muted-foreground">{item.relatedPayment ? `${item.relatedPayment.provider} · ${formatUsd(item.relatedPayment.amount)}` : '—'}</td>
                      <td className="px-4 py-3 text-muted-foreground">{formatDate(item.createdAt)}</td>
                    </tr>
                  ))}
                  {transactions.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-4 py-10 text-center text-sm text-muted-foreground">크레딧 거래 내역이 없습니다.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="pricing" className="mt-4">
          <div className="rounded-lg border border-dashed border-border bg-card p-6 text-sm text-muted-foreground">
            크레딧 상품/요금제 관리는 결제 연동 단계에서 `SkillProduct` 또는 별도 `CreditPlan` 모델로 분리해 연결할 예정입니다.
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
