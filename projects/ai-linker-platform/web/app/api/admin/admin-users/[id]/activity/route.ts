import { requireAdminApiSession } from '@/lib/admin-auth'
import { fail, ok, serializeForJson } from '@/lib/api-response'
import { prisma } from '@/lib/prisma'

type Params = { params: Promise<{ id: string }> }

export async function GET(_request: Request, { params }: Params) {
  const { session, response } = await requireAdminApiSession()
  if (response) return response
  if (session?.role !== 'SUPER_ADMIN') return fail('슈퍼관리자 권한이 필요합니다.', 403)

  const { id } = await params
  const admin = await prisma.adminUser.findUnique({
    where: { id },
    select: { id: true, email: true, name: true, role: true, status: true },
  })
  if (!admin) return fail('관리자 계정을 찾을 수 없습니다.', 404)

  const auditLogs = await prisma.auditLog.findMany({
    where: { adminUserId: id },
    take: 100,
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      action: true,
      entityType: true,
      entityId: true,
      ipAddress: true,
      beforeData: true,
      afterData: true,
      createdAt: true,
    },
  })

  return ok(serializeForJson({ admin, auditLogs }))
}
