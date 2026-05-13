import { prisma } from '@/lib/prisma'
import { updateProductSchema } from '@/lib/admin-validation'
import { fail, ok, serializeForJson, validationFail } from '@/lib/api-response'

type Params = { params: Promise<{ id: string }> }

export async function GET(_request: Request, { params }: Params) {
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
  const { id } = await params
  const parsed = updateProductSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return validationFail(parsed.error)

  const { purposeTags, supportedPlatforms, ...rest } = parsed.data

  try {
    const product = await prisma.agentProduct.update({
      where: { id },
      data: {
        ...rest,
        ...(purposeTags ? { purposeTags: JSON.stringify(purposeTags) } : {}),
        ...(supportedPlatforms ? { supportedPlatforms: JSON.stringify(supportedPlatforms) } : {}),
      },
    })
    return ok(serializeForJson(product))
  } catch {
    return fail('상품 수정에 실패했습니다.', 400)
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  const { id } = await params

  try {
    const product = await prisma.agentProduct.update({
      where: { id },
      data: { status: 'ARCHIVED' },
    })
    return ok(serializeForJson(product))
  } catch {
    return fail('상품 보관 처리에 실패했습니다.', 400)
  }
}
