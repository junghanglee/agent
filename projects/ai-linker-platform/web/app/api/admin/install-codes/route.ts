import { assertAdminApiSession } from '@/lib/admin-auth'
import { prisma } from '@/lib/prisma'
import { issueInstallCodeSchema } from '@/lib/admin-validation'
import { fail, ok, serializeForJson, validationFail } from '@/lib/api-response'

function generateInstallCode() {
  const block = () => Math.random().toString(36).slice(2, 6).toUpperCase()
  return `AIL-${block()}-${block()}-${block()}`
}

export async function GET(request: Request) {
  const authError = await assertAdminApiSession()
  if (authError) return authError

  const { searchParams } = new URL(request.url)
  const query = searchParams.get('q')?.trim()

  const installCodes = await prisma.installCode.findMany({
    where: query
      ? {
          OR: [
            { code: { contains: query } },
            { user: { name: { contains: query } } },
            { user: { email: { contains: query } } },
            { purchase: { agentProduct: { name: { contains: query } } } },
          ],
        }
      : undefined,
    orderBy: { createdAt: 'desc' },
    include: {
      user: { select: { id: true, name: true, email: true } },
      purchase: { include: { agentProduct: { select: { id: true, name: true, slug: true } } } },
      license: { include: { deviceActivations: true } },
    },
  })

  return ok(serializeForJson(installCodes))
}

export async function POST(request: Request) {
  const authError = await assertAdminApiSession()
  if (authError) return authError

  const parsed = issueInstallCodeSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return validationFail(parsed.error)

  try {
    const result = await prisma.$transaction(async (tx) => {
      const purchase = await tx.purchase.findUnique({
        where: { id: parsed.data.purchaseId },
        include: { user: true, agentProduct: true },
      })

      if (!purchase || !purchase.agentProductId) throw new Error('PURCHASE_NOT_FOUND')

      let code = generateInstallCode()
      for (let i = 0; i < 5; i += 1) {
        const exists = await tx.installCode.findUnique({ where: { code } })
        if (!exists) break
        code = generateInstallCode()
      }

      const installCode = await tx.installCode.create({
        data: {
          purchaseId: purchase.id,
          userId: purchase.userId,
          code,
          status: parsed.data.status,
          maxActivations: parsed.data.maxActivations,
          expiresAt: parsed.data.expiresAt,
        },
      })

      const license = await tx.license.create({
        data: {
          userId: purchase.userId,
          agentProductId: purchase.agentProductId,
          purchaseId: purchase.id,
          installCodeId: installCode.id,
          status: 'ACTIVE',
          endsAt: parsed.data.expiresAt,
        },
      })

      return { installCode, license }
    })

    return ok(serializeForJson(result), { status: 201 })
  } catch (error) {
    if (error instanceof Error && error.message === 'PURCHASE_NOT_FOUND') return fail('유효한 구매 내역을 찾을 수 없습니다.', 404)
    return fail('설치코드 발급에 실패했습니다.', 500)
  }
}
