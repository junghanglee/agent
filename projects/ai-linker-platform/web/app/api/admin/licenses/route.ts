import { assertAdminApiSession } from '@/lib/admin-auth'
import { prisma } from '@/lib/prisma'
import { ok, serializeForJson } from '@/lib/api-response'

export async function GET(request: Request) {
  const authError = await assertAdminApiSession()
  if (authError) return authError

  const { searchParams } = new URL(request.url)
  const query = searchParams.get('q')?.trim()

  const licenses = await prisma.license.findMany({
    where: query
      ? {
          OR: [
            { user: { name: { contains: query } } },
            { user: { email: { contains: query } } },
            { agentProduct: { name: { contains: query } } },
            { installCode: { code: { contains: query } } },
          ],
        }
      : undefined,
    orderBy: { createdAt: 'desc' },
    include: {
      user: { select: { id: true, name: true, email: true } },
      agentProduct: { select: { id: true, name: true, slug: true } },
      installCode: true,
      deviceActivations: true,
    },
  })

  return ok(serializeForJson(licenses))
}
