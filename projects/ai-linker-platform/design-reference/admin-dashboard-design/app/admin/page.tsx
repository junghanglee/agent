import { StatCard } from '@/components/admin/stat-card'
import { StatusBadge } from '@/components/admin/status-badge'
import { DashboardCharts } from '@/components/admin/dashboard-charts'
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

const recentOrders = [
  { id: 'ORD-2401', customer: '김민준', product: 'AI Writer Pro', amount: '₩89,000', status: 'paid' as const, date: '2025-01-13' },
  { id: 'ORD-2400', customer: '이서연', product: 'Sales Copilot', amount: '₩129,000', status: 'paid' as const, date: '2025-01-13' },
  { id: 'ORD-2399', customer: '박도현', product: 'Token Pack 100K', amount: '₩15,000', status: 'pending' as const, date: '2025-01-12' },
  { id: 'ORD-2398', customer: '최수아', product: 'Data Analyst', amount: '₩99,000', status: 'paid' as const, date: '2025-01-12' },
  { id: 'ORD-2397', customer: '정예준', product: 'AI Writer Pro', amount: '₩89,000', status: 'refunded' as const, date: '2025-01-11' },
]

const recentInstallCodes = [
  { code: 'AIL-XXXX-7829', customer: '김민준', product: 'AI Writer Pro', os: 'Windows', status: 'active' as const },
  { code: 'AIL-XXXX-6341', customer: '이서연', product: 'Sales Copilot', os: 'macOS', status: 'active' as const },
  { code: 'AIL-XXXX-5512', customer: '박도현', product: 'Data Analyst', os: 'Windows', status: 'pending' as const },
  { code: 'AIL-XXXX-4203', customer: '최수아', product: 'AI Writer Pro', os: 'Windows', status: 'active' as const },
]

const pendingSupport = [
  { id: 'TKT-581', customer: '정예준', subject: '설치 오류 문의', priority: 'high', time: '23분 전' },
  { id: 'TKT-580', customer: '윤하늘', subject: '결제 취소 요청', priority: 'medium', time: '1시간 전' },
  { id: 'TKT-579', customer: '강지호', subject: '토큰 잔액 오류', priority: 'high', time: '2시간 전' },
  { id: 'TKT-578', customer: '조민서', subject: '라이선스 이전 요청', priority: 'low', time: '3시간 전' },
]

const llmAlerts = [
  { provider: 'OpenAI', account: 'openai-prod-01', status: 'warning' as const, message: '일일 한도 85% 도달', time: '10분 전' },
  { provider: 'Anthropic', account: 'anthropic-01', status: 'normal' as const, message: '정상 운영 중', time: '—' },
  { provider: 'OpenRouter', account: 'openrouter-01', status: 'critical' as const, message: '크레딧 잔액 부족', time: '1시간 전' },
]

