import { assertAdminApiSession, requireAdminApiSession } from '@/lib/admin-auth'
import { prisma } from '@/lib/prisma'
import { recordAdminAudit } from '@/lib/admin-audit'
import { updateProductSchema } from '@/lib/admin-validation'
import { fail, ok, serializeForJson, validationFail } from '@/lib/api-response'

type Params = { params: Promise<{ id: string }> }

export async function GET(_request: Request, { params }: Params) {
  const authError = await assertAdminApiSession('PRODUCTS_MANAGE')
  if (authError) return authError

  const { id } = await params
  const product = await prisma.agentProduct.findUnique({
    where: { id },
    include: {
      releases: { orderBy: { createdAt: 'desc' }, include: { installerFile: true } },
      _count: { select: { purchases: true, licenses: true, communityPosts: true } },
    },
  })

  if (!product) return fail('상품을 찾을 수 없습니다.', 404)
  return ok(serializeForJson(product))
}

export async function PATCH(request: Request, { params }: Params) {
  const { session, response } = await requireAdminApiSession('PRODUCTS_MANAGE')
  if (response) return response

  const { id } = await params
  const parsed = updateProductSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return validationFail(parsed.error)

  const { purposeTags, supportedPlatforms, ...rest } = parsed.data

  try {
    const before = await prisma.agentProduct.findUnique({ where: { id } })
    const product = await prisma.agentProduct.update({
      where: { id },
      data: {
        ...rest,
        ...(purposeTags ? { purposeTags: JSON.stringify(purposeTags) } : {}),
        ...(supportedPlatforms ? { supportedPlatforms: JSON.stringify(supportedPlatforms) } : {}),
      },
    })
    await recordAdminAudit({
      session,
      action: 'AGENT_PRODUCT_UPDATE',
      entityType: 'AgentProduct',
      entityId: product.id,
      beforeData: before,
      afterData: product,
    })
    return ok(serializeForJson(product))
  } catch {
    return fail('상품 수정에 실패했습니다.', 400)
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  const { session, response } = await requireAdminApiSession('PRODUCTS_MANAGE')
  if (response) return response

  const { id } = await params

  try {
    const before = await prisma.agentProduct.findUnique({ where: { id } })
    const product = await prisma.agentProduct.update({
      where: { id },
      data: { status: 'ARCHIVED' },
    })
    await recordAdminAudit({
      session,
      action: 'AGENT_PRODUCT_ARCHIVE',
      entityType: 'AgentProduct',
      entityId: product.id,
      beforeData: before,
      afterData: product,
    })
    return ok(serializeForJson(product))
  } catch {
    return fail('상품 보관 처리에 실패했습니다.', 400)
  }
}
