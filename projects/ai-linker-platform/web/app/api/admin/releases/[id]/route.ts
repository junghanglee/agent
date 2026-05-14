import { assertAdminApiSession, requireAdminApiSession } from '@/lib/admin-auth'
import { prisma } from '@/lib/prisma'
import { recordAdminAudit } from '@/lib/admin-audit'
import { updateReleaseSchema } from '@/lib/admin-validation'
import { fail, ok, serializeForJson, validationFail } from '@/lib/api-response'

type Params = { params: Promise<{ id: string }> }

export async function GET(_request: Request, { params }: Params) {
  const authError = await assertAdminApiSession()
  if (authError) return authError

  const { id } = await params
  const release = await prisma.agentRelease.findUnique({
    where: { id },
    include: { agentProduct: true, installerFile: true },
  })

  if (!release) return fail('릴리즈를 찾을 수 없습니다.', 404)
  return ok(serializeForJson(release))
}

export async function PATCH(request: Request, { params }: Params) {
  const { session, response } = await requireAdminApiSession()
  if (response) return response

  const { id } = await params
  const parsed = updateReleaseSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return validationFail(parsed.error)

  const { installerFile, installerFileId, isLatest, agentProductId, ...rest } = parsed.data

  try {
    const { before, release } = await prisma.$transaction(async (tx) => {
      const current = await tx.agentRelease.findUnique({ where: { id }, include: { installerFile: true } })
      if (!current) throw new Error('NOT_FOUND')

      const nextProductId = agentProductId ?? current.agentProductId
      const nextPlatform = rest.platform ?? current.platform

      if (isLatest) {
        await tx.agentRelease.updateMany({
          where: { agentProductId: nextProductId, platform: nextPlatform, id: { not: id } },
          data: { isLatest: false },
        })
      }

      const release = await tx.agentRelease.update({
        where: { id },
        data: {
          ...rest,
          ...(agentProductId ? { agentProduct: { connect: { id: agentProductId } } } : {}),
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

      return { before: current, release }
    })

    await recordAdminAudit({
      session,
      action: 'AGENT_RELEASE_UPDATE',
      entityType: 'AgentRelease',
      entityId: release.id,
      beforeData: before,
      afterData: release,
    })

    return ok(serializeForJson(release))
  } catch (error) {
    if (error instanceof Error && error.message === 'NOT_FOUND') return fail('릴리즈를 찾을 수 없습니다.', 404)
    return fail('릴리즈 수정에 실패했습니다.', 400)
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  const { session, response } = await requireAdminApiSession()
  if (response) return response

  const { id } = await params

  try {
    const before = await prisma.agentRelease.findUnique({ where: { id }, include: { installerFile: true } })
    const release = await prisma.agentRelease.update({
      where: { id },
      data: { status: 'ARCHIVED', isLatest: false },
      include: { installerFile: true },
    })
    await recordAdminAudit({
      session,
      action: 'AGENT_RELEASE_ARCHIVE',
      entityType: 'AgentRelease',
      entityId: release.id,
      beforeData: before,
      afterData: release,
    })
    return ok(serializeForJson(release))
  } catch {
    return fail('릴리즈 보관 처리에 실패했습니다.', 400)
  }
}
