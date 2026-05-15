import { NextRequest } from 'next/server'
import { z } from 'zod'
import { fail, ok, serializeForJson, validationFail } from '@/lib/api-response'
import { prisma } from '@/lib/prisma'

const createPurchaseSchema = z.object({
  productSlug: z.string().trim().min(1).default('hermes-agent'),
  platform: z.enum(['WINDOWS', 'MACOS', 'IOS', 'ANDROID', 'WEB']).default('WINDOWS'),
  customerEmail: z.string().trim().email().default('customer@example.com'),
  customerName: z.string().trim().min(1).max(120).default('AI Linker Customer'),
})

export async function POST(request: NextRequest) {
  const parsed = createPurchaseSchema.safeParse(await request.json().catch(() => ({})))
  if (!parsed.success) return validationFail(parsed.error)

  const product = await prisma.agentProduct.findUnique({ where: { slug: parsed.data.productSlug } })
  if (!product || product.status !== 'ACTIVE') return fail('구매 가능한 Agent 상품을 찾을 수 없습니다.', 404)

  const user = await prisma.user.upsert({
    where: { email: parsed.data.customerEmail.toLowerCase() },
    update: { name: parsed.data.customerName },
    create: { email: parsed.data.customerEmail.toLowerCase(), name: parsed.data.customerName, status: 'ACTIVE' },
  })

  const purchase = await prisma.purchase.create({
    data: {
      userId: user.id,
      agentProductId: product.id,
      platform: parsed.data.platform,
      status: 'PENDING',
      totalAmount: product.price,
      currency: 'KRW',
      payments: {
        create: {
          provider: 'manual-web',
          paymentKey: `manual-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          amount: product.price,
          currency: 'KRW',
          status: 'PENDING',
          rawData: JSON.stringify({ source: 'web-checkout', productSlug: parsed.data.productSlug }),
        },
      },
    },
    include: { user: true, agentProduct: true, payments: { orderBy: { createdAt: 'desc' }, take: 1 } },
  })

  return ok(serializeForJson({
    purchase,
    checkoutUrl: `/checkout?purchaseId=${encodeURIComponent(purchase.id)}`,
  }), { status: 201 })
}
