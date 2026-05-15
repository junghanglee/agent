import { NextRequest } from 'next/server'
import { fail, ok, serializeForJson } from '@/lib/api-response'
import { issueLicenseForPaidPurchase } from '@/lib/payment-processing'
import { prisma } from '@/lib/prisma'

type Params = { params: Promise<{ id: string }> }

export async function POST(request: NextRequest, { params }: Params) {
  if (process.env.NODE_ENV === 'production' && process.env.ENABLE_MANUAL_PAYMENT_COMPLETE !== 'true') {
    return fail('운영 환경에서는 결제사 웹훅을 통해서만 결제를 완료할 수 있습니다.', 403)
  }

  const { id } = await params
  const purchase = await prisma.purchase.findUnique({
    where: { id },
    include: { payments: { orderBy: { createdAt: 'desc' }, take: 1 } },
  })
  if (!purchase) return fail('주문을 찾을 수 없습니다.', 404)
  if (!purchase.agentProductId) return fail('Agent 상품 주문이 아닙니다.', 400)

  const result = await prisma.$transaction(async (tx) => {
    const paidPurchase = await tx.purchase.update({ where: { id }, data: { status: 'PAID' } })
    const latestPayment = purchase.payments[0]
    const payment = latestPayment
      ? await tx.payment.update({
          where: { id: latestPayment.id },
          data: { status: 'PAID', paidAt: new Date(), rawData: JSON.stringify({ source: 'manual-complete-dev', purchaseId: id }) },
        })
      : await tx.payment.create({
          data: {
            purchaseId: id,
            provider: 'manual-web',
            paymentKey: `manual-complete-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            amount: purchase.totalAmount,
            currency: purchase.currency,
            status: 'PAID',
            paidAt: new Date(),
            rawData: JSON.stringify({ source: 'manual-complete-dev', purchaseId: id }),
          },
        })
    const licenseResult = await issueLicenseForPaidPurchase(tx, id)
    return { purchase: paidPurchase, payment, licenseResult }
  })

  return ok(serializeForJson({ ...result, checkoutUrl: `/checkout?purchaseId=${encodeURIComponent(id)}` }))
}
