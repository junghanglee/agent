import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const productSlug = searchParams.get('productSlug') ?? 'hermes-agent'
  const platform = searchParams.get('platform')?.toUpperCase() ?? 'WINDOWS'

  const release = await prisma.agentRelease.findFirst({
    where: {
      platform: platform as never,
      isLatest: true,
      status: 'PUBLISHED',
      agentProduct: {
        slug: productSlug,
      },
    },
    orderBy: { createdAt: 'desc' },
    include: {
      agentProduct: { select: { id: true, slug: true, name: true } },
      installerFile: true,
    },
  })

  if (!release) {
    return NextResponse.json({ ok: false, error: 'LATEST_RELEASE_NOT_FOUND' }, { status: 404 })
  }

  if (searchParams.get('download') === '1') {
    if (!release.installerFile?.downloadUrl) {
      return NextResponse.json({ ok: false, error: 'INSTALLER_FILE_NOT_FOUND' }, { status: 404 })
    }
    return NextResponse.redirect(new URL(release.installerFile.downloadUrl, request.url))
  }

  return NextResponse.json({ ok: true, release })
}
