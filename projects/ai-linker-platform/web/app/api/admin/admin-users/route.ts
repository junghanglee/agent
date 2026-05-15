import { requireAdminApiSession, hashAdminPassword } from '@/lib/admin-auth'
import { recordAdminAudit } from '@/lib/admin-audit'
import { fail, ok, serializeForJson, validationFail } from '@/lib/api-response'
import { createAdminUserSchema } from '@/lib/admin-validation'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const { response } = await requireAdminApiSession('ADMIN_USERS_MANAGE')
  if (response) return response

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
  const { session, response } = await requireAdminApiSession('ADMIN_USERS_MANAGE')
  if (response) return response

  const parsed = createAdminUserSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return validationFail(parsed.error)

  try {
    if (parsed.data.role === 'SUPER_ADMIN') return fail('슈퍼관리자 추가는 보안상 직접 DB/운영 절차로만 처리합니다.', 400)

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
