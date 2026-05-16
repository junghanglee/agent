export const dynamic = 'force-dynamic'

import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { Button } from '@/components/ui/button'
import { prisma } from '@/lib/prisma'
import { TOKEN_PLANS, tokenAmountToCreditUsd } from '@/lib/token-plans'
import { Zap, TrendingDown, CheckCircle2, BarChart3, RefreshCw, MessageSquare } from 'lucide-react'

async function requestTokenChargeAction(formData: FormData) {
  'use server'
  const planId = String(formData.get('planId') ?? '')
  const name = String(formData.get('name') ?? '').trim() || '충전요청 고객'
  const email = String(formData.get('email') ?? '').trim() || `request-${Date.now()}@ai-linker.local`
  const memo = String(formData.get('memo') ?? '').trim()
  const plan = TOKEN_PLANS.find((item) => item.id === planId)
  if (!plan) throw new Error('토큰 플랜을 찾을 수 없습니다.')

  await prisma.$transaction(async (tx) => {
    const user = await tx.user.upsert({
      where: { email },
      update: { name },
      create: { email, name, status: 'PENDING' },
    })
    const ticket = await tx.supportTicket.create({
      data: {
        userId: user.id,
        category: 'token-charge-request',
        subject: `[충전요청] ${plan.name} / ${plan.tokenAmount.toLocaleString('ko-KR')} 토큰`,
        status: 'OPEN',
        messages: {
          create: {
            senderType: 'USER',
            senderId: user.id,
            message: [
              `충전 플랜: ${plan.name}`,
              `요청 금액: ${plan.priceKrw.toLocaleString('ko-KR')}원 ($${plan.priceUsd})`,
              `지급 토큰: ${plan.tokenAmount.toLocaleString('ko-KR')} 토큰`,
              `크레딧 환산: $${tokenAmountToCreditUsd(plan.tokenAmount)}`,
              memo ? `요청 메모: ${memo}` : null,
            ].filter(Boolean).join('\n'),
          },
        },
      },
    })
    await tx.purchase.create({
      data: {
        userId: user.id,
        status: 'PENDING',
        totalAmount: plan.priceKrw,
        currency: 'KRW',
        payments: {
          create: {
            provider: 'manual-token-request',
            paymentKey: `token-request-${ticket.id}`,
            amount: plan.priceKrw,
            currency: 'KRW',
            status: 'PENDING',
            rawData: JSON.stringify({ source: 'tokens-page-request', planId: plan.id, ticketId: ticket.id }),
          },
        },
      },
    })
  })
}

function formatKrw(value: number) {
  return new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW', maximumFractionDigits: 0 }).format(value)
}

