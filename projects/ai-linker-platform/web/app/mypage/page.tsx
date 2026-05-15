import Link from 'next/link'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { Button } from '@/components/ui/button'
import { getDemoCustomerWorkspace } from '@/lib/public-store'
import {
  Bot, Key, Download, Zap, Puzzle, HelpCircle, User,
  Monitor, Apple, ArrowRight, BarChart3, CheckCircle2
} from 'lucide-react'

const tabs = ['내 Agent', '설치코드', '토큰', 'Skill', '지원']

type MyPageProps = {
  searchParams: Promise<{ tab?: string; code?: string }>
}

function formatDate(value?: Date | string | null) {
  if (!value) return '—'
  return new Intl.DateTimeFormat('ko-KR', { dateStyle: 'medium' }).format(new Date(value))
}

function formatUsd(value: unknown) {
  return `$${Number(value ?? 0).toLocaleString('en-US', { maximumFractionDigits: 4 })}`
}

function statusLabel(status?: string) {
  const labels: Record<string, string> = {
    ACTIVE: '활성',
    PENDING: '대기',
    USED: '사용 완료',
    EXPIRED: '만료',
    REVOKED: '폐기',
    SUSPENDED: '정지',
    PAID: '결제 완료',
    CANCELLED: '취소',
    REFUNDED: '환불',
  }
  return labels[status ?? ''] ?? status ?? '—'
}

