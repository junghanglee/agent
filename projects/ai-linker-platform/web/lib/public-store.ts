import { prisma } from '@/lib/prisma'

export const DEFAULT_PRODUCT_SLUG = 'hermes-agent'
export const DEFAULT_PLATFORM = 'WINDOWS'

export async function getLatestRelease(productSlug = DEFAULT_PRODUCT_SLUG, platform = DEFAULT_PLATFORM) {
  return prisma.agentRelease.findFirst({
    where: {
      platform: platform as never,
      isLatest: true,
      status: 'PUBLISHED',
      agentProduct: { slug: productSlug },
    },
    orderBy: { createdAt: 'desc' },
    include: {
      agentProduct: true,
      installerFile: true,
    },
  })
}

export async function getProductWithLatestRelease(productSlug = DEFAULT_PRODUCT_SLUG, platform = DEFAULT_PLATFORM) {
  const product = await prisma.agentProduct.findUnique({ where: { slug: productSlug } })
  const release = await getLatestRelease(productSlug, platform)
  return { product, release }
}

export async function getCheckoutSummary(productSlug = DEFAULT_PRODUCT_SLUG, platform = DEFAULT_PLATFORM) {
  const { product, release } = await getProductWithLatestRelease(productSlug, platform)
  const latestPaidPurchase = product
    ? await prisma.purchase.findFirst({
        where: { agentProductId: product.id, platform: platform as never, status: 'PAID' },
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, name: true, email: true } },
          payments: { orderBy: { createdAt: 'desc' }, take: 1 },
          installCodes: { orderBy: { createdAt: 'desc' }, take: 1, include: { license: true } },
        },
      })
    : null

  return { product, release, latestPaidPurchase }
}
