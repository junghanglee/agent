import { NextRequest } from 'next/server'
import { ok, serializeForJson } from '@/lib/api-response'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const productSlug = searchParams.get('productSlug') ?? 'hermes-agent'
  const platform = searchParams.get('platform')?.toUpperCase() ?? 'WINDOWS'

  const product = await prisma.agentProduct.findUnique({
    where: { slug: productSlug },
    select: { id: true, slug: true, name: true, shortDescription: true, price: true, status: true },
  })

  const release = await prisma.agentRelease.findFirst({
    where: {
      platform: platform as never,
      isLatest: true,
      status: 'PUBLISHED',
      agentProduct: { slug: productSlug },
    },
    orderBy: { createdAt: 'desc' },
    include: { installerFile: true },
  })

  return ok(serializeForJson({
    product,
    release,
    serviceAccess: {
      downloadRequiresPayment: false,
      llmConnectionRequiresPayment: true,
      installCodeRequiredForActivation: true,
    },
    links: {
      purchaseUrl: `${origin}/checkout?product=${encodeURIComponent(productSlug)}&platform=${encodeURIComponent(platform)}`,
      tokenUrl: `${origin}/tokens`,
      myPageUrl: `${origin}/mypage`,
      verifyInstallCodeUrl: `${origin}/api/install-codes/verify`,
      activateInstallCodeUrl: `${origin}/api/install-codes/activate`,
      latestReleaseUrl: `${origin}/api/releases/latest?productSlug=${encodeURIComponent(productSlug)}&platform=${encodeURIComponent(platform)}`,
    },
  }))
}
