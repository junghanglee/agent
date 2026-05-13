import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const products = await prisma.agentProduct.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      releases: {
        orderBy: { createdAt: 'desc' },
        take: 3,
      },
      _count: {
        select: {
          purchases: true,
          licenses: true,
        },
      },
    },
  })

  return NextResponse.json({ products })
}
