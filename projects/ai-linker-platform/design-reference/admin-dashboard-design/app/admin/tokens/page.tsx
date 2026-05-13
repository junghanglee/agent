'use client'

import { useState } from 'react'
import { StatCard } from '@/components/admin/stat-card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Coins, TrendingUp, AlertTriangle, Gift, Plus, Minus, Search } from 'lucide-react'

const wallets = [
  { customer: '김민준', balance: '48,200', lastCharge: '2025-01-10', totalCharged: '₩36,000', status: 'normal' },
  { customer: '이서연', balance: '12,500', lastCharge: '2025-01-08', totalCharged: '₩24,000', status: 'normal' },
  { customer: '박도현', balance: '0', lastCharge: '2024-12-20', totalCharged: '₩12,000', status: 'empty' },
  { customer: '최수아', balance: '95,800', lastCharge: '2025-01-11', totalCharged: '₩84,000', status: 'normal' },
  { customer: '정예준', balance: '3,100', lastCharge: '2024-12-15', totalCharged: '₩24,000', status: 'low' },
  { customer: '윤하늘', balance: '9,800', lastCharge: '2025-01-05', totalCharged: '₩12,000', status: 'normal' },
  { customer: '강지호', balance: '22,400', lastCharge: '2025-01-09', totalCharged: '₩36,000', status: 'normal' },
  { customer: '조민서', balance: '134,000', lastCharge: '2025-01-13', totalCharged: '₩120,000', status: 'normal' },
]

const chargeHistory = [
  { customer: '조민서', amount: '₩30,000', tokens: '+100,000', type: '구매', date: '2025-01-13 11:22' },
  { customer: '최수아', amount: '₩12,000', tokens: '+50,000', type: '구매', date: '2025-01-11 09:18' },
  { customer: '김민준', amount: '₩12,000', tokens: '+50,000', type: '구매', date: '2025-01-10 15:44' },
  { customer: '이서연', amount: '—', tokens: '+10,000', type: '관리자지급', date: '2025-01-09 11:02' },
  { customer: '윤하늘', amount: '₩12,000', tokens: '+50,000', type: '초기지급', date: '2025-01-05 14:30' },
]

const pricingPlans = [
  { name: '스타터', tokens: '50,000', price: '₩12,000', perToken: '₩0.24' },
  { name: '스탠다드', tokens: '100,000', price: '₩20,000', perToken: '₩0.20' },
  { name: '프리미엄', tokens: '500,000', price: '₩80,000', perToken: '₩0.16' },
  { name: '엔터프라이즈', tokens: '1,000,000', price: '₩140,000', perToken: '₩0.14' },
]

const statusColors: Record<string, string> = {
  normal: 'text-emerald-600',
  low: 'text-amber-600',
  empty: 'text-rose-600',
}

