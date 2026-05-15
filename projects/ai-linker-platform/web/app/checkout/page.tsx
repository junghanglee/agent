import Link from 'next/link'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { Button } from '@/components/ui/button'
import { getCheckoutSummary } from '@/lib/public-store'
import {
  Bot, Monitor, Apple, Key, Download, BookOpen, Copy, CheckCircle2,
  ChevronRight, Zap, ArrowRight, CreditCard, ShieldCheck
} from 'lucide-react'

type CheckoutPageProps = {
  searchParams: Promise<{ product?: string; platform?: string; purchaseId?: string }>
}

function formatKrw(value: unknown) {
  const amount = Number(value ?? 0)
  return new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW', maximumFractionDigits: 0 }).format(amount)
}

function formatDate(value?: Date | string | null) {
  if (!value) return '—'
  return new Intl.DateTimeFormat('ko-KR', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value))
}

export default async function CheckoutPage({ searchParams }: CheckoutPageProps) {
  const params = await searchParams
  const platform = (params.platform ?? 'WINDOWS').toUpperCase()
  const { product, release, latestPaidPurchase } = await getCheckoutSummary(params.product ?? 'hermes-agent', platform)
  const installCode = latestPaidPurchase?.installCodes[0]
  const payment = latestPaidPurchase?.payments[0]
  const productName = product?.name ?? 'Hermes AI Agent'
  const price = product?.price ?? 0
  const downloadUrl = release?.installerFile?.downloadUrl

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="border-b border-border bg-card pt-16">
        <div className="mx-auto max-w-7xl px-4 py-3 md:px-8">
          <nav className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Link href="/" className="hover:text-foreground">홈</Link>
            <ChevronRight className="h-3 w-3" />
            <Link href="/agents/hermes" className="hover:text-foreground">Hermes AI Agent</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-foreground">구매/활성화</span>
          </nav>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-12 md:px-8">
        <div className="mb-8 rounded-2xl bg-brand-navy p-6 text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-brand-cyan/20">
            {installCode ? <CheckCircle2 className="h-7 w-7 text-brand-cyan" /> : <CreditCard className="h-7 w-7 text-brand-cyan" />}
          </div>
          <h1 className="text-xl font-bold text-white">{installCode ? '결제 완료 · 설치코드 발급 완료' : 'AI Linker 서비스 활성화'}</h1>
          <p className="mt-1 text-sm text-white/60">
            설치파일은 결제 전에도 받을 수 있고, 실제 LLM 서비스 연결 단계에서 결제/설치코드가 필요합니다.
          </p>
        </div>

        <div className="mb-5 rounded-2xl border border-border bg-card p-5">
          <h2 className="mb-4 text-sm font-semibold text-muted-foreground uppercase tracking-wide">상품 요약</h2>
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-brand-navy to-brand-violet/80">
              <Bot className="h-7 w-7 text-brand-cyan" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-foreground">{productName}</p>
              <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                {platform === 'IOS' ? <Apple className="h-3.5 w-3.5" /> : <Monitor className="h-3.5 w-3.5" />}
                <span>{platform} {release ? `v${release.version}` : '최신 버전 준비 중'}</span>
                <span>·</span>
                <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">초보자</span>
              </div>
            </div>
            <p className="text-lg font-bold text-foreground">{formatKrw(price)}</p>
          </div>

          <div className="mt-4 border-t border-border pt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">상태</span>
              <span className="font-medium text-foreground">{latestPaidPurchase ? '결제 완료' : '결제 전 · 다운로드 가능'}</span>
            </div>
            {latestPaidPurchase && (
              <>
                <div className="flex justify-between"><span className="text-muted-foreground">주문번호</span><span className="font-mono text-xs font-medium text-foreground">{latestPaidPurchase.id}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">결제 방법</span><span className="font-medium text-foreground">{payment?.provider ?? 'manual'}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">결제 일시</span><span className="font-medium text-foreground">{formatDate(payment?.paidAt ?? latestPaidPurchase.updatedAt)}</span></div>
              </>
            )}
          </div>
        </div>

        {installCode ? (
          <div className="mb-5 rounded-2xl border-2 border-brand-cyan/30 bg-brand-cyan-soft p-5">
            <div className="flex items-center gap-2 mb-3">
              <Key className="h-5 w-5 text-brand-navy" />
              <h2 className="font-bold text-brand-navy">설치코드가 발급되었습니다</h2>
            </div>
            <div className="flex items-center gap-2 rounded-xl border border-brand-navy/20 bg-white px-4 py-3">
              <code className="flex-1 text-base font-mono font-bold tracking-widest text-brand-navy">{installCode.code}</code>
              <Button size="sm" className="gap-1.5 bg-brand-navy text-white hover:bg-brand-navy/90" asChild>
                <Link href={`/mypage?tab=install-codes&code=${encodeURIComponent(installCode.code)}`}>
                  <Copy className="h-3.5 w-3.5" /> My Page에서 확인
                </Link>
              </Button>
            </div>
            <p className="mt-2 text-xs text-brand-navy/60">설치 프로그램의 LLM 연결/활성화 단계에서 이 코드를 입력하면 서비스가 활성화됩니다.</p>
          </div>
        ) : (
          <div className="mb-5 rounded-2xl border border-amber-200 bg-amber-50 p-5">
            <div className="flex items-start gap-3">
              <ShieldCheck className="mt-0.5 h-5 w-5 text-amber-700" />
              <div>
                <h2 className="font-bold text-amber-900">결제는 LLM 연결 단계에서 진행해도 됩니다</h2>
                <p className="mt-1 text-sm text-amber-800/80">먼저 설치해본 뒤, 실제 AI Linker LLM 서비스를 연결할 때 결제하고 설치코드를 발급받는 흐름으로 설계했습니다.</p>
              </div>
            </div>
          </div>
        )}

        <div className="mb-5 rounded-2xl border border-border bg-card p-5">
          <h2 className="mb-4 font-semibold text-foreground">설치파일 다운로드</h2>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button className="flex-1 gap-2 bg-brand-navy text-white hover:bg-brand-navy/90" disabled={!downloadUrl} asChild={Boolean(downloadUrl)}>
              {downloadUrl ? <a href={downloadUrl}><Monitor className="h-4 w-4" /> Windows 설치파일 다운로드</a> : <span><Monitor className="h-4 w-4" /> 설치파일 준비 중</span>}
            </Button>
            <Button variant="outline" className="flex-1 gap-2" asChild>
              <Link href="/api/installer/bootstrap?productSlug=hermes-agent&platform=WINDOWS"><Download className="h-4 w-4" /> 설치프로그램 연동 정보</Link>
            </Button>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">설치 프로그램은 위 연동 API를 통해 최신 버전, 구매 URL, 코드검증/활성화 URL을 자동 확인할 수 있습니다.</p>
        </div>

        <div className="mb-5 rounded-2xl border border-border bg-card p-5">
          <h2 className="mb-4 font-semibold text-foreground">다음 단계</h2>
          <div className="space-y-3">
            {[
              { n: 1, title: '설치파일 다운로드', desc: '결제 전이라도 최신 설치파일을 받을 수 있습니다.' },
              { n: 2, title: '설치프로그램 실행', desc: '설치 프로그램이 웹과 연결해 최신 릴리즈와 구매/검증 URL을 확인합니다.' },
              { n: 3, title: 'LLM 연결 단계에서 결제', desc: '실제 AI 서비스를 사용하려면 결제 후 설치코드를 발급받습니다.' },
              { n: 4, title: '설치코드 입력 및 토큰 충전', desc: '설치코드 활성화 후 토큰 잔액이 있으면 AI 기능을 사용할 수 있습니다.' },
            ].map((step) => (
              <div key={step.n} className="flex items-start gap-3">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-navy text-xs font-bold text-white">{step.n}</div>
                <div><p className="text-sm font-semibold text-foreground">{step.title}</p><p className="text-xs text-muted-foreground">{step.desc}</p></div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button variant="outline" className="flex-1 gap-2"><BookOpen className="h-4 w-4" /> 설치 매뉴얼 보기</Button>
          <Link href="/tokens" className="flex-1"><Button className="w-full gap-2 bg-brand-cyan text-brand-navy font-bold hover:bg-brand-cyan/90"><Zap className="h-4 w-4" /> 토큰 충전하기</Button></Link>
          <Link href="/mypage" className="flex-1"><Button variant="outline" className="w-full gap-2">My Page 보기<ArrowRight className="h-4 w-4" /></Button></Link>
        </div>
      </div>

      <Footer />
    </div>
  )
}
