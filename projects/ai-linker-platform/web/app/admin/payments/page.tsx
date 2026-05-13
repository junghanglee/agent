'use client'

import { useState } from 'react'
import { StatusBadge } from '@/components/admin/status-badge'
import { StatCard } from '@/components/admin/stat-card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DollarSign, TrendingUp, RefreshCw, AlertCircle, Search, Filter } from 'lucide-react'

const payments = [
  { id: 'PAY-2401', customer: '김민준', product: 'AI Writer Pro', amount: '₩89,000', provider: 'Stripe', status: 'paid' as const, paidAt: '2025-01-10 14:32' },
  { id: 'PAY-2400', customer: '이서연', product: 'Sales Copilot', amount: '₩129,000', provider: 'Toss', status: 'paid' as const, paidAt: '2025-01-10 12:15' },
  { id: 'PAY-2399', customer: '박도현', product: 'Token Pack 100K', amount: '₩15,000', provider: 'Stripe', status: 'pending' as const, paidAt: '2025-01-09 09:48' },
  { id: 'PAY-2398', customer: '최수아', product: 'Data Analyst', amount: '₩99,000', provider: 'KakaoPay', status: 'paid' as const, paidAt: '2025-01-09 08:22' },
  { id: 'PAY-2397', customer: '정예준', product: 'AI Writer Pro', amount: '₩89,000', provider: 'Stripe', status: 'refunded' as const, paidAt: '2025-01-08 17:05' },
  { id: 'PAY-2396', customer: '윤하늘', product: 'Token Pack 50K', amount: '₩12,000', provider: 'Toss', status: 'paid' as const, paidAt: '2025-01-08 11:33' },
  { id: 'PAY-2395', customer: '강지호', product: 'Code Helper', amount: '₩79,000', provider: 'Stripe', status: 'failed' as const, paidAt: '2025-01-07 20:18' },
  { id: 'PAY-2394', customer: '조민서', product: 'Sales Copilot', amount: '₩129,000', provider: 'KakaoPay', status: 'paid' as const, paidAt: '2025-01-07 15:44' },
]

export default function PaymentsPage() {
  const [search, setSearch] = useState('')

  const filtered = payments.filter(
    (p) => p.customer.includes(search) || p.id.toLowerCase().includes(search.toLowerCase()) || p.product.includes(search)
  )

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-foreground">결제관리</h1>
        <p className="text-sm text-muted-foreground mt-0.5">결제 내역 및 구독 현황</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard title="이번 달 결제" value="₩28.7M" change="+8%" changeType="up" icon={DollarSign} iconColor="text-violet-600" iconBg="bg-violet-50" />
        <StatCard title="이번 달 건수" value="312" change="+24" changeType="up" icon={TrendingUp} iconColor="text-cyan-600" iconBg="bg-cyan-50" />
        <StatCard title="환불 처리" value="₩356K" change="4건" changeType="neutral" icon={RefreshCw} iconColor="text-amber-600" iconBg="bg-amber-50" />
        <StatCard title="결제 실패" value="7" change="2.2%" changeType="down" icon={AlertCircle} iconColor="text-rose-600" iconBg="bg-rose-50" />
      </div>

      {/* Filter */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input placeholder="고객, 주문번호 검색..." className="pl-9 h-8 text-sm" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Button variant="outline" size="sm" className="gap-1.5 h-8">
          <Filter className="w-3.5 h-3.5" />
          필터
        </Button>
        <select className="h-8 bg-background border border-border rounded-md px-3 text-xs focus:outline-none focus:ring-1 focus:ring-primary">
          <option>전체 상태</option>
          <option>결제완료</option>
          <option>환불</option>
          <option>실패</option>
          <option>대기중</option>
        </select>
        <select className="h-8 bg-background border border-border rounded-md px-3 text-xs focus:outline-none focus:ring-1 focus:ring-primary">
          <option>전체 Provider</option>
          <option>Stripe</option>
          <option>Toss</option>
          <option>KakaoPay</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-card rounded-lg border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">주문번호</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">고객</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">상품</th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground">금액</th>
                <th className="text-center px-4 py-3 font-medium text-muted-foreground">Provider</th>
                <th className="text-center px-4 py-3 font-medium text-muted-foreground">상태</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">결제일시</th>
                <th className="text-center px-4 py-3 font-medium text-muted-foreground">액션</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((payment) => (
                <tr key={payment.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 font-mono text-muted-foreground">{payment.id}</td>
                  <td className="px-4 py-3 font-medium">{payment.customer}</td>
                  <td className="px-4 py-3 text-muted-foreground">{payment.product}</td>
                  <td className="px-4 py-3 text-right font-semibold">{payment.amount}</td>
                  <td className="px-4 py-3 text-center">
                    <span className="bg-muted text-muted-foreground px-2 py-0.5 rounded text-[11px]">{payment.provider}</span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <StatusBadge status={payment.status} />
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{payment.paidAt}</td>
                  <td className="px-4 py-3 text-center">
                    {payment.status === 'paid' && (
                      <button className="px-2 py-1 text-[11px] border border-amber-200 text-amber-700 bg-amber-50 rounded hover:bg-amber-100 transition-colors">
                        환불
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
