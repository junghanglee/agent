import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'

type Tx = Prisma.TransactionClient

type PaymentProviderEvent = {
  provider: string
  paymentKey: string
  purchaseId?: string | null
  status: 'PENDING' | 'PAID' | 'FAILED' | 'CANCELLED' | 'REFUNDED'
  amount: number
  currency: string
  paidAt?: Date | null
  cancelledAt?: Date | null
  rawData?: unknown
  tokenCreditUsd?: number | null
}

function generateInstallCode() {
  const block = () => Math.random().toString(36).slice(2, 6).toUpperCase()
  return `AIL-${block()}-${block()}-${block()}`
}

async function createUniqueInstallCode(tx: Tx) {
  for (let i = 0; i < 8; i += 1) {
    const code = generateInstallCode()
    const exists = await tx.installCode.findUnique({ where: { code } })
    if (!exists) return code
  }
  throw new Error('INSTALL_CODE_GENERATION_FAILED')
}

export async function issueLicenseForPaidPurchase(tx: Tx, purchaseId: string) {
  const purchase = await tx.purchase.findUnique({ where: { id: purchaseId }, include: { installCodes: true, licenses: true } })
  if (!purchase?.agentProductId) return null
  if (purchase.installCodes.length > 0 || purchase.licenses.length > 0) return null

  const code = await createUniqueInstallCode(tx)
  const installCode = await tx.installCode.create({
    data: {
      purchaseId: purchase.id,
      userId: purchase.userId,
      code,
      status: 'ACTIVE',
      maxActivations: 1,
    },
  })
  const license = await tx.license.create({
    data: {
      userId: purchase.userId,
      agentProductId: purchase.agentProductId,
      purchaseId: purchase.id,
      installCodeId: installCode.id,
      status: 'ACTIVE',
    },
  })
  return { installCode, license }
}

async function chargeTokenWallet(tx: Tx, purchaseId: string, paymentId: string, amountUsd: number) {
  const purchase = await tx.purchase.findUnique({ where: { id: purchaseId }, include: { user: true } })
  if (!purchase || purchase.agentProductId || amountUsd <= 0) return null

  const wallet = await tx.creditWallet.upsert({
    where: { userId: purchase.userId },
    update: { balanceUsd: { increment: amountUsd }, status: 'ACTIVE' },
    create: { userId: purchase.userId, balanceUsd: amountUsd, status: 'ACTIVE' },
  })
  const transaction = await tx.creditTransaction.create({
    data: {
      walletId: wallet.id,
      userId: purchase.userId,
      type: 'CHARGE',
      amountUsd,
      reason: `결제 충전 ${paymentId}`,
      relatedPaymentId: paymentId,
    },
  })
  return { wallet, transaction }
}

export async function processPaymentProviderEvent(event: PaymentProviderEvent) {
  return prisma.$transaction(async (tx) => {
    const before = event.paymentKey ? await tx.payment.findUnique({ where: { paymentKey: event.paymentKey } }) : null
    const existingByPurchase = !before && event.purchaseId
      ? await tx.payment.findFirst({ where: { purchaseId: event.purchaseId, provider: event.provider, status: { in: ['PENDING', 'FAILED'] } }, orderBy: { createdAt: 'desc' } })
      : null

    const paidAt = event.status === 'PAID' ? event.paidAt ?? before?.paidAt ?? new Date() : event.paidAt ?? before?.paidAt ?? null
    const cancelledAt = ['CANCELLED', 'REFUNDED'].includes(event.status) ? event.cancelledAt ?? before?.cancelledAt ?? new Date() : event.cancelledAt ?? before?.cancelledAt ?? null
    const rawData = JSON.stringify(event.rawData ?? event)

    const payment = before
      ? await tx.payment.update({
          where: { id: before.id },
          data: { purchaseId: event.purchaseId ?? before.purchaseId, provider: event.provider, amount: event.amount, currency: event.currency, status: event.status, paidAt, cancelledAt, rawData },
        })
      : existingByPurchase
        ? await tx.payment.update({
            where: { id: existingByPurchase.id },
            data: { paymentKey: event.paymentKey, amount: event.amount, currency: event.currency, status: event.status, paidAt, cancelledAt, rawData },
          })
        : await tx.payment.create({
            data: { purchaseId: event.purchaseId ?? null, provider: event.provider, paymentKey: event.paymentKey, amount: event.amount, currency: event.currency, status: event.status, paidAt, cancelledAt, rawData },
          })

    let purchase = null
    let licenseResult = null
    let walletResult = null

    if (payment.purchaseId) {
      const purchaseStatus = event.status === 'PAID' ? 'PAID' : event.status === 'REFUNDED' ? 'REFUNDED' : event.status === 'CANCELLED' ? 'CANCELLED' : event.status === 'FAILED' ? 'CANCELLED' : 'PENDING'
      purchase = await tx.purchase.update({ where: { id: payment.purchaseId }, data: { status: purchaseStatus } })

      if (event.status === 'PAID') {
        licenseResult = await issueLicenseForPaidPurchase(tx, payment.purchaseId)
        walletResult = await chargeTokenWallet(tx, payment.purchaseId, payment.id, event.tokenCreditUsd ?? 0)
      }
    }

    return { before, payment, purchase, licenseResult, walletResult }
  })
}
