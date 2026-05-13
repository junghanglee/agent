import { assertAdminApiSession } from '@/lib/admin-auth'
import { prisma } from '@/lib/prisma'
import { createReleaseSchema } from '@/lib/admin-validation'
import { fail, ok, serializeForJson, validationFail } from '@/lib/api-response'

export async function GET() {
  const authError = await assertAdminApiSession()
  if (authError) return authError

  const releases = await prisma.agentRelease.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      agentProduct: { select: { id: true, name: true, slug: true } },
      installerFile: true,
    },
  })

  return ok(serializeForJson(releases))
}

export async function POST(request: Request) {
  const authError = await assertAdminApiSession()
  if (authError) return authError

  const parsed = createReleaseSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return validationFail(parsed.error)

  const { installerFile, installerFileId, isLatest, ...releaseData } = parsed.data

  try {
    const release = await prisma.$transaction(async (tx) => {
      if (isLatest) {
        await tx.agentRelease.updateMany({
          where: { agentProductId: releaseData.agentProductId, platform: releaseData.platform },
          data: { isLatest: false },
        })
      }

      return tx.agentRelease.create({
        data: {
          ...releaseData,
          isLatest,
          ...(installerFile
            ? { installerFile: { create: { ...installerFile, platform: installerFile.platform ?? releaseData.platform } } }
            : installerFileId
              ? { installerFile: { connect: { id: installerFileId } } }
              : {}),
        },
        include: { agentProduct: true, installerFile: true },
      })
    })

    return ok(serializeForJson(release), { status: 201 })
  } catch (error) {
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      return fail('이미 존재하는 릴리즈 버전입니다.', 409)
    }
    return fail('릴리즈 생성에 실패했습니다.', 500)
  }
}
