import { assertAdminApiSession, requireAdminApiSession } from '@/lib/admin-auth'
import { prisma } from '@/lib/prisma'
import { recordAdminAudit } from '@/lib/admin-audit'
import { createProductSchema } from '@/lib/admin-validation'
import { fail, ok, serializeForJson, validationFail } from '@/lib/api-response'

export async function GET() {
  const authError = await assertAdminApiSession()
  if (authError) return authError

  const products = await prisma.agentProduct.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      _count: { select: { releases: true, purchases: true, licenses: true } },
    },
  })

  return ok(serializeForJson(products))
}

export async function POST(request: Request) {
  const { session, response } = await requireAdminApiSession()
  if (response) return response

  const parsed = createProductSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return validationFail(parsed.error)

  try {
    const product = await prisma.agentProduct.create({
      data: {
        ...parsed.data,
        purposeTags: JSON.stringify(parsed.data.purposeTags),
        supportedPlatforms: JSON.stringify(parsed.data.supportedPlatforms),
      },
    })

    await recordAdminAudit({
      session,
      action: 'AGENT_PRODUCT_CREATE',
      entityType: 'AgentProduct',
      entityId: product.id,
      afterData: product,
    })

    return ok(serializeForJson(product), { status: 201 })
  } catch (error) {
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      return fail('이미 사용 중인 상품 slug입니다.', 409)
    }
    return fail('상품 생성에 실패했습니다.', 500)
  }
}