export default async function MyPage({ searchParams }: MyPageProps) {
  const params = await searchParams
  const activeTab = tabs.includes(params.tab ?? '') ? params.tab! : '내 Agent'
  const highlightedCode = params.code
  const { user, latestReleases } = await getDemoCustomerWorkspace()
  const purchases = user?.purchases ?? []
  const installCodes = purchases.flatMap((purchase) => purchase.installCodes.map((code) => ({ ...code, purchase, product: purchase.agentProduct })))
  const wallet = user?.creditWallet
  const latestReleaseByProduct = new Map(latestReleases.map((release) => [`${release.agentProductId}:${release.platform}`, release]))

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="mx-auto max-w-7xl px-4 py-10 md:px-8">
        <div className="grid gap-8 lg:grid-cols-4">
          <aside className="lg:col-span-1">
            <div className="mb-4 rounded-2xl border border-border bg-card p-5 text-center">
              <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-brand-navy">
                <User className="h-7 w-7 text-brand-cyan" />
              </div>
              <p className="font-semibold text-foreground">{user?.name ?? '게스트 고객'}</p>
              <p className="text-xs text-muted-foreground">{user?.email ?? 'customer@example.com'}</p>
              <div className="mt-3 flex items-center justify-center gap-1.5 rounded-full bg-brand-cyan-soft px-3 py-1 text-xs font-medium text-brand-navy">
                <Zap className="h-3 w-3" />
                {formatUsd(wallet?.balanceUsd)} 크레딧
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-card p-2">
              {tabs.map((tab) => (
                <Link
                  key={tab}
                  href={`/mypage?tab=${encodeURIComponent(tab)}`}
                  className={`block w-full rounded-xl px-4 py-2.5 text-left text-sm font-medium transition-colors ${
                    activeTab === tab
                      ? 'bg-brand-navy text-white'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  {tab}
                </Link>
              ))}
            </div>
          </aside>

          <div className="lg:col-span-3 space-y-5">
            {activeTab === '내 Agent' && (
              <div className="space-y-4">
                <h2 className="text-lg font-bold text-foreground">내 Agent</h2>
                {installCodes.length === 0 && (
                  <div className="rounded-2xl border border-border bg-card p-6 text-center">
                    <Bot className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
                    <p className="font-semibold text-foreground">아직 활성화된 Agent가 없습니다</p>
                    <p className="mt-1 text-sm text-muted-foreground">다운로드는 바로 가능하고, LLM 연결 단계에서 결제하면 설치코드가 발급됩니다.</p>
                    <Link href="/checkout?product=hermes-agent&platform=WINDOWS">
                      <Button className="mt-4 bg-brand-navy text-white hover:bg-brand-navy/90">Hermes 활성화하기</Button>
                    </Link>
                  </div>
                )}
                {installCodes.map((code) => {
                  const release = latestReleaseByProduct.get(`${code.product?.id}:${code.purchase.platform ?? 'WINDOWS'}`)
                  return (
                    <div key={code.id} className="rounded-2xl border border-border bg-card p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-brand-navy to-brand-violet/80">
                            <Bot className="h-5 w-5 text-brand-cyan" />
                          </div>
                          <div>
                            <p className="font-semibold text-foreground">{code.product?.name ?? 'Agent Product'}</p>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              {code.purchase.platform === 'IOS' ? <Apple className="h-3 w-3" /> : <Monitor className="h-3 w-3" />}
                              {code.purchase.platform ?? 'WINDOWS'} · 최신 {release ? `v${release.version}` : '릴리즈 준비 중'}
                            </div>
                          </div>
                        </div>
                        <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-700">
                          {statusLabel(code.license?.status ?? code.status)}
                        </span>
                      </div>
                      <div className="grid gap-2 sm:grid-cols-3 text-sm">
                        <div className="rounded-lg bg-muted/60 p-2.5">
                          <p className="text-xs text-muted-foreground mb-0.5">설치코드</p>
                          <p className="font-mono font-bold text-foreground text-xs">{code.code}</p>
                        </div>
                        <div className="rounded-lg bg-muted/60 p-2.5">
                          <p className="text-xs text-muted-foreground mb-0.5">활성화 기기</p>
                          <p className="font-semibold text-foreground">{code.usedActivations} / {code.maxActivations}</p>
                        </div>
                        <div className="rounded-lg bg-muted/60 p-2.5 flex items-center justify-center">
                          <Button size="sm" className="gap-1.5 text-xs bg-brand-navy text-white hover:bg-brand-navy/90" asChild>
                            <a href={release?.installerFile?.downloadUrl ?? '/api/releases/latest?productSlug=hermes-agent&platform=WINDOWS'}>
                              <Download className="h-3 w-3" /> 최신버전 다운
                            </a>
                          </Button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {activeTab === '설치코드' && (
              <div className="space-y-4">
                <h2 className="text-lg font-bold text-foreground">설치코드 관리</h2>
                {installCodes.map((code) => (
                  <div key={code.id} className={`rounded-2xl border bg-card p-5 ${highlightedCode === code.code ? 'border-brand-cyan ring-2 ring-brand-cyan/20' : 'border-border'}`}>
                    <div className="flex items-center justify-between mb-3">
                      <p className="font-semibold text-foreground">{code.product?.name ?? 'Agent Product'}</p>
                      <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700">{statusLabel(code.status)}</span>
                    </div>
                    <div className="flex items-center gap-2 rounded-xl border border-brand-cyan/30 bg-brand-cyan-soft px-4 py-3">
                      <Key className="h-4 w-4 text-brand-navy shrink-0" />
                      <code className="flex-1 font-mono font-bold tracking-widest text-brand-navy">{code.code}</code>
                      <span className="rounded-md bg-white px-2 py-1 text-xs font-medium text-brand-navy">복사 대상</span>
                    </div>
                    <div className="mt-2 grid gap-1 text-xs text-muted-foreground sm:grid-cols-2">
                      <p>발급일: {formatDate(code.createdAt)}</p>
                      <p>활성화: {code.usedActivations} / {code.maxActivations}</p>
                      <p>라이선스: {statusLabel(code.license?.status)}</p>
                      <p>주문: {statusLabel(code.purchase.status)}</p>
                    </div>
                  </div>
                ))}
                {installCodes.length === 0 && <p className="rounded-2xl border border-border bg-card p-5 text-sm text-muted-foreground">아직 발급된 설치코드가 없습니다.</p>}
              </div>
            )}

            {activeTab === '토큰' && (
              <div className="space-y-4">
                <h2 className="text-lg font-bold text-foreground">토큰/크레딧 관리</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl border border-border bg-card p-5">
                    <p className="text-sm text-muted-foreground mb-1">현재 잔액</p>
                    <p className="text-3xl font-extrabold text-foreground">{formatUsd(wallet?.balanceUsd)}</p>
                    <p className="text-sm text-muted-foreground">AI Linker LLM 크레딧</p>
                    <Link href="/tokens">
                      <Button size="sm" className="mt-3 gap-1.5 bg-brand-navy text-white text-xs hover:bg-brand-navy/90">
                        <Zap className="h-3 w-3" /> 충전하기
                      </Button>
                    </Link>
                  </div>
                  <div className="rounded-2xl border border-border bg-card p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <BarChart3 className="h-4 w-4 text-brand-cyan" />
                      <p className="text-sm font-semibold text-foreground">최근 충전/사용</p>
                    </div>
                    <p className="text-sm text-muted-foreground">최근 거래 {user?.creditTransactions.length ?? 0}건</p>
                  </div>
                </div>
                <div className="rounded-2xl border border-border bg-card p-5">
                  <h3 className="mb-4 font-semibold text-foreground">거래 내역</h3>
                  <div className="space-y-3">
                    {(user?.creditTransactions ?? []).map((transaction) => (
                      <div key={transaction.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                        <div>
                          <p className="text-sm font-medium text-foreground">{transaction.reason}</p>
                          <p className="text-xs text-muted-foreground">{formatDate(transaction.createdAt)} · {transaction.type}</p>
                        </div>
                        <span className="font-bold text-foreground">{formatUsd(transaction.amountUsd)}</span>
                      </div>
                    ))}
                    {!user?.creditTransactions.length && <p className="text-sm text-muted-foreground">거래 내역이 없습니다.</p>}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'Skill' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-foreground">구매한 Skill</h2>
                  <Link href="/agents">
                    <Button size="sm" variant="outline" className="gap-1.5 text-xs border-brand-navy text-brand-navy">
                      <Puzzle className="h-3 w-3" /> Skill 추가
                    </Button>
                  </Link>
                </div>
                <p className="rounded-2xl border border-border bg-card p-5 text-sm text-muted-foreground">Skill 구매 내역은 다음 단계에서 실제 DB와 연결합니다.</p>
              </div>
            )}

            {activeTab === '지원' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-foreground">지원 티켓</h2>
                  <Button size="sm" className="gap-1.5 bg-brand-navy text-white text-xs hover:bg-brand-navy/90">
                    <HelpCircle className="h-3.5 w-3.5" /> 새 문의
                  </Button>
                </div>
                <div className="space-y-3">
                  {(user?.supportTickets ?? []).map((ticket) => (
                    <div key={ticket.id} className="flex items-center gap-4 rounded-xl border border-border bg-card p-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">#{ticket.id.slice(-6)}</span>
                          <p className="font-semibold text-foreground">{ticket.title}</p>
                        </div>
                        <p className="text-xs text-muted-foreground">{formatDate(ticket.createdAt)}</p>
                      </div>
                      <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-700">{statusLabel(ticket.status)}</span>
                    </div>
                  ))}
                  {!user?.supportTickets.length && <p className="rounded-2xl border border-border bg-card p-5 text-sm text-muted-foreground">지원 티켓이 없습니다.</p>}
                </div>
              </div>
            )}

            <div className="rounded-2xl border border-border bg-card p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-semibold text-foreground">설치 프로그램 연동 준비 완료</p>
                  <p className="text-sm text-muted-foreground">설치 중 구매/코드 검증/활성화가 필요하면 아래 API 정보를 사용할 수 있습니다.</p>
                </div>
                <Link href="/api/installer/bootstrap?productSlug=hermes-agent&platform=WINDOWS">
                  <Button variant="outline" className="gap-2">연동 정보 보기 <ArrowRight className="h-4 w-4" /></Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
