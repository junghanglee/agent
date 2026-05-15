'use server'

import { revalidatePath } from 'next/cache'
import { requireAdminPagePermission } from '@/lib/admin-auth'
import { recordAdminAudit } from '@/lib/admin-audit'
import { updateUserStatusSchema } from '@/lib/admin-validation'
import { prisma } from '@/lib/prisma'

export async function updateCustomerStatusAction(formData: FormData) {
  const session = await requireAdminPagePermission('ADMIN_USERS_MANAGE')

  const parsed = updateUserStatusSchema.safeParse({
    userId: formData.get('userId'),
    status: formData.get('status'),
    reason: formData.get('reason'),
  })

  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? '고객 상태 변경 입력값이 올바르지 않습니다.')

  const before = await prisma.user.findUnique({ where: { id: parsed.data.userId } })
  if (!before) throw new Error('고객을 찾을 수 없습니다.')
  if (before.status === 'DELETED') throw new Error('삭제된 고객은 상태를 변경할 수 없습니다.')

  const customer = await prisma.user.update({
    where: { id: parsed.data.userId },
    data: { status: parsed.data.status },
  })

  await recordAdminAudit({
    session,
    action: parsed.data.status === 'SUSPENDED' ? 'CUSTOMER_SUSPEND' : 'CUSTOMER_ACTIVATE',
    entityType: 'User',
    entityId: customer.id,
    beforeData: before,
    afterData: { customer, reason: parsed.data.reason },
  })

  revalidatePath('/admin/customers')
  revalidatePath('/admin/tokens')
}
