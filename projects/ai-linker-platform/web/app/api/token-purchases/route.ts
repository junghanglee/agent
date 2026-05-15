import { NextRequest } from 'next/server'
import { z } from 'zod'
import { fail, ok, serializeForJson, validationFail } from '@/lib/api-response'
import { prisma } from '@/lib/prisma'
import { findTokenPlan, tokenAmountToCreditUsd } from '@/lib/token-plans'

const schema = z.object({
  planId: z.string().trim().min(1),
  customerEmail: z.string().trim().email().default('customer@example.com'),
  customerName: z.string().trim().min(1).max(120).default('AI Linker Customer'),
  completeNow: z.boolean().default(false),
})

export async function POST(request: NextRequest) {
  const parsed = schema.safeParse(await request.json().catch(() => ({})))
  if (!parsed.success) return validationFail(parsed.error)

  const plan = findTokenPlan(parsed.data.planId)
  if (!plan) return fail('토큰 플랜을 찾을 수 없습니다.', 404)

  const result = await prisma.$transaction(async (tx) => {
    const user = await tx.user.upsert({
      where: { email: parsed.data.customerEmail.toLowerCase() },
      update: { name: parsed.data.customerName },
      create: { email: parsed.data.customerEmail.toLowerCase(), name: parsed.data.customerName, status: 'ACTIVE' },
    })

    const purchase = await tx.purchase.create({
      data: {
        userId: user.id,
        status: parsed.data.completeNow ? 'PAID' : 'PENDING',
        totalAmount: plan.priceKrw,
        currency: 'KRW',
        payments: {
          create: {
            provider: 'manual-token-web',
            paymentKey: `token-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            amount: plan.priceKrw,
            currency: 'KRW',
            status: parsed.data.completeNow ? 'PAID' : 'PENDING',
            paidAt: parsed.data.completeNow ? new Date() : null,
            rawData: JSON.stringify({ source: 'token-checkout', planId: plan.id, tokenAmount: plan.tokenAmount, creditUsd: tokenAmountToCreditUsd(plan.tokenAmount) }),
          },
        },
      },
      include: { payments: true },
    })

    let wallet = null
    let transaction = null
    if (parsed.data.completeNow) {
      wallet = await tx.creditWallet.upsert({
        where: { userId: user.id },
        update: { balanceUsd: { increment: tokenAmountToCreditUsd(plan.tokenAmount) }, status: 'ACTIVE' },
        create: { userId: user.id, balanceUsd: tokenAmountToCreditUsd(plan.tokenAmount), status: 'ACTIVE' },
      })
      transaction = await tx.creditTransaction.create({
        data: {
          walletId: wallet.id,
          userId: user.id,
          type: 'CHARGE',
          amountUsd: tokenAmountToCreditUsd(plan.tokenAmount),
          reason: `${plan.name} token credit charge`,
          relatedPaymentId: purchase.payments[0]?.id,
        },
      })
    }

    return { user, purchase, wallet, transaction, plan }
  })

  return ok(serializeForJson({ ...result, myPageUrl: '/mypage?tab=%ED%86%A0%ED%81%B0' }), { status: 201 })
}
