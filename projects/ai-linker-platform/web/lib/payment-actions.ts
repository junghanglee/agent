'use server'

import { revalidatePath } from 'next/cache'
import { recordAdminAudit } from '@/lib/admin-audit'
import { requireAdminPagePermission } from '@/lib/admin-auth'
import { approvePaymentSchema, updatePaymentStatusSchema } from '@/lib/admin-validation'
import { processPaymentProviderEvent } from '@/lib/payment-processing'
import { prisma } from '@/lib/prisma'

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

export async function updatePaymentStatusAction(formData: FormData) {
  const session = await requireAdminPagePermission('PAYMENTS_MANAGE')

  const parsed = updatePaymentStatusSchema.safeParse({
    paymentId: formData.get('paymentId'),
    status: formData.get('status'),
    reason: formData.get('reason'),
  })

  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? '결제 상태 변경 입력값이 올바르지 않습니다.')

  const before = await prisma.payment.findUnique({
    where: { id: parsed.data.paymentId },
    include: { purchase: true },
  })
  if (!before) throw new Error('결제 내역을 찾을 수 없습니다.')
  if (before.status === 'PAID' && parsed.data.status !== 'REFUNDED') throw new Error('결제완료 건은 환불 처리만 가능합니다.')

  const nextPurchaseStatus = parsed.data.status === 'REFUNDED' ? 'REFUNDED' : parsed.data.status === 'FAILED' ? 'CANCELLED' : 'CANCELLED'

  const result = await prisma.$transaction(async (tx) => {
    const payment = await tx.payment.update({
      where: { id: before.id },
      data: {
        status: parsed.data.status,
        cancelledAt: ['CANCELLED', 'REFUNDED'].includes(parsed.data.status) ? new Date() : before.cancelledAt,
        rawData: JSON.stringify({ manualStatusChange: true, reason: parsed.data.reason, previousRawData: before.rawData }),
      },
    })

    const purchase = before.purchaseId
      ? await tx.purchase.update({ where: { id: before.purchaseId }, data: { status: nextPurchaseStatus } })
      : null

    return { payment, purchase }
  })

  await recordAdminAudit({
    session,
    action: `PAYMENT_${parsed.data.status}`,
    entityType: 'Payment',
    entityId: result.payment.id,
    beforeData: before,
    afterData: { ...result, reason: parsed.data.reason },
  })

  revalidatePath('/admin/payments')
  revalidatePath('/admin/customers')
}
