'use client'

import { useState } from 'react'
import { StatusBadge } from '@/components/admin/status-badge'
import { StatCard } from '@/components/admin/stat-card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Server, DollarSign, AlertTriangle, Plus, RefreshCw, Trash2 } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

const providers = [
  {
    name: 'OpenAI',
    color: '#7c3aed',
    accounts: [
      { id: 'openai-prod-01', model: 'gpt-4o', balance: '$48.20', dailyLimit: '$100', used: '$85.20', status: 'warning' as const, routing: 'primary' },
      { id: 'openai-prod-02', model: 'gpt-4o-mini', balance: '$120.00', dailyLimit: '$150', used: '$22.10', status: 'normal' as const, routing: 'secondary' },
    ],
  },
  {
    name: 'Anthropic',
    color: '#06b6d4',
    accounts: [
      { id: 'anthropic-01', model: 'claude-3-5-sonnet', balance: '$89.50', dailyLimit: '$100', used: '$45.20', status: 'normal' as const, routing: 'primary' },
    ],
  },
  {
    name: 'OpenRouter',
    color: '#10b981',
    accounts: [
      { id: 'openrouter-01', model: 'mixed', balance: '$2.10', dailyLimit: '$50', used: '$47.90', status: 'critical' as const, routing: 'fallback' },
    ],
  },
]

const costData = [
  { date: '1/7', openai: 42, anthropic: 21, openrouter: 8 },
  { date: '1/8', openai: 55, anthropic: 28, openrouter: 12 },
  { date: '1/9', openai: 38, anthropic: 19, openrouter: 7 },
  { date: '1/10', openai: 72, anthropic: 35, openrouter: 15 },
  { date: '1/11', openai: 48, anthropic: 24, openrouter: 9 },
  { date: '1/12', openai: 89, anthropic: 42, openrouter: 18 },
  { date: '1/13', openai: 61, anthropic: 30, openrouter: 11 },
]

const routingData = [
  { name: 'OpenAI', value: 54, color: '#7c3aed' },
  { name: 'Anthropic', value: 28, color: '#06b6d4' },
  { name: 'OpenRouter', value: 18, color: '#10b981' },
]

const routingColors: Record<string, string> = {
  primary: 'bg-violet-50 text-violet-700 border-violet-200',
  secondary: 'bg-blue-50 text-blue-700 border-blue-200',
  fallback: 'bg-amber-50 text-amber-700 border-amber-200',
}

