import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const releases = await prisma.agentRelease.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      agentProduct: { select: { id: true, name: true, slug: true } },
      installerFile: true,
    },
  })

  return NextResponse.json({ releases })
}
