import { StatusBadge } from '@/components/admin/status-badge'
import { Search, Filter, UserPlus, ChevronDown } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { prisma } from '@/lib/prisma'
import { formatDate, formatKrw, formatUsd, statusToBadge } from '@/lib/admin-format'

export default async function CustomersPage() {
  const customers = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      creditWallet: true,
      purchases: { where: { status: 'PAID' }, select: { totalAmount: true } },
      licenses: { select: { status: true } },
      _count: { select: { licenses: true, purchases: true, supportTickets: true } },
    },
  })

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">고객관리</h1>
          <p className="text-sm text-muted-foreground mt-0.5">전체 고객 {customers.length}명 — DB 실데이터</p>
        </div>
        <Button size="sm" className="gap-1.5" disabled title="Gate 5에서 회원 관리 연결">
          <UserPlus className="w-3.5 h-3.5" />
          고객 추가
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input placeholder="이름, 이메일, ID 검색은 Gate 4에서 연결" className="pl-9 h-8 text-sm" disabled />
        </div>
        <Button variant="outline" size="sm" className="gap-1.5 h-8" disabled>
          <Filter className="w-3.5 h-3.5" />
          필터
          <ChevronDown className="w-3 h-3" />
        </Button>
      </div>

      <div className="bg-card rounded-lg border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">고객ID / 이름</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">이메일</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">가입일</th>
                <th className="text-center px-4 py-3 font-medium text-muted-foreground">보유 Agent</th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground">크레딧 잔액</th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground">결제금액</th>
                <th className="text-center px-4 py-3 font-medium text-muted-foreground">라이선스</th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground">상담</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((customer) => {
                const paidTotal = customer.purchases.reduce((sum, purchase) => sum + Number(purchase.totalAmount), 0)
                const activeLicense = customer.licenses.find((license) => license.status === 'ACTIVE')
                const licenseStatus = activeLicense?.status ?? customer.licenses[0]?.status ?? 'inactive'

                return (
                  <tr key={customer.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3"><div className="font-medium text-foreground">{customer.name}</div><div className="text-muted-foreground font-mono mt-0.5">{customer.id.slice(-8)}</div></td>
                    <td className="px-4 py-3 text-muted-foreground">{customer.email}</td>
                    <td className="px-4 py-3 text-muted-foreground">{formatDate(customer.createdAt)}</td>
                    <td className="px-4 py-3 text-center font-medium">{customer._count.licenses}</td>
                    <td className="px-4 py-3 text-right font-medium tabular-nums">{formatUsd(customer.creditWallet?.balanceUsd)}</td>
                    <td className="px-4 py-3 text-right font-medium">{formatKrw(paidTotal)}</td>
                    <td className="px-4 py-3 text-center"><StatusBadge status={statusToBadge(licenseStatus)} /></td>
                    <td className="px-4 py-3 text-right text-muted-foreground">{customer._count.supportTickets}</td>
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
