'use client'

import { StatCard } from '@/components/admin/stat-card'
import { Activity, Zap, Server, Clock, Users, AlertTriangle } from 'lucide-react'
import {
  AreaChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, BarChart, Bar,
} from 'recharts'

const realtimeData = [
  { time: '14:00', requests: 320, tokens: 85000, latency: 420 },
  { time: '14:05', requests: 410, tokens: 112000, latency: 380 },
  { time: '14:10', requests: 380, tokens: 95000, latency: 450 },
  { time: '14:15', requests: 520, tokens: 140000, latency: 390 },
  { time: '14:20', requests: 460, tokens: 125000, latency: 410 },
  { time: '14:25', requests: 610, tokens: 165000, latency: 370 },
  { time: '14:30', requests: 540, tokens: 148000, latency: 400 },
]

const agentUsage = [
  { agent: 'AI Writer', requests: 12400, tokens: 3200000 },
  { agent: 'Sales Copilot', requests: 8200, tokens: 2100000 },
  { agent: 'Data Analyst', requests: 7100, tokens: 1850000 },
  { agent: 'Code Helper', requests: 5400, tokens: 1400000 },
  { agent: 'CS Bot', requests: 3200, tokens: 820000 },
]

const errorData = [
  { date: '1/7', errors: 12 },
  { date: '1/8', errors: 8 },
  { date: '1/9', errors: 15 },
  { date: '1/10', errors: 6 },
  { date: '1/11', errors: 19 },
  { date: '1/12', errors: 9 },
  { date: '1/13', errors: 11 },
]

const fmt = (v: number) =>
  v >= 1000000 ? `${(v / 1000000).toFixed(1)}M` : v >= 1000 ? `${(v / 1000).toFixed(0)}K` : String(v)

export default function MonitoringPage() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-foreground">사용량 모니터링</h1>
        <p className="text-sm text-muted-foreground mt-0.5">실시간 API 요청 및 토큰 사용 현황</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
        <StatCard title="분당 요청" value="540" change="+12%" changeType="up" icon={Activity} iconColor="text-violet-600" iconBg="bg-violet-50" />
        <StatCard title="분당 토큰" value="148K" change="+8%" changeType="up" icon={Zap} iconColor="text-cyan-600" iconBg="bg-cyan-50" />
        <StatCard title="평균 응답시간" value="400ms" change="-5%" changeType="up" icon={Clock} iconColor="text-emerald-600" iconBg="bg-emerald-50" />
        <StatCard title="활성 세션" value="287" change="+34" changeType="up" icon={Users} iconColor="text-blue-600" iconBg="bg-blue-50" />
        <StatCard title="LLM 서버 수" value="4" icon={Server} iconColor="text-indigo-600" iconBg="bg-indigo-50" />
        <StatCard title="오류율" value="0.8%" change="-0.2%" changeType="up" icon={AlertTriangle} iconColor="text-amber-600" iconBg="bg-amber-50" />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Real-time Requests */}
        <div className="bg-card rounded-lg border border-border p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-foreground">실시간 요청 수</h3>
            <span className="flex items-center gap-1.5 text-xs text-emerald-600">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live
            </span>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={realtimeData}>
              <defs>
                <linearGradient id="reqGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#7c3aed" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#7c3aed" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="time" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} width={36} />
              <Tooltip contentStyle={{ fontSize: 12, backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8 }} />
              <Area type="monotone" dataKey="requests" stroke="#7c3aed" fill="url(#reqGrad)" strokeWidth={2} dot={false} name="요청" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Token Usage Real-time */}
        <div className="bg-card rounded-lg border border-border p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-foreground">실시간 토큰 사용량</h3>
            <span className="flex items-center gap-1.5 text-xs text-emerald-600">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live
            </span>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={realtimeData}>
              <defs>
                <linearGradient id="tokGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#06b6d4" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="time" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={fmt} tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} width={42} />
              <Tooltip formatter={(v: number) => [fmt(v), '토큰']} contentStyle={{ fontSize: 12, backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8 }} />
              <Area type="monotone" dataKey="tokens" stroke="#06b6d4" fill="url(#tokGrad)" strokeWidth={2} dot={false} name="토큰" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Agent Usage */}
        <div className="bg-card rounded-lg border border-border p-4">
          <h3 className="text-sm font-semibold text-foreground mb-4">Agent별 오늘 사용량</h3>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={agentUsage} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
              <XAxis type="number" tickFormatter={fmt} tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
              <YAxis dataKey="agent" type="category" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} width={80} />
              <Tooltip formatter={(v: number) => [fmt(v)]} contentStyle={{ fontSize: 12, backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8 }} />
              <Bar dataKey="tokens" fill="#7c3aed" radius={[0, 4, 4, 0]} name="토큰" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Latency & Errors */}
        <div className="bg-card rounded-lg border border-border p-4">
          <h3 className="text-sm font-semibold text-foreground mb-4">응답시간 및 오류</h3>
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={realtimeData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="time" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} width={40} />
              <Tooltip contentStyle={{ fontSize: 12, backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8 }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Line type="monotone" dataKey="latency" stroke="#7c3aed" strokeWidth={2} dot={false} name="응답시간(ms)" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
