'use server'

import { revalidatePath } from 'next/cache'
import { requireAdminPagePermission } from '@/lib/admin-auth'
import { recordAdminAudit } from '@/lib/admin-audit'
import { adjustCreditSchema, updateWalletStatusSchema } from '@/lib/admin-validation'
import { prisma } from '@/lib/prisma'

export async function adjustCreditAction(formData: FormData) {
  const session = await requireAdminPagePermission('TOKENS_MANAGE')

  const parsed = adjustCreditSchema.safeParse({
    userId: formData.get('userId'),
    type: formData.get('type'),
    amountUsd: formData.get('amountUsd'),
    reason: formData.get('reason'),
  })

  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? '크레딧 조정 입력값이 올바르지 않습니다.')

  const amount = parsed.data.type === 'DEDUCT' ? -parsed.data.amountUsd : parsed.data.amountUsd

  const result = await prisma.$transaction(async (tx) => {
    const user = await tx.user.findUnique({ where: { id: parsed.data.userId }, select: { id: true, name: true, email: true, status: true } })
    if (!user) throw new Error('고객을 찾을 수 없습니다.')
    if (user.status === 'DELETED') throw new Error('삭제된 고객의 크레딧은 조정할 수 없습니다.')

    const wallet = await tx.creditWallet.upsert({
      where: { userId: user.id },
      create: { userId: user.id, balanceUsd: 0, status: 'ACTIVE' },
      update: {},
    })

    if (wallet.status !== 'ACTIVE') throw new Error('정지된 지갑의 크레딧은 조정할 수 없습니다.')

    const beforeBalance = Number(wallet.balanceUsd)
    const afterBalance = beforeBalance + amount
    if (afterBalance < 0) throw new Error('차감 후 잔액이 0보다 작아질 수 없습니다.')

    const updatedWallet = await tx.creditWallet.update({
      where: { id: wallet.id },
      data: { balanceUsd: afterBalance },
    })

    const transaction = await tx.creditTransaction.create({
      data: {
        walletId: updatedWallet.id,
        userId: user.id,
        type: 'MANUAL_ADJUSTMENT',
        amountUsd: amount,
        reason: parsed.data.reason,
      },
    })

    return { user, beforeWallet: wallet, afterWallet: updatedWallet, transaction }
  })

  await recordAdminAudit({
    session,
    action: parsed.data.type === 'DEDUCT' ? 'CREDIT_MANUAL_DEDUCT' : 'CREDIT_MANUAL_GRANT',
    entityType: 'CreditWallet',
    entityId: result.afterWallet.id,
    beforeData: { user: result.user, wallet: result.beforeWallet },
    afterData: { user: result.user, wallet: result.afterWallet, transaction: result.transaction },
  })

  revalidatePath('/admin/tokens')
  revalidatePath('/admin/customers')
}

export async function updateWalletStatusAction(formData: FormData) {
  const session = await requireAdminPagePermission('TOKENS_MANAGE')

  const parsed = updateWalletStatusSchema.safeParse({
    userId: formData.get('userId'),
    status: formData.get('status'),
    reason: formData.get('reason'),
  })

  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? '지갑 상태 변경 입력값이 올바르지 않습니다.')

  const result = await prisma.$transaction(async (tx) => {
    const user = await tx.user.findUnique({ where: { id: parsed.data.userId }, select: { id: true, name: true, email: true, status: true } })
    if (!user) throw new Error('고객을 찾을 수 없습니다.')
    if (user.status === 'DELETED') throw new Error('삭제된 고객의 지갑은 변경할 수 없습니다.')

    const beforeWallet = await tx.creditWallet.upsert({
      where: { userId: user.id },
      create: { userId: user.id, balanceUsd: 0, status: 'ACTIVE' },
      update: {},
    })

    const afterWallet = await tx.creditWallet.update({
      where: { id: beforeWallet.id },
      data: { status: parsed.data.status },
    })

    const transaction = await tx.creditTransaction.create({
      data: {
        walletId: afterWallet.id,
        userId: user.id,
        type: 'MANUAL_ADJUSTMENT',
        amountUsd: 0,
        reason: `[지갑 ${parsed.data.status}] ${parsed.data.reason}`,
      },
    })

    return { user, beforeWallet, afterWallet, transaction }
  })

  await recordAdminAudit({
    session,
    action: parsed.data.status === 'SUSPENDED' ? 'CREDIT_WALLET_SUSPEND' : 'CREDIT_WALLET_ACTIVATE',
    entityType: 'CreditWallet',
    entityId: result.afterWallet.id,
    beforeData: { user: result.user, wallet: result.beforeWallet },
    afterData: { user: result.user, wallet: result.afterWallet, transaction: result.transaction },
  })

  revalidatePath('/admin/tokens')
  revalidatePath('/admin/customers')
}
