import { prisma } from '@/lib/prisma'
import { updateInstallCodeSchema } from '@/lib/admin-validation'
import { fail, ok, serializeForJson, validationFail } from '@/lib/api-response'

type Params = { params: Promise<{ id: string }> }

export async function PATCH(request: Request, { params }: Params) {
  const { id } = await params
  const parsed = updateInstallCodeSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return validationFail(parsed.error)

  try {
    const installCode = await prisma.installCode.update({
      where: { id },
      data: {
        ...parsed.data,
        ...(parsed.data.status === 'REVOKED' ? { revokedAt: new Date() } : {}),
      },
      include: { user: true, purchase: { include: { agentProduct: true } }, license: true },
    })

    return ok(serializeForJson(installCode))
  } catch {
    return fail('설치코드 수정에 실패했습니다.', 400)
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  const { id } = await params

  try {
    const installCode = await prisma.installCode.update({
      where: { id },
      data: { status: 'REVOKED', revokedAt: new Date() },
    })
    return ok(serializeForJson(installCode))
  } catch {
    return fail('설치코드 폐기에 실패했습니다.', 400)
  }
}
