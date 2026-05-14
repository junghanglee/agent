import { requireAdminApiSession, hashAdminPassword } from '@/lib/admin-auth'
import { recordAdminAudit } from '@/lib/admin-audit'
import { fail, ok, serializeForJson, validationFail } from '@/lib/api-response'
import { updateAdminUserSchema } from '@/lib/admin-validation'
import { prisma } from '@/lib/prisma'

type Params = { params: Promise<{ id: string }> }

export async function PATCH(request: Request, { params }: Params) {
  const { session, response } = await requireAdminApiSession('ADMIN_USERS_MANAGE')
  if (response) return response

  const { id } = await params
  const parsed = updateAdminUserSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return validationFail(parsed.error)

  if (id === session!.id && (parsed.data.status || parsed.data.role)) {
    return fail('현재 로그인한 슈퍼관리자의 권한 또는 상태는 이 화면에서 변경할 수 없습니다.', 400)
  }

  try {
    const before = await prisma.adminUser.findUnique({
      where: { id },
      select: { id: true, email: true, name: true, role: true, status: true, createdAt: true, updatedAt: true },
    })
    if (!before) return fail('관리자 계정을 찾을 수 없습니다.', 404)

    const admin = await prisma.adminUser.update({
      where: { id },
      data: {
        ...(parsed.data.email ? { email: parsed.data.email.trim().toLowerCase() } : {}),
        ...(parsed.data.name ? { name: parsed.data.name.trim() } : {}),
        ...(parsed.data.role ? { role: parsed.data.role } : {}),
        ...(parsed.data.status ? { status: parsed.data.status } : {}),
        ...(parsed.data.password ? { passwordHash: hashAdminPassword(parsed.data.password) } : {}),
      },
      select: { id: true, email: true, name: true, role: true, status: true, createdAt: true, updatedAt: true },
    })

    await recordAdminAudit({
      session: session!,
      action: 'ADMIN_USER_UPDATE',
      entityType: 'AdminUser',
      entityId: admin.id,
      beforeData: before,
      afterData: { ...admin, passwordChanged: Boolean(parsed.data.password) },
    })

    return ok(serializeForJson(admin))
  } catch (error) {
    if (error instanceof Error && error.message.includes('Unique constraint')) return fail('이미 사용 중인 관리자 이메일입니다.', 409)
    return fail('관리자 계정 수정에 실패했습니다.', 400)
  }
}
