import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

type ActivateBody = {
  code?: unknown
  deviceId?: unknown
  deviceName?: unknown
  platform?: unknown
}

function normalizePlatform(value: unknown) {
  const platform = typeof value === 'string' ? value.trim().toUpperCase() : 'WINDOWS'
  return ['WINDOWS', 'MACOS', 'IOS', 'ANDROID', 'WEB'].includes(platform) ? platform : 'WINDOWS'
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null) as ActivateBody | null
  const code = typeof body?.code === 'string' ? body.code.trim().toUpperCase() : ''
  const deviceId = typeof body?.deviceId === 'string' ? body.deviceId.trim() : ''
  const deviceName = typeof body?.deviceName === 'string' ? body.deviceName.trim() : null
  const platform = normalizePlatform(body?.platform)

  if (!code) return NextResponse.json({ ok: false, error: 'INSTALL_CODE_REQUIRED' }, { status: 400 })
  if (!deviceId) return NextResponse.json({ ok: false, error: 'DEVICE_ID_REQUIRED' }, { status: 400 })

  try {
    const result = await prisma.$transaction(async (tx) => {
      const installCode = await tx.installCode.findUnique({
        where: { code },
        include: { license: true, purchase: { include: { agentProduct: true } }, user: { include: { creditWallet: true } } },
      })

      if (!installCode) return { status: 404 as const, body: { ok: false, error: 'INSTALL_CODE_NOT_FOUND' } }
      if (!installCode.license) return { status: 409 as const, body: { ok: false, error: 'LICENSE_NOT_ISSUED' } }
      if (installCode.purchase.status !== 'PAID') return { status: 402 as const, body: { ok: false, error: 'PAYMENT_REQUIRED' } }
      if (installCode.status === 'REVOKED') return { status: 403 as const, body: { ok: false, error: 'INSTALL_CODE_REVOKED' } }
      if (installCode.status === 'EXPIRED' || (installCode.expiresAt && installCode.expiresAt.getTime() < Date.now())) {
        return { status: 410 as const, body: { ok: false, error: 'INSTALL_CODE_EXPIRED' } }
      }
      if (installCode.license.status !== 'ACTIVE') return { status: 403 as const, body: { ok: false, error: 'LICENSE_NOT_ACTIVE' } }

      const existingActivation = await tx.deviceActivation.findUnique({
        where: { licenseId_deviceId: { licenseId: installCode.license.id, deviceId } },
      })

      const isNewActivation = !existingActivation
      if (isNewActivation && installCode.usedActivations >= installCode.maxActivations) {
        return { status: 409 as const, body: { ok: false, error: 'MAX_ACTIVATIONS_REACHED' } }
      }

      const activation = existingActivation
        ? await tx.deviceActivation.update({
            where: { id: existingActivation.id },
            data: { lastSeenAt: new Date(), deviceName, platform: platform as never, status: 'ACTIVE' },
          })
        : await tx.deviceActivation.create({
            data: {
              licenseId: installCode.license.id,
              userId: installCode.userId,
              deviceId,
              deviceName,
              platform: platform as never,
              status: 'ACTIVE',
              lastSeenAt: new Date(),
            },
          })

      const updatedCode = isNewActivation
        ? await tx.installCode.update({
            where: { id: installCode.id },
            data: {
              usedActivations: { increment: 1 },
              usedAt: installCode.usedAt ?? new Date(),
              status: installCode.usedActivations + 1 >= installCode.maxActivations ? 'USED' : 'ACTIVE',
            },
          })
        : installCode

      return {
        status: 200 as const,
        body: {
          ok: true,
          activation,
          installCode: {
            id: updatedCode.id,
            code: updatedCode.code,
            status: updatedCode.status,
            maxActivations: updatedCode.maxActivations,
            usedActivations: updatedCode.usedActivations,
          },
          license: installCode.license,
          product: installCode.purchase.agentProduct,
          user: { id: installCode.user.id, name: installCode.user.name, email: installCode.user.email },
          serviceAccess: {
            llmEnabled: Number(installCode.user.creditWallet?.balanceUsd ?? 0) > 0,
            requiresTokenBalance: true,
            walletStatus: installCode.user.creditWallet?.status ?? 'MISSING',
            balanceUsd: installCode.user.creditWallet?.balanceUsd ?? '0',
            reason: Number(installCode.user.creditWallet?.balanceUsd ?? 0) > 0 ? 'READY' : 'INSUFFICIENT_CREDIT',
          },
        },
      }
    })

    return NextResponse.json(result.body, { status: result.status })
  } catch {
    return NextResponse.json({ ok: false, error: 'INSTALL_CODE_ACTIVATION_FAILED' }, { status: 500 })
  }
}
