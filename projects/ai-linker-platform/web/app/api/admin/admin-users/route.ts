import { requireAdminApiSession, hashAdminPassword } from '@/lib/admin-auth'
import { recordAdminAudit } from '@/lib/admin-audit'
import { fail, ok, serializeForJson, validationFail } from '@/lib/api-response'
import { createAdminUserSchema } from '@/lib/admin-validation'
import { prisma } from '@/lib/prisma'

function requireSuperAdmin(session: { role: string } | null) {
  return session?.role === 'SUPER_ADMIN'
}

export async function GET() {
  const { session, response } = await requireAdminApiSession()
  if (response) return response
  if (!requireSuperAdmin(session)) return fail('슈퍼관리자 권한이 필요합니다.', 403)

  const admins = await prisma.adminUser.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      status: true,
      createdAt: true,
      updatedAt: true,
      _count: { select: { auditLogs: true } },
    },
  })

  return ok(serializeForJson(admins))
}

export async function POST(request: Request) {
  const { session, response } = await requireAdminApiSession()
  if (response) return response
  if (!requireSuperAdmin(session)) return fail('슈퍼관리자 권한이 필요합니다.', 403)

  const parsed = createAdminUserSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return validationFail(parsed.error)

  try {
    const admin = await prisma.adminUser.create({
      data: {
        email: parsed.data.email.trim().toLowerCase(),
        name: parsed.data.name.trim(),
        passwordHash: hashAdminPassword(parsed.data.password),
        role: parsed.data.role,
        status: parsed.data.status,
      },
      select: { id: true, email: true, name: true, role: true, status: true, createdAt: true, updatedAt: true },
    })

    await recordAdminAudit({
      session,
      action: 'ADMIN_USER_CREATE',
      entityType: 'AdminUser',
      entityId: admin.id,
      afterData: admin,
    })

    return ok(serializeForJson(admin), { status: 201 })
  } catch (error) {
    if (error instanceof Error && error.message.includes('Unique constraint')) return fail('이미 사용 중인 관리자 이메일입니다.', 409)
    return fail('관리자 계정 생성에 실패했습니다.', 500)
  }
}
