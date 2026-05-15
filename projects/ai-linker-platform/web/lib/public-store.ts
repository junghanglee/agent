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

const purchaseInclude = {
  user: { select: { id: true, name: true, email: true } },
  agentProduct: true,
  payments: { orderBy: { createdAt: 'desc' as const }, take: 1 },
  installCodes: { orderBy: { createdAt: 'desc' as const }, take: 1, include: { license: true } },
}

export async function getCheckoutSummary(productSlug = DEFAULT_PRODUCT_SLUG, platform = DEFAULT_PLATFORM, purchaseId?: string) {
  const { product, release } = await getProductWithLatestRelease(productSlug, platform)
  const selectedPurchase = purchaseId
    ? await prisma.purchase.findUnique({ where: { id: purchaseId }, include: purchaseInclude })
    : null
  const latestPaidPurchase = !selectedPurchase && product
    ? await prisma.purchase.findFirst({
        where: { agentProductId: product.id, platform: platform as never, status: 'PAID' },
        orderBy: { createdAt: 'desc' },
        include: purchaseInclude,
      })
    : null

  return { product: selectedPurchase?.agentProduct ?? product, release, purchase: selectedPurchase ?? latestPaidPurchase }
}

export async function getDemoCustomerWorkspace(email = 'customer@example.com') {
  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      creditWallet: true,
      creditTransactions: { orderBy: { createdAt: 'desc' }, take: 20 },
      purchases: {
        orderBy: { createdAt: 'desc' },
        include: {
          agentProduct: true,
          payments: { orderBy: { createdAt: 'desc' }, take: 1 },
          installCodes: { include: { license: { include: { deviceActivations: true } } }, orderBy: { createdAt: 'desc' } },
        },
      },
      supportTickets: { orderBy: { createdAt: 'desc' }, take: 10 },
    },
  })
  const latestReleases = await prisma.agentRelease.findMany({
    where: { isLatest: true, status: 'PUBLISHED' },
    include: { installerFile: true, agentProduct: true },
  })
  return { user, latestReleases }
}
