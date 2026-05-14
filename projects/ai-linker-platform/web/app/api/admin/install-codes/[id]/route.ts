import { requireAdminApiSession } from '@/lib/admin-auth'
import { prisma } from '@/lib/prisma'
import { recordAdminAudit } from '@/lib/admin-audit'
import { updateInstallCodeSchema } from '@/lib/admin-validation'
import { fail, ok, serializeForJson, validationFail } from '@/lib/api-response'

type Params = { params: Promise<{ id: string }> }

export async function PATCH(request: Request, { params }: Params) {
  const { session, response } = await requireAdminApiSession('LICENSES_MANAGE')
  if (response) return response

  const { id } = await params
  const parsed = updateInstallCodeSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return validationFail(parsed.error)

  try {
    const before = await prisma.installCode.findUnique({
      where: { id },
      include: { user: true, purchase: { include: { agentProduct: true } }, license: true },
    })
    const installCode = await prisma.installCode.update({
      where: { id },
      data: {
        ...parsed.data,
        ...(parsed.data.status === 'REVOKED' ? { revokedAt: new Date() } : {}),
      },
      include: { user: true, purchase: { include: { agentProduct: true } }, license: true },
    })

    await recordAdminAudit({
      session,
      action: 'INSTALL_CODE_UPDATE',
      entityType: 'InstallCode',
      entityId: installCode.id,
      beforeData: before,
      afterData: installCode,
    })

    return ok(serializeForJson(installCode))
  } catch {
    return fail('설치코드 수정에 실패했습니다.', 400)
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  const { session, response } = await requireAdminApiSession('LICENSES_MANAGE')
  if (response) return response

  const { id } = await params

  try {
    const before = await prisma.installCode.findUnique({ where: { id } })
    const installCode = await prisma.installCode.update({
      where: { id },
      data: { status: 'REVOKED', revokedAt: new Date() },
    })
    await recordAdminAudit({
      session,
      action: 'INSTALL_CODE_REVOKE',
      entityType: 'InstallCode',
      entityId: installCode.id,
      beforeData: before,
      afterData: installCode,
    })
    return ok(serializeForJson(installCode))
  } catch {
    return fail('설치코드 폐기에 실패했습니다.', 400)
  }
}
