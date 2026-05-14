import { recordAdminAudit } from '@/lib/admin-audit'
import { requireAdminApiSession } from '@/lib/admin-auth'
import { approvePaymentSchema } from '@/lib/admin-validation'
import { fail, ok, serializeForJson, validationFail } from '@/lib/api-response'
import { processPaymentProviderEvent } from '@/lib/payment-processing'

export async function POST(request: Request) {
  const { session, response } = await requireAdminApiSession('PAYMENTS_MANAGE')
  if (response) return response

  const parsed = approvePaymentSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return validationFail(parsed.error)

  try {
    const result = await processPaymentProviderEvent({
      provider: parsed.data.provider,
      paymentKey: parsed.data.paymentKey,
      purchaseId: parsed.data.purchaseId,
      status: 'PAID',
      amount: parsed.data.amount,
      currency: parsed.data.currency,
      paidAt: new Date(),
      rawData: parsed.data.rawData ?? { approvedByAdmin: session.id },
      tokenCreditUsd: parsed.data.tokenCreditUsd,
    })

    await recordAdminAudit({
      session,
      action: 'PAYMENT_MANUAL_APPROVE',
      entityType: 'Payment',
      entityId: result.payment.id,
      beforeData: result.before,
      afterData: result,
    })

    return ok(serializeForJson(result))
  } catch {
    return fail('결제 승인 처리에 실패했습니다.', 400)
  }
}