export default function TokensPage() {
  const [search, setSearch] = useState('')
  const [showGrantModal, setShowGrantModal] = useState(false)

  const filteredWallets = wallets.filter((w) => w.customer.includes(search))

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">토큰 / 크레딧</h1>
          <p className="text-sm text-muted-foreground mt-0.5">고객 토큰 지갑 및 충전 관리</p>
        </div>
        <Button size="sm" className="gap-1.5" onClick={() => setShowGrantModal(true)}>
          <Gift className="w-3.5 h-3.5" />
          크레딧 수동 지급
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard title="총 토큰 잔액" value="326,000" change="" changeType="neutral" icon={Coins} iconColor="text-violet-600" iconBg="bg-violet-50" />
        <StatCard title="이번달 충전액" value="₩3.1M" change="+22%" changeType="up" icon={TrendingUp} iconColor="text-cyan-600" iconBg="bg-cyan-50" />
        <StatCard title="잔액 부족 알림" value="3" change="" changeType="neutral" icon={AlertTriangle} iconColor="text-amber-600" iconBg="bg-amber-50" />
        <StatCard title="초기 크레딧 대기" value="5" change="" changeType="neutral" icon={Gift} iconColor="text-emerald-600" iconBg="bg-emerald-50" />
      </div>

      <Tabs defaultValue="wallets">
        <TabsList>
          <TabsTrigger value="wallets" className="text-xs">지갑 현황</TabsTrigger>
          <TabsTrigger value="history" className="text-xs">충전 내역</TabsTrigger>
          <TabsTrigger value="pricing" className="text-xs">요금제</TabsTrigger>
        </TabsList>

        <TabsContent value="wallets" className="mt-4 space-y-4">
          <div className="relative max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input placeholder="고객명 검색..." className="pl-9 h-8 text-sm" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <div className="bg-card rounded-lg border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border bg-muted/40">
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">고객</th>
                    <th className="text-right px-4 py-3 font-medium text-muted-foreground">토큰 잔액</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">최근 충전</th>
                    <th className="text-right px-4 py-3 font-medium text-muted-foreground">총 충전금액</th>
                    <th className="text-center px-4 py-3 font-medium text-muted-foreground">상태</th>
                    <th className="text-center px-4 py-3 font-medium text-muted-foreground">액션</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredWallets.map((wallet) => (
                    <tr key={wallet.customer} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 font-medium">{wallet.customer}</td>
                      <td className={`px-4 py-3 text-right font-bold tabular-nums ${statusColors[wallet.status]}`}>
                        {wallet.balance}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{wallet.lastCharge}</td>
                      <td className="px-4 py-3 text-right font-medium">{wallet.totalCharged}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`text-[11px] font-medium ${statusColors[wallet.status]}`}>
                          {wallet.status === 'normal' ? '정상' : wallet.status === 'low' ? '부족' : '소진'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-1">
                          <button className="p-1.5 rounded hover:bg-muted transition-colors text-emerald-600 hover:bg-emerald-50" title="크레딧 지급">
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                          <button className="p-1.5 rounded hover:bg-muted transition-colors text-rose-500 hover:bg-rose-50" title="크레딧 차감">
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
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
                    <th className="text-right px-4 py-3 font-medium text-muted-foreground">결제금액</th>
                    <th className="text-right px-4 py-3 font-medium text-muted-foreground">토큰</th>
                    <th className="text-center px-4 py-3 font-medium text-muted-foreground">유형</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">일시</th>
                  </tr>
                </thead>
                <tbody>
                  {chargeHistory.map((item, i) => (
                    <tr key={i} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 font-medium">{item.customer}</td>
                      <td className="px-4 py-3 text-right font-medium">{item.amount}</td>
                      <td className="px-4 py-3 text-right text-emerald-600 font-semibold">{item.tokens}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${item.type === '구매' ? 'bg-violet-50 text-violet-700' : item.type === '관리자지급' ? 'bg-cyan-50 text-cyan-700' : 'bg-emerald-50 text-emerald-700'}`}>
                          {item.type}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{item.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="pricing" className="mt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {pricingPlans.map((plan) => (
              <div key={plan.name} className="bg-card border border-border rounded-lg p-4">
                <h3 className="text-sm font-bold text-foreground">{plan.name}</h3>
                <p className="text-2xl font-bold text-primary mt-2">{plan.price}</p>
                <p className="text-xs text-muted-foreground mt-1">{plan.tokens} 토큰</p>
                <div className="mt-3 pt-3 border-t border-border">
                  <p className="text-xs text-muted-foreground">토큰당 단가</p>
                  <p className="text-sm font-semibold text-foreground mt-0.5">{plan.perToken}</p>
                </div>
                <Button size="sm" variant="outline" className="w-full mt-3 text-xs">수정</Button>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {showGrantModal && <GrantCreditModal onClose={() => setShowGrantModal(false)} />}
    </div>
  )
}

function GrantCreditModal({ onClose }: { onClose: () => void }) {
  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-card rounded-xl border border-border w-full max-w-sm shadow-2xl">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <h2 className="text-sm font-bold">크레딧 수동 지급/차감</h2>
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground text-sm">✕</button>
          </div>
          <div className="p-5 space-y-4">
            <div>
              <label className="text-xs font-medium block mb-1.5">고객</label>
              <select className="w-full h-8 bg-background border border-border rounded-md px-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary">
                {wallets.map((w) => <option key={w.customer}>{w.customer}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium block mb-1.5">유형</label>
              <div className="flex gap-4">
                {['지급', '차감'].map((t) => (
                  <label key={t} className="flex items-center gap-2 text-sm cursor-pointer">
                    <input type="radio" name="type" defaultChecked={t === '지급'} />
                    {t}
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs font-medium block mb-1.5">토큰 수량</label>
              <Input className="h-8 text-sm" placeholder="10000" type="number" />
            </div>
            <div>
              <label className="text-xs font-medium block mb-1.5">사유</label>
              <Input className="h-8 text-sm" placeholder="초기 가입 크레딧 지급" />
            </div>
          </div>
          <div className="flex justify-end gap-2 px-5 pb-5">
            <Button variant="outline" size="sm" onClick={onClose}>취소</Button>
            <Button size="sm">처리</Button>
          </div>
        </div>
      </div>
    </>
  )
}
