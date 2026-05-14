'use server'

import { revalidatePath } from 'next/cache'
import { recordAdminAudit } from '@/lib/admin-audit'
import { requireAdminPagePermission } from '@/lib/admin-auth'
import { approvePaymentSchema } from '@/lib/admin-validation'
import { processPaymentProviderEvent } from '@/lib/payment-processing'

export async function approvePaymentAction(formData: FormData) {
  const session = await requireAdminPagePermission('PAYMENTS_MANAGE')
  const parsed = approvePaymentSchema.safeParse({
    provider: formData.get('provider') || 'manual',
    paymentKey: formData.get('paymentKey'),
    purchaseId: formData.get('purchaseId') || null,
    amount: formData.get('amount'),
    currency: formData.get('currency') || 'KRW',
    tokenCreditUsd: formData.get('tokenCreditUsd') || undefined,
  })
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? '결제 승인 입력값이 올바르지 않습니다.')

  const result = await processPaymentProviderEvent({
    provider: parsed.data.provider,
    paymentKey: parsed.data.paymentKey,
    purchaseId: parsed.data.purchaseId,
    status: 'PAID',
    amount: parsed.data.amount,
    currency: parsed.data.currency,
    paidAt: new Date(),
    rawData: { approvedByAdmin: session.id, source: 'admin-action' },
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

  revalidatePath('/admin/payments')
  revalidatePath('/admin/licenses')
  revalidatePath('/admin/tokens')
}