export default function LLMPoolPage() {
  const [showAddModal, setShowAddModal] = useState(false)

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">LLM 계정 Pool</h1>
          <p className="text-sm text-muted-foreground mt-0.5">AI 프로바이더 계정 및 라우팅 관리</p>
        </div>
        <Button size="sm" className="gap-1.5" onClick={() => setShowAddModal(true)}>
          <Plus className="w-3.5 h-3.5" />
          계정 추가
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard title="총 계정 수" value="4" icon={Server} iconColor="text-violet-600" iconBg="bg-violet-50" />
        <StatCard title="오늘 LLM 비용" value="$102" change="+8%" changeType="down" icon={DollarSign} iconColor="text-cyan-600" iconBg="bg-cyan-50" />
        <StatCard title="이상 감지" value="2" icon={AlertTriangle} iconColor="text-amber-600" iconBg="bg-amber-50" />
        <StatCard title="이번달 총비용" value="$890" change="+15%" changeType="down" icon={DollarSign} iconColor="text-rose-600" iconBg="bg-rose-50" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-card rounded-lg border border-border p-4 lg:col-span-2">
          <h3 className="text-sm font-semibold text-foreground mb-4">Provider별 일별 비용 ($)</h3>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={costData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} width={32} />
              <Tooltip contentStyle={{ fontSize: 12, backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8 }} />
              <Bar dataKey="openai" fill="#7c3aed" radius={[2, 2, 0, 0]} stackId="a" name="OpenAI" />
              <Bar dataKey="anthropic" fill="#06b6d4" radius={[2, 2, 0, 0]} stackId="a" name="Anthropic" />
              <Bar dataKey="openrouter" fill="#10b981" radius={[2, 2, 0, 0]} stackId="a" name="OpenRouter" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-card rounded-lg border border-border p-4">
          <h3 className="text-sm font-semibold text-foreground mb-4">라우팅 비율</h3>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={routingData} cx="50%" cy="50%" innerRadius={45} outerRadius={65} paddingAngle={3} dataKey="value">
                {routingData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip formatter={(v: number) => [`${v}%`]} contentStyle={{ fontSize: 12, backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-col gap-1.5 mt-2">
            {routingData.map((d) => (
              <div key={d.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                  <span className="text-muted-foreground">{d.name}</span>
                </div>
                <span className="font-medium">{d.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Provider Accounts */}
      <div className="space-y-4">
        {providers.map((provider) => (
          <div key={provider.name} className="bg-card rounded-lg border border-border overflow-hidden">
            <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-muted/20">
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: provider.color }} />
              <h3 className="text-sm font-semibold text-foreground">{provider.name}</h3>
              <span className="text-xs text-muted-foreground">계정 {provider.accounts.length}개</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border/50 bg-muted/10">
                    <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">계정 ID</th>
                    <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">모델</th>
                    <th className="text-right px-4 py-2.5 font-medium text-muted-foreground">잔액</th>
                    <th className="text-right px-4 py-2.5 font-medium text-muted-foreground">일한도</th>
                    <th className="text-right px-4 py-2.5 font-medium text-muted-foreground">오늘 사용</th>
                    <th className="text-center px-4 py-2.5 font-medium text-muted-foreground">라우팅</th>
                    <th className="text-center px-4 py-2.5 font-medium text-muted-foreground">상태</th>
                    <th className="text-center px-4 py-2.5 font-medium text-muted-foreground">액션</th>
                  </tr>
                </thead>
                <tbody>
                  {provider.accounts.map((account) => (
                    <tr key={account.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3 font-mono text-muted-foreground">{account.id}</td>
                      <td className="px-4 py-3 font-medium">{account.model}</td>
                      <td className="px-4 py-3 text-right font-semibold">{account.balance}</td>
                      <td className="px-4 py-3 text-right text-muted-foreground">{account.dailyLimit}</td>
                      <td className="px-4 py-3 text-right text-muted-foreground">{account.used}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border ${routingColors[account.routing]}`}>
                          {account.routing}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center"><StatusBadge status={account.status} /></td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-1">
                          <button className="p-1.5 rounded hover:bg-muted transition-colors text-muted-foreground" title="새로고침">
                            <RefreshCw className="w-3.5 h-3.5" />
                          </button>
                          <button className="p-1.5 rounded hover:bg-muted transition-colors text-rose-500 hover:bg-rose-50" title="삭제">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>

      {showAddModal && <AddAccountModal onClose={() => setShowAddModal(false)} />}
    </div>
  )
}

function AddAccountModal({ onClose }: { onClose: () => void }) {
  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-card rounded-xl border border-border w-full max-w-sm shadow-2xl">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <h2 className="text-sm font-bold">LLM 계정 추가</h2>
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground text-sm">✕</button>
          </div>
          <div className="p-5 space-y-4">
            <div>
              <label className="text-xs font-medium block mb-1.5">Provider</label>
              <select className="w-full h-8 bg-background border border-border rounded-md px-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary">
                <option>OpenAI</option>
                <option>Anthropic</option>
                <option>OpenRouter</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium block mb-1.5">계정 ID</label>
              <Input className="h-8 text-sm" placeholder="openai-prod-03" />
            </div>
            <div>
              <label className="text-xs font-medium block mb-1.5">API Key</label>
              <Input className="h-8 text-sm" type="password" placeholder="sk-..." />
            </div>
            <div>
              <label className="text-xs font-medium block mb-1.5">라우팅 역할</label>
              <select className="w-full h-8 bg-background border border-border rounded-md px-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary">
                <option>primary</option>
                <option>secondary</option>
                <option>fallback</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium block mb-1.5">일일 한도 ($)</label>
              <Input className="h-8 text-sm" placeholder="100" type="number" />
            </div>
          </div>
          <div className="flex justify-end gap-2 px-5 pb-5">
            <Button variant="outline" size="sm" onClick={onClose}>취소</Button>
            <Button size="sm">추가</Button>
          </div>
        </div>
      </div>
    </>
  )
}
