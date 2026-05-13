import { prisma } from '@/lib/prisma'
import { updateReleaseSchema } from '@/lib/admin-validation'
import { fail, ok, serializeForJson, validationFail } from '@/lib/api-response'

type Params = { params: Promise<{ id: string }> }

export async function GET(_request: Request, { params }: Params) {
  const { id } = await params
  const release = await prisma.agentRelease.findUnique({
    where: { id },
    include: { agentProduct: true, installerFile: true },
  })

  if (!release) return fail('릴리즈를 찾을 수 없습니다.', 404)
  return ok(serializeForJson(release))
}

export async function PATCH(request: Request, { params }: Params) {
  const { id } = await params
  const parsed = updateReleaseSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return validationFail(parsed.error)

  const { installerFile, installerFileId, isLatest, ...rest } = parsed.data

  try {
    const release = await prisma.$transaction(async (tx) => {
      const current = await tx.agentRelease.findUnique({ where: { id } })
      if (!current) throw new Error('NOT_FOUND')

      const nextProductId = rest.agentProductId ?? current.agentProductId
      const nextPlatform = rest.platform ?? current.platform

      if (isLatest) {
        await tx.agentRelease.updateMany({
          where: { agentProductId: nextProductId, platform: nextPlatform, id: { not: id } },
          data: { isLatest: false },
        })
      }

      return tx.agentRelease.update({
        where: { id },
        data: {
          ...rest,
          ...(typeof isLatest === 'boolean' ? { isLatest } : {}),
          ...(installerFile
            ? { installerFile: { create: { ...installerFile, platform: installerFile.platform ?? nextPlatform } } }
            : typeof installerFileId !== 'undefined'
              ? installerFileId
                ? { installerFile: { connect: { id: installerFileId } } }
                : { installerFile: { disconnect: true } }
              : {}),
        },
        include: { agentProduct: true, installerFile: true },
      })
    })

    return ok(serializeForJson(release))
  } catch (error) {
    if (error instanceof Error && error.message === 'NOT_FOUND') return fail('릴리즈를 찾을 수 없습니다.', 404)
    return fail('릴리즈 수정에 실패했습니다.', 400)
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  const { id } = await params

  try {
    const release = await prisma.agentRelease.update({
      where: { id },
      data: { status: 'ARCHIVED', isLatest: false },
    })
    return ok(serializeForJson(release))
  } catch {
    return fail('릴리즈 보관 처리에 실패했습니다.', 400)
  }
}