export default async function TokensPage() {
  const recentRequests = await prisma.supportTicket.findMany({
    where: { category: 'token-charge-request' },
    orderBy: { createdAt: 'desc' },
    take: 5,
    include: { user: { select: { name: true, email: true } } },
  })

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="border-b border-border bg-brand-navy pt-20">
        <div className="mx-auto max-w-7xl px-4 py-12 md:px-8 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-brand-cyan/30 bg-brand-cyan/10 px-4 py-1.5 text-sm font-medium text-brand-cyan">
            <TrendingDown className="h-3.5 w-3.5" />시장가 대비 50% 이상 절약
          </div>
          <h1 className="text-3xl font-bold text-white md:text-4xl">LLM 토큰 충전요청</h1>
          <p className="mt-3 text-white/60 max-w-xl mx-auto">
            로그인 없이 이름/연락처와 원하는 플랜만 남기면 관리자가 확인 후 수동 충전 처리합니다.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-12 md:px-8">
        <div className="mb-8 flex justify-center gap-2">
          <div className="rounded-full bg-brand-navy px-6 py-2.5 text-sm font-semibold text-white shadow-sm">충전요청</div>
          <div className="rounded-full border border-border bg-card px-6 py-2.5 text-sm font-semibold text-muted-foreground">
            <RefreshCw className="inline h-3.5 w-3.5 mr-1.5" />관리자 확인 후 처리
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {TOKEN_PLANS.map((plan) => (
            <form action={requestTokenChargeAction} key={plan.id} className={`relative flex flex-col rounded-2xl border p-6 transition-shadow ${plan.highlight ? 'border-brand-navy bg-card shadow-lg shadow-brand-navy/10' : 'border-border bg-card shadow-sm hover:shadow-md'}`}>
              <input type="hidden" name="planId" value={plan.id} />
              {plan.highlight && <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-brand-navy px-3 py-0.5 text-xs font-bold text-white">가장 인기</div>}
              <div className="mb-1 flex items-center gap-2"><div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-cyan-soft"><Zap className="h-4 w-4 text-brand-navy" /></div><span className="font-bold text-foreground">{plan.name}</span></div>
              <p className="mt-1 text-sm text-muted-foreground mb-4">{plan.description}</p>
              <div className="mb-1"><span className="text-3xl font-extrabold text-foreground">${plan.priceUsd}</span><span className="ml-1 text-sm text-muted-foreground">{formatKrw(plan.priceKrw)}</span></div>
              <div className="mb-4 rounded-lg bg-muted/60 p-3 space-y-1.5"><div className="flex items-center justify-between text-sm"><span className="font-semibold text-foreground">{plan.tokenAmount.toLocaleString('ko-KR')} 토큰</span><span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-bold text-green-700">{plan.saving} 절약</span></div><p className="text-xs text-muted-foreground line-through">시장가 ${plan.marketUsd}</p><p className="text-xs text-muted-foreground">토큰당 {plan.perTokenUsd}</p></div>
              <div className="mb-5 space-y-1">{plan.uses.map((useCase) => <div key={useCase} className="flex items-center gap-1.5 text-xs text-muted-foreground"><CheckCircle2 className="h-3.5 w-3.5 text-brand-cyan shrink-0" />{useCase}</div>)}</div>
              <div className="mt-auto space-y-2 border-t border-border pt-4"><input name="name" placeholder="이름/업체명" className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" /><input name="email" type="email" placeholder="연락 이메일" className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" /><textarea name="memo" rows={2} placeholder="요청 메모/입금자명" className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm" /><Button className={`w-full font-semibold ${plan.highlight ? 'bg-brand-navy text-white hover:bg-brand-navy/90' : 'border border-brand-navy bg-transparent text-brand-navy hover:bg-brand-navy hover:text-white'}`}>충전요청 남기기</Button></div>
            </form>
          ))}
        </div>

        <div className="mt-12 grid gap-5 lg:grid-cols-2">
          <div className="rounded-2xl border border-border bg-card p-6"><div className="flex items-center gap-2 mb-5"><BarChart3 className="h-5 w-5 text-brand-cyan" /><h2 className="font-bold text-foreground">타 서비스 가격 비교</h2></div><table className="w-full text-sm"><tbody>{[{ name: 'OpenAI 직접 구매', price: '$15.00', saving: '-' }, { name: 'Anthropic 직접 구매', price: '$12.00', saving: '-' }, { name: 'AI Linker', price: '$6.00', saving: '60% 절약' }].map((row) => <tr key={row.name} className="border-b border-border"><td className="py-3 font-medium text-foreground">{row.name}</td><td className="py-3 text-center text-foreground">{row.price}</td><td className="py-3 text-center text-muted-foreground">{row.saving}</td></tr>)}</tbody></table></div>
          <div className="rounded-2xl border border-border bg-card p-6"><div className="mb-4 flex items-center gap-2"><MessageSquare className="h-5 w-5 text-brand-cyan" /><h2 className="font-bold text-foreground">최근 충전요청</h2></div><div className="space-y-3">{recentRequests.map((request) => <div key={request.id} className="flex items-center justify-between border-b border-border pb-3 last:border-0"><div><p className="text-sm font-medium text-foreground">{request.subject}</p><p className="text-xs text-muted-foreground">{request.user.name} · {request.status}</p></div><span className="text-xs text-muted-foreground">#{request.id.slice(-6)}</span></div>)}{recentRequests.length === 0 && <p className="text-sm text-muted-foreground">아직 충전요청이 없습니다.</p>}</div></div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
