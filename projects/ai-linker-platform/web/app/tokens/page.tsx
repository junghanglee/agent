export const dynamic = 'force-dynamic'

import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { Button } from '@/components/ui/button'
import { prisma } from '@/lib/prisma'
import { TOKEN_PLANS, tokenAmountToCreditUsd } from '@/lib/token-plans'
import { Zap, TrendingDown, CheckCircle2, BarChart3, RefreshCw } from 'lucide-react'

async function chargeTokenPlanAction(formData: FormData) {
  'use server'
  const planId = String(formData.get('planId') ?? '')
  const plan = TOKEN_PLANS.find((item) => item.id === planId)
  if (!plan) throw new Error('토큰 플랜을 찾을 수 없습니다.')

  await prisma.$transaction(async (tx) => {
    const user = await tx.user.upsert({
      where: { email: 'customer@example.com' },
      update: { name: '김민준' },
      create: { email: 'customer@example.com', name: '김민준', status: 'ACTIVE' },
    })
    const purchase = await tx.purchase.create({
      data: {
        userId: user.id,
        status: 'PAID',
        totalAmount: plan.priceKrw,
        currency: 'KRW',
        payments: {
          create: {
            provider: 'manual-token-web',
            paymentKey: `token-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            amount: plan.priceKrw,
            currency: 'KRW',
            status: 'PAID',
            paidAt: new Date(),
            rawData: JSON.stringify({ source: 'tokens-page-dev', planId: plan.id, tokenAmount: plan.tokenAmount }),
          },
        },
      },
      include: { payments: true },
    })
    const creditUsd = tokenAmountToCreditUsd(plan.tokenAmount)
    const wallet = await tx.creditWallet.upsert({
      where: { userId: user.id },
      update: { balanceUsd: { increment: creditUsd }, status: 'ACTIVE' },
      create: { userId: user.id, balanceUsd: creditUsd, status: 'ACTIVE' },
    })
    await tx.creditTransaction.create({
      data: {
        walletId: wallet.id,
        userId: user.id,
        type: 'CHARGE',
        amountUsd: creditUsd,
        reason: `${plan.name} token credit charge`,
        relatedPaymentId: purchase.payments[0]?.id,
      },
    })
  })
}

function formatKrw(value: number) {
  return new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW', maximumFractionDigits: 0 }).format(value)
}

function formatUsd(value: unknown) {
  return `$${Number(value ?? 0).toLocaleString('en-US', { maximumFractionDigits: 4 })}`
}

function approxTokensFromCredit(value: unknown) {
  return Math.floor(Number(value ?? 0) * 5000).toLocaleString('ko-KR')
}

export default async function TokensPage() {
  const user = await prisma.user.findUnique({
    where: { email: 'customer@example.com' },
    include: { creditWallet: true, creditTransactions: { orderBy: { createdAt: 'desc' }, take: 5 } },
  })
  const balanceUsd = user?.creditWallet?.balanceUsd ?? 0

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="border-b border-border bg-brand-navy">
        <div className="mx-auto max-w-7xl px-4 py-12 md:px-8 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-brand-cyan/30 bg-brand-cyan/10 px-4 py-1.5 text-sm font-medium text-brand-cyan">
            <TrendingDown className="h-3.5 w-3.5" />
            시장가 대비 50% 이상 절약
          </div>
          <h1 className="text-3xl font-bold text-white md:text-4xl">LLM 토큰 충전</h1>
          <p className="mt-3 text-white/60 max-w-xl mx-auto">
            설치코드로 Agent를 활성화한 뒤, 토큰/크레딧 잔액이 있어야 AI Linker LLM 서비스를 사용할 수 있습니다.
          </p>

          <div className="mt-6 inline-flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-6 py-3">
            <Zap className="h-5 w-5 text-brand-cyan" />
            <span className="text-white/70 text-sm">현재 잔액</span>
            <span className="text-xl font-bold text-white">{approxTokensFromCredit(balanceUsd)} 토큰</span>
            <span className="text-sm text-white/50">({formatUsd(balanceUsd)})</span>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-12 md:px-8">
        <div className="mb-8 flex justify-center gap-2">
          <div className="rounded-full bg-brand-navy px-6 py-2.5 text-sm font-semibold text-white shadow-sm">크레딧 충전</div>
          <div className="rounded-full border border-border bg-card px-6 py-2.5 text-sm font-semibold text-muted-foreground">
            <RefreshCw className="inline h-3.5 w-3.5 mr-1.5" /> 구독 플랜 준비 중
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {TOKEN_PLANS.map((plan) => (
            <form
              action={chargeTokenPlanAction}
              key={plan.id}
              className={`relative flex flex-col rounded-2xl border p-6 transition-shadow ${
                plan.highlight
                  ? 'border-brand-navy bg-card shadow-lg shadow-brand-navy/10'
                  : 'border-border bg-card shadow-sm hover:shadow-md'
              }`}
            >
              <input type="hidden" name="planId" value={plan.id} />
              {plan.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-brand-navy px-3 py-0.5 text-xs font-bold text-white">가장 인기</div>
              )}

              <div className="mb-1 flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-cyan-soft">
                  <Zap className="h-4 w-4 text-brand-navy" />
                </div>
                <span className="font-bold text-foreground">{plan.name}</span>
              </div>

              <p className="mt-1 text-sm text-muted-foreground mb-4">{plan.description}</p>

              <div className="mb-1">
                <span className="text-3xl font-extrabold text-foreground">${plan.priceUsd}</span>
                <span className="ml-1 text-sm text-muted-foreground">{formatKrw(plan.priceKrw)}</span>
              </div>

              <div className="mb-4 rounded-lg bg-muted/60 p-3 space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-semibold text-foreground">{plan.tokenAmount.toLocaleString('ko-KR')} 토큰</span>
                  <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-bold text-green-700">{plan.saving} 절약</span>
                </div>
                <p className="text-xs text-muted-foreground line-through">시장가 ${plan.marketUsd}</p>
                <p className="text-xs text-muted-foreground">토큰당 {plan.perTokenUsd}</p>
              </div>

              <div className="mb-5 space-y-1">
                {plan.uses.map((useCase) => (
                  <div key={useCase} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <CheckCircle2 className="h-3.5 w-3.5 text-brand-cyan shrink-0" />
                    {useCase}
                  </div>
                ))}
              </div>

              <Button
                className={`mt-auto w-full font-semibold ${
                  plan.highlight
                    ? 'bg-brand-navy text-white hover:bg-brand-navy/90'
                    : 'border border-brand-navy bg-transparent text-brand-navy hover:bg-brand-navy hover:text-white'
                }`}
              >
                개발용 즉시 충전
              </Button>
            </form>
          ))}
        </div>

        <div className="mt-12 grid gap-5 lg:grid-cols-2">
          <div className="rounded-2xl border border-border bg-card p-6">
            <div className="flex items-center gap-2 mb-5">
              <BarChart3 className="h-5 w-5 text-brand-cyan" />
              <h2 className="font-bold text-foreground">타 서비스 가격 비교</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="py-2 text-left text-muted-foreground font-medium">서비스</th>
                    <th className="py-2 text-center text-muted-foreground font-medium">100만 토큰당</th>
                    <th className="py-2 text-center text-muted-foreground font-medium">절감율</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { name: 'OpenAI 직접 구매', price: '$15.00', saving: '-', highlight: false },
                    { name: 'Anthropic 직접 구매', price: '$12.00', saving: '-', highlight: false },
                    { name: 'AI Linker (Pro Credit)', price: '$6.00', saving: '60% 절약', highlight: true },
                  ].map((row) => (
                    <tr key={row.name} className={`border-b border-border ${row.highlight ? 'bg-brand-cyan-soft' : ''}`}>
                      <td className={`py-3 font-medium ${row.highlight ? 'text-brand-navy' : 'text-foreground'}`}>{row.name}</td>
                      <td className={`py-3 text-center ${row.highlight ? 'font-bold text-brand-navy' : 'text-foreground'}`}>{row.price}</td>
                      <td className="py-3 text-center">{row.saving !== '-' ? <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-bold text-green-700">{row.saving}</span> : <span className="text-muted-foreground">-</span>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6">
            <h2 className="mb-4 font-bold text-foreground">최근 토큰 거래</h2>
            <div className="space-y-3">
              {(user?.creditTransactions ?? []).map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between border-b border-border pb-3 last:border-0 last:pb-0">
                  <div>
                    <p className="text-sm font-medium text-foreground">{transaction.reason}</p>
                    <p className="text-xs text-muted-foreground">{transaction.type}</p>
                  </div>
                  <span className="font-bold text-foreground">{formatUsd(transaction.amountUsd)}</span>
                </div>
              ))}
              {!user?.creditTransactions.length && <p className="text-sm text-muted-foreground">아직 거래 내역이 없습니다.</p>}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
