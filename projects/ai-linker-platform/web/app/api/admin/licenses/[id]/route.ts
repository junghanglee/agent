import { assertAdminApiSession, requireAdminApiSession } from '@/lib/admin-auth'
import { prisma } from '@/lib/prisma'
import { recordAdminAudit } from '@/lib/admin-audit'
import { updateLicenseSchema } from '@/lib/admin-validation'
import { fail, ok, serializeForJson, validationFail } from '@/lib/api-response'

type Params = { params: Promise<{ id: string }> }

export async function PATCH(request: Request, { params }: Params) {
  const { session, response } = await requireAdminApiSession()
  if (response) return response

  const { id } = await params
  const parsed = updateLicenseSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return validationFail(parsed.error)

  try {
    const before = await prisma.license.findUnique({
      where: { id },
      include: { user: true, agentProduct: true, installCode: true, deviceActivations: true },
    })
    const license = await prisma.license.update({
      where: { id },
      data: parsed.data,
      include: { user: true, agentProduct: true, installCode: true, deviceActivations: true },
    })
    await recordAdminAudit({
      session,
      action: 'LICENSE_UPDATE',
      entityType: 'License',
      entityId: license.id,
      beforeData: before,
      afterData: license,
    })
    return ok(serializeForJson(license))
  } catch {
    return fail('라이선스 수정에 실패했습니다.', 400)
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  const { session, response } = await requireAdminApiSession()
  if (response) return response

  const { id } = await params

  try {
    const before = await prisma.license.findUnique({ where: { id } })
    const license = await prisma.license.update({
      where: { id },
      data: { status: 'REVOKED' },
    })
    await recordAdminAudit({
      session,
      action: 'LICENSE_REVOKE',
      entityType: 'License',
      entityId: license.id,
      beforeData: before,
      afterData: license,
    })
    return ok(serializeForJson(license))
  } catch {
    return fail('라이선스 폐기에 실패했습니다.', 400)
  }
}
