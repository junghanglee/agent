import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null)
  const code = typeof body?.code === 'string' ? body.code.trim().toUpperCase() : ''

  if (!code) {
    return NextResponse.json({ ok: false, error: 'INSTALL_CODE_REQUIRED' }, { status: 400 })
  }

  const installCode = await prisma.installCode.findUnique({
    where: { code },
    include: {
      user: { select: { id: true, name: true, email: true } },
      purchase: {
        include: {
          agentProduct: true,
        },
      },
      license: true,
    },
  })

  if (!installCode) {
    return NextResponse.json({ ok: false, error: 'INSTALL_CODE_NOT_FOUND' }, { status: 404 })
  }

  const isExpired = installCode.expiresAt ? installCode.expiresAt.getTime() < Date.now() : false
  const canActivate =
    installCode.status === 'ACTIVE' &&
    !isExpired &&
    installCode.usedActivations < installCode.maxActivations

  return NextResponse.json({
    ok: true,
    canActivate,
    installCode: {
      id: installCode.id,
      code: installCode.code,
      status: installCode.status,
      maxActivations: installCode.maxActivations,
      usedActivations: installCode.usedActivations,
      expiresAt: installCode.expiresAt,
    },
    user: installCode.user,
    product: installCode.purchase.agentProduct,
    license: installCode.license,
  })
}
