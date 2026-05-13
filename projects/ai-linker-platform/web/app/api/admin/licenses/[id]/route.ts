import { assertAdminApiSession } from '@/lib/admin-auth'
import { prisma } from '@/lib/prisma'
import { updateLicenseSchema } from '@/lib/admin-validation'
import { fail, ok, serializeForJson, validationFail } from '@/lib/api-response'

type Params = { params: Promise<{ id: string }> }

export async function PATCH(request: Request, { params }: Params) {
  const authError = await assertAdminApiSession()
  if (authError) return authError

  const { id } = await params
  const parsed = updateLicenseSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return validationFail(parsed.error)

  try {
    const license = await prisma.license.update({
      where: { id },
      data: parsed.data,
      include: { user: true, agentProduct: true, installCode: true, deviceActivations: true },
    })
    return ok(serializeForJson(license))
  } catch {
    return fail('라이선스 수정에 실패했습니다.', 400)
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  const authError = await assertAdminApiSession()
  if (authError) return authError

  const { id } = await params

  try {
    const license = await prisma.license.update({
      where: { id },
      data: { status: 'REVOKED' },
    })
    return ok(serializeForJson(license))
  } catch {
    return fail('라이선스 폐기에 실패했습니다.', 400)
  }
}
