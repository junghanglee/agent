import { assertAdminApiSession } from '@/lib/admin-auth'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const authError = await assertAdminApiSession('DASHBOARD_READ')
  if (authError) return authError

  const [
    users,
    agentProducts,
    releases,
    purchases,
    payments,
    installCodes,
    licenses,
    wallets,
    providers,
    supportTickets,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.agentProduct.count(),
    prisma.agentRelease.count(),
    prisma.purchase.count(),
    prisma.payment.count(),
    prisma.installCode.count(),
    prisma.license.count(),
    prisma.creditWallet.count(),
    prisma.lLMProvider.count(),
    prisma.supportTicket.count(),
  ])

  const recentPurchases = await prisma.purchase.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    include: {
      user: { select: { id: true, name: true, email: true } },
      agentProduct: { select: { id: true, name: true, slug: true } },
    },
  })

  const llmAlerts = await prisma.lLMAccount.findMany({
    take: 5,
    where: {
      status: { in: ['WARNING', 'CRITICAL'] },
    },
    orderBy: [{ status: 'asc' }, { priority: 'asc' }],
    include: {
      provider: { select: { name: true, status: true } },
    },
  })

  return NextResponse.json({
    counts: {
      users,
      agentProducts,
      releases,
      purchases,
      payments,
      installCodes,
      licenses,
      wallets,
      providers,
      supportTickets,
    },
    recentPurchases,
    llmAlerts,
  })
}
