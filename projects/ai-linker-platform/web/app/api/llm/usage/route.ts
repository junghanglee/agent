import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null)

  const userId = typeof body?.userId === 'string' ? body.userId : ''
  const requestId = typeof body?.requestId === 'string' ? body.requestId : ''
  const inputTokens = Number(body?.inputTokens ?? 0)
  const outputTokens = Number(body?.outputTokens ?? 0)
  const chargedUsd = Number(body?.chargedUsd ?? 0)
  const costUsd = Number(body?.costUsd ?? 0)

  if (!userId || !requestId) {
    return NextResponse.json({ ok: false, error: 'USER_ID_AND_REQUEST_ID_REQUIRED' }, { status: 400 })
  }

  const wallet = await prisma.creditWallet.findUnique({ where: { userId } })
  if (!wallet) {
    return NextResponse.json({ ok: false, error: 'WALLET_NOT_FOUND' }, { status: 404 })
  }

  const currentBalance = Number(wallet.balanceUsd)
  if (chargedUsd > currentBalance) {
    return NextResponse.json({ ok: false, error: 'INSUFFICIENT_CREDIT' }, { status: 402 })
  }

  const result = await prisma.$transaction(async (tx) => {
    const usage = await tx.usageEvent.create({
      data: {
        userId,
        requestId,
        inputTokens,
        outputTokens,
        costUsd,
        chargedUsd,
      },
    })

    const updatedWallet = await tx.creditWallet.update({
      where: { id: wallet.id },
      data: {
        balanceUsd: currentBalance - chargedUsd,
      },
    })

    await tx.creditTransaction.create({
      data: {
        walletId: wallet.id,
        userId,
        type: 'USAGE_DEDUCTION',
        amountUsd: -chargedUsd,
        reason: `LLM usage deduction for ${requestId}`,
      },
    })

    return { usage, wallet: updatedWallet }
  })

  return NextResponse.json({ ok: true, ...result })
}