const priorityColors: Record<string, string> = {
  high: 'text-rose-600 bg-rose-50 border-rose-200',
  medium: 'text-amber-600 bg-amber-50 border-amber-200',
  low: 'text-sky-600 bg-sky-50 border-sky-200',
}

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-xl font-bold text-foreground">대시보드</h1>
        <p className="text-sm text-muted-foreground mt-0.5">AI Linker 플랫폼 운영 현황 — 2025년 1월 13일</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        <StatCard
          title="오늘 매출"
          value="₩1.24M"
          change="+12%"
          changeType="up"
          icon={DollarSign}
          iconColor="text-violet-600"
          iconBg="bg-violet-50"
        />
        <StatCard
          title="월 누적 매출"
          value="₩28.7M"
          change="+8%"
          changeType="up"
          icon={TrendingUp}
          iconColor="text-cyan-600"
          iconBg="bg-cyan-50"
        />
        <StatCard
          title="신규 가입자"
          value="47"
          change="+5"
          changeType="up"
          icon={UserPlus}
          iconColor="text-blue-600"
          iconBg="bg-blue-50"
        />
        <StatCard
          title="신규 구매자"
          value="23"
          change="+3"
          changeType="up"
          icon={ShoppingBag}
          iconColor="text-indigo-600"
          iconBg="bg-indigo-50"
        />
        <StatCard
          title="설치코드 발급"
          value="31"
          change="+6"
          changeType="up"
          icon={KeyRound}
          iconColor="text-emerald-600"
          iconBg="bg-emerald-50"
        />
        <StatCard
          title="활성 라이선스"
          value="1,842"
          change="+18"
          changeType="up"
          icon={Shield}
          iconColor="text-teal-600"
          iconBg="bg-teal-50"
        />
        <StatCard
          title="토큰 충전액"
          value="₩3.1M"
          change="+22%"
          changeType="up"
          icon={Zap}
          iconColor="text-yellow-600"
          iconBg="bg-yellow-50"
        />
        <StatCard
          title="LLM 원가"
          value="₩890K"
          change="+15%"
          changeType="down"
          icon={Server}
          iconColor="text-orange-600"
          iconBg="bg-orange-50"
        />
        <StatCard
          title="예상 마진"
          value="₩2.21M"
          change="+19%"
          changeType="up"
          icon={BarChart3}
          iconColor="text-violet-600"
          iconBg="bg-violet-50"
        />
        <StatCard
          title="미처리 상담"
          value="12"
          change="+3"
          changeType="down"
          icon={MessageCircle}
          iconColor="text-rose-600"
          iconBg="bg-rose-50"
        />
      </div>

      {/* Charts */}
      <DashboardCharts />

      {/* Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent Orders */}
        <div className="bg-card rounded-lg border border-border">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <h3 className="text-sm font-semibold text-foreground">최근 주문</h3>
            <a href="/admin/payments" className="text-xs text-primary hover:underline">전체 보기</a>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  <th className="text-left px-4 py-2 font-medium text-muted-foreground">주문번호</th>
                  <th className="text-left px-4 py-2 font-medium text-muted-foreground">고객</th>
                  <th className="text-left px-4 py-2 font-medium text-muted-foreground">상품</th>
                  <th className="text-right px-4 py-2 font-medium text-muted-foreground">금액</th>
                  <th className="text-center px-4 py-2 font-medium text-muted-foreground">상태</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-2.5 font-mono text-muted-foreground">{order.id}</td>
                    <td className="px-4 py-2.5 font-medium">{order.customer}</td>
                    <td className="px-4 py-2.5 text-muted-foreground truncate max-w-[120px]">{order.product}</td>
                    <td className="px-4 py-2.5 text-right font-medium">{order.amount}</td>
                    <td className="px-4 py-2.5 text-center">
                      <StatusBadge status={order.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Install Codes */}
        <div className="bg-card rounded-lg border border-border">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <h3 className="text-sm font-semibold text-foreground">최근 설치코드 발급</h3>
            <a href="/admin/licenses" className="text-xs text-primary hover:underline">전체 보기</a>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  <th className="text-left px-4 py-2 font-medium text-muted-foreground">코드</th>
                  <th className="text-left px-4 py-2 font-medium text-muted-foreground">고객</th>
                  <th className="text-left px-4 py-2 font-medium text-muted-foreground">OS</th>
                  <th className="text-center px-4 py-2 font-medium text-muted-foreground">상태</th>
                </tr>
              </thead>
              <tbody>
                {recentInstallCodes.map((item) => (
                  <tr key={item.code} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-2.5 font-mono text-muted-foreground">{item.code}</td>
                    <td className="px-4 py-2.5 font-medium">{item.customer}</td>
                    <td className="px-4 py-2.5 text-muted-foreground">{item.os}</td>
                    <td className="px-4 py-2.5 text-center">
                      <StatusBadge status={item.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pending Support */}
        <div className="bg-card rounded-lg border border-border">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <h3 className="text-sm font-semibold text-foreground">미처리 상담</h3>
            <a href="/admin/support" className="text-xs text-primary hover:underline">전체 보기</a>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  <th className="text-left px-4 py-2 font-medium text-muted-foreground">티켓</th>
                  <th className="text-left px-4 py-2 font-medium text-muted-foreground">고객</th>
                  <th className="text-left px-4 py-2 font-medium text-muted-foreground">제목</th>
                  <th className="text-center px-4 py-2 font-medium text-muted-foreground">우선순위</th>
                  <th className="text-right px-4 py-2 font-medium text-muted-foreground">시간</th>
                </tr>
              </thead>
              <tbody>
                {pendingSupport.map((ticket) => (
                  <tr key={ticket.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-2.5 font-mono text-muted-foreground">{ticket.id}</td>
                    <td className="px-4 py-2.5 font-medium">{ticket.customer}</td>
                    <td className="px-4 py-2.5 text-muted-foreground">{ticket.subject}</td>
                    <td className="px-4 py-2.5 text-center">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border ${priorityColors[ticket.priority]}`}>
                        {ticket.priority === 'high' ? '높음' : ticket.priority === 'medium' ? '중간' : '낮음'}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-right text-muted-foreground">{ticket.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* LLM Alerts */}
        <div className="bg-card rounded-lg border border-border">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <h3 className="text-sm font-semibold text-foreground">LLM 계정 이상 알림</h3>
            <a href="/admin/llm-pool" className="text-xs text-primary hover:underline">전체 보기</a>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  <th className="text-left px-4 py-2 font-medium text-muted-foreground">Provider</th>
                  <th className="text-left px-4 py-2 font-medium text-muted-foreground">계정</th>
                  <th className="text-left px-4 py-2 font-medium text-muted-foreground">메시지</th>
                  <th className="text-center px-4 py-2 font-medium text-muted-foreground">상태</th>
                </tr>
              </thead>
              <tbody>
                {llmAlerts.map((alert) => (
                  <tr key={alert.account} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-2.5 font-medium">{alert.provider}</td>
                    <td className="px-4 py-2.5 font-mono text-muted-foreground">{alert.account}</td>
                    <td className="px-4 py-2.5 text-muted-foreground">{alert.message}</td>
                    <td className="px-4 py-2.5 text-center">
                      <StatusBadge status={alert.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
