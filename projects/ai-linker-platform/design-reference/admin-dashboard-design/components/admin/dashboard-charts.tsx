'use client'

import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line,
} from 'recharts'

const salesData = [
  { date: '1/7', revenue: 1800000, margin: 1100000 },
  { date: '1/8', revenue: 2200000, margin: 1400000 },
  { date: '1/9', revenue: 1900000, margin: 1200000 },
  { date: '1/10', revenue: 2600000, margin: 1700000 },
  { date: '1/11', revenue: 2100000, margin: 1350000 },
  { date: '1/12', revenue: 3100000, margin: 2000000 },
  { date: '1/13', revenue: 2400000, margin: 1600000 },
]

const tokenData = [
  { date: '1/7', tokens: 850000 },
  { date: '1/8', tokens: 1200000 },
  { date: '1/9', tokens: 950000 },
  { date: '1/10', tokens: 1500000 },
  { date: '1/11', tokens: 1100000 },
  { date: '1/12', tokens: 1800000 },
  { date: '1/13', tokens: 1300000 },
]

const agentSales = [
  { name: 'AI Writer', sales: 342 },
  { name: 'Sales Copilot', sales: 218 },
  { name: 'Data Analyst', sales: 189 },
  { name: 'Code Helper', sales: 156 },
  { name: 'CS Bot', sales: 98 },
]

const llmCosts = [
  { name: 'OpenAI', value: 54, color: '#7c3aed' },
  { name: 'Anthropic', value: 28, color: '#06b6d4' },
  { name: 'OpenRouter', value: 18, color: '#10b981' },
]

const fmt = (v: number) =>
  v >= 1000000 ? `${(v / 1000000).toFixed(1)}M` : v >= 1000 ? `${(v / 1000).toFixed(0)}K` : String(v)

export function DashboardCharts() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
      {/* Revenue Trend */}
      <div className="bg-card rounded-lg border border-border p-4 xl:col-span-2">
        <h3 className="text-sm font-semibold text-foreground mb-4">매출 추이</h3>
        <ResponsiveContainer width="100%" height={180}>
          <AreaChart data={salesData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#7c3aed" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#7c3aed" stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id="marginGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#06b6d4" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
            <YAxis tickFormatter={fmt} tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} width={42} />
            <Tooltip
              formatter={(val: number, name: string) => [`₩${fmt(val)}`, name === 'revenue' ? '매출' : '마진']}
              contentStyle={{ fontSize: 12, backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8 }}
            />
            <Legend formatter={(val) => val === 'revenue' ? '매출' : '마진'} wrapperStyle={{ fontSize: 12 }} />
            <Area type="monotone" dataKey="revenue" stroke="#7c3aed" fill="url(#revGrad)" strokeWidth={2} dot={false} />
            <Area type="monotone" dataKey="margin" stroke="#06b6d4" fill="url(#marginGrad)" strokeWidth={2} dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* LLM Provider Costs */}
      <div className="bg-card rounded-lg border border-border p-4">
        <h3 className="text-sm font-semibold text-foreground mb-4">LLM Provider별 비용</h3>
        <ResponsiveContainer width="100%" height={180}>
          <PieChart>
            <Pie data={llmCosts} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={3} dataKey="value">
              {llmCosts.map((entry, i) => (
                <Cell key={i} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(val: number) => [`${val}%`]}
              contentStyle={{ fontSize: 12, backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8 }}
            />
            <Legend wrapperStyle={{ fontSize: 12 }} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Token Usage */}
      <div className="bg-card rounded-lg border border-border p-4">
        <h3 className="text-sm font-semibold text-foreground mb-4">토큰 사용량</h3>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={tokenData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
            <YAxis tickFormatter={fmt} tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} width={42} />
            <Tooltip
              formatter={(val: number) => [fmt(val), '토큰']}
              contentStyle={{ fontSize: 12, backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8 }}
            />
            <Bar dataKey="tokens" fill="#06b6d4" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Agent Sales */}
      <div className="bg-card rounded-lg border border-border p-4 xl:col-span-2">
        <h3 className="text-sm font-semibold text-foreground mb-4">Agent별 판매량</h3>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={agentSales} layout="vertical" margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
            <XAxis type="number" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
            <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} width={80} />
            <Tooltip
              formatter={(val: number) => [val, '판매수']}
              contentStyle={{ fontSize: 12, backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8 }}
            />
            <Bar dataKey="sales" fill="#7c3aed" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
