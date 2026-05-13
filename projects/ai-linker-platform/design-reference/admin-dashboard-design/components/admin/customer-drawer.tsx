'use client'

import { StatusBadge } from '@/components/admin/status-badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { X, Shield, KeyRound, Coins, StickyNote, BarChart2 } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const usageData = [
  { date: '1/7', tokens: 4800 },
  { date: '1/8', tokens: 12000 },
  { date: '1/9', tokens: 8500 },
  { date: '1/10', tokens: 15000 },
  { date: '1/11', tokens: 6200 },
  { date: '1/12', tokens: 18000 },
  { date: '1/13', tokens: 9100 },
]

interface CustomerDrawerProps {
  open: boolean
  onClose: () => void
  customer: {
    id: string
    name: string
    email: string
    joinedAt: string
    agents: number
    tokenBalance: string
    totalPaid: string
    licenseStatus: 'active' | 'expired' | 'suspended' | 'inactive' | 'pending'
    lastSeen: string
  }
}

export function CustomerDrawer({ open, onClose, customer }: CustomerDrawerProps) {
  if (!open) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 z-40"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 bottom-0 w-[480px] bg-card border-l border-border z-50 flex flex-col shadow-2xl overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border sticky top-0 bg-card">
          <div>
            <h2 className="text-sm font-bold text-foreground">{customer.name}</h2>
            <p className="text-xs text-muted-foreground">{customer.id} · {customer.email}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-md hover:bg-muted transition-colors">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        {/* Profile summary */}
        <div className="grid grid-cols-3 gap-3 p-5 border-b border-border">
          <div className="bg-muted/50 rounded-lg p-3 text-center">
            <p className="text-lg font-bold text-foreground">{customer.agents}</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">보유 Agent</p>
          </div>
          <div className="bg-muted/50 rounded-lg p-3 text-center">
            <p className="text-lg font-bold text-foreground">{customer.tokenBalance}</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">토큰 잔액</p>
          </div>
          <div className="bg-muted/50 rounded-lg p-3 text-center">
            <p className="text-base font-bold text-foreground">{customer.totalPaid}</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">총 결제</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 flex-wrap px-5 py-3 border-b border-border">
          <Button size="sm" variant="outline" className="text-xs gap-1.5 h-7">
            <Shield className="w-3 h-3" />
            라이선스 정지
          </Button>
          <Button size="sm" variant="outline" className="text-xs gap-1.5 h-7">
            <KeyRound className="w-3 h-3" />
            코드 재발급
          </Button>
          <Button size="sm" variant="outline" className="text-xs gap-1.5 h-7">
            <Coins className="w-3 h-3" />
            크레딧 수동 지급
          </Button>
          <Button size="sm" variant="outline" className="text-xs gap-1.5 h-7">
            <StickyNote className="w-3 h-3" />
            메모 추가
          </Button>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="overview" className="flex-1">
          <TabsList className="w-full rounded-none border-b border-border bg-transparent h-9 px-5 justify-start gap-1">
            {['overview', 'purchases', 'licenses', 'tickets', 'memo'].map((tab) => (
              <TabsTrigger
                key={tab}
                value={tab}
                className="text-xs h-8 px-3 rounded-md data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
              >
                {tab === 'overview' ? '개요' : tab === 'purchases' ? '구매내역' : tab === 'licenses' ? '라이선스' : tab === 'tickets' ? '상담' : '메모'}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="overview" className="p-5 space-y-4">
            <div>
              <h4 className="text-xs font-semibold text-muted-foreground mb-3 flex items-center gap-1.5">
                <BarChart2 className="w-3.5 h-3.5" />
                토큰 사용량 (최근 7일)
              </h4>
              <ResponsiveContainer width="100%" height={140}>
                <AreaChart data={usageData}>
                  <defs>
                    <linearGradient id="tokenGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#7c3aed" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#7c3aed" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} width={36} />
                  <Tooltip contentStyle={{ fontSize: 11, backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 6 }} />
                  <Area type="monotone" dataKey="tokens" stroke="#7c3aed" fill="url(#tokenGrad)" strokeWidth={2} dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2">
              {[
                { label: '가입일', value: customer.joinedAt },
                { label: '최근 접속', value: customer.lastSeen },
                { label: '라이선스 상태', value: <StatusBadge status={customer.licenseStatus} /> },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between py-1.5 border-b border-border/50 text-xs">
                  <span className="text-muted-foreground">{label}</span>
                  <span className="font-medium">{value}</span>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="purchases" className="p-5">
            <div className="space-y-2">
              {[
                { product: 'AI Writer Pro', amount: '₩89,000', date: '2025-01-10', status: 'paid' as const },
                { product: 'Token Pack 50K', amount: '₩12,000', date: '2024-12-22', status: 'paid' as const },
                { product: 'Sales Copilot', amount: '₩129,000', date: '2024-11-30', status: 'paid' as const },
              ].map((purchase, i) => (
                <div key={i} className="flex items-center justify-between py-2.5 border-b border-border/50 text-xs">
                  <div>
                    <p className="font-medium">{purchase.product}</p>
                    <p className="text-muted-foreground mt-0.5">{purchase.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{purchase.amount}</p>
                    <StatusBadge status={purchase.status} />
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="licenses" className="p-5">
            <div className="space-y-2">
              {[
                { agent: 'AI Writer Pro', os: 'Windows', code: 'AIL-XXXX-7829', status: 'active' as const, expiry: '2026-01-10' },
                { agent: 'Sales Copilot', os: 'macOS', code: 'AIL-XXXX-4412', status: 'active' as const, expiry: '2025-11-30' },
              ].map((lic, i) => (
                <div key={i} className="bg-muted/40 rounded-lg p-3 text-xs">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium">{lic.agent}</p>
                      <p className="text-muted-foreground font-mono mt-0.5">{lic.code}</p>
                    </div>
                    <StatusBadge status={lic.status} />
                  </div>
                  <div className="flex gap-4 mt-2 text-muted-foreground">
                    <span>OS: {lic.os}</span>
                    <span>만료: {lic.expiry}</span>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="tickets" className="p-5">
            <div className="space-y-2">
              {[
                { id: 'TKT-578', subject: '라이선스 이전 요청', status: 'pending' as const, date: '2025-01-11' },
                { id: 'TKT-502', subject: '토큰 환불 문의', status: 'inactive' as const, date: '2024-12-15' },
              ].map((ticket) => (
                <div key={ticket.id} className="flex items-center justify-between py-2.5 border-b border-border/50 text-xs">
                  <div>
                    <p className="font-medium">{ticket.subject}</p>
                    <p className="text-muted-foreground font-mono mt-0.5">{ticket.id} · {ticket.date}</p>
                  </div>
                  <StatusBadge status={ticket.status} />
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="memo" className="p-5">
            <textarea
              className="w-full h-32 bg-muted/40 border border-border rounded-lg p-3 text-xs resize-none focus:outline-none focus:ring-1 focus:ring-primary placeholder-muted-foreground"
              placeholder="관리자 메모를 입력하세요..."
              defaultValue="2024-12-20: 결제 오류 이슈로 환불 처리 완료."
            />
            <Button size="sm" className="mt-2 text-xs">저장</Button>
          </TabsContent>
        </Tabs>
      </div>
    </>
  )
}
