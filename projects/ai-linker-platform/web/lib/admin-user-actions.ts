'use server'

import { revalidatePath } from 'next/cache'
import { requireSuperAdminSession, hashAdminPassword } from '@/lib/admin-auth'
import { recordAdminAudit } from '@/lib/admin-audit'
import { createAdminUserSchema, updateAdminUserSchema } from '@/lib/admin-validation'
import { prisma } from '@/lib/prisma'

export async function createAdminUserAction(formData: FormData) {
  const session = await requireSuperAdminSession()

  const parsed = createAdminUserSchema.safeParse({
    email: formData.get('email'),
    name: formData.get('name'),
    password: formData.get('password'),
    role: formData.get('role') || 'ADMIN',
    status: formData.get('status') || 'ACTIVE',
  })

  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? '관리자 계정 입력값이 올바르지 않습니다.')

  if (parsed.data.role === 'SUPER_ADMIN') {
    throw new Error('슈퍼관리자 추가는 보안상 직접 DB/운영 절차로만 처리합니다. 이 화면에서는 서브관리자만 생성하세요.')
  }

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

  revalidatePath('/admin/admin-users')
}

export async function updateAdminUserAction(formData: FormData) {
  const session = await requireSuperAdminSession()

  const id = String(formData.get('id') ?? '')
  if (!id) throw new Error('관리자 계정 ID가 필요합니다.')

  const rawPassword = String(formData.get('password') ?? '')
  const parsed = updateAdminUserSchema.safeParse({
    email: formData.get('email'),
    name: formData.get('name'),
    ...(rawPassword ? { password: rawPassword } : {}),
    role: formData.get('role'),
    status: formData.get('status'),
  })

  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? '관리자 계정 입력값이 올바르지 않습니다.')
  if (id === session.id && (parsed.data.status || parsed.data.role)) {
    throw new Error('현재 로그인한 슈퍼관리자의 권한 또는 상태는 이 화면에서 변경할 수 없습니다.')
  }

  const before = await prisma.adminUser.findUnique({
    where: { id },
    select: { id: true, email: true, name: true, role: true, status: true, createdAt: true, updatedAt: true },
  })
  if (!before) throw new Error('관리자 계정을 찾을 수 없습니다.')
  if (before.role === 'SUPER_ADMIN' && parsed.data.role === 'ADMIN') {
    throw new Error('슈퍼관리자 강등은 보안상 이 화면에서 처리할 수 없습니다.')
  }
  if (before.role === 'ADMIN' && parsed.data.role === 'SUPER_ADMIN') {
    throw new Error('서브관리자 승격은 보안상 이 화면에서 처리할 수 없습니다.')
  }

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
    session,
    action: 'ADMIN_USER_UPDATE',
    entityType: 'AdminUser',
    entityId: admin.id,
    beforeData: before,
    afterData: { ...admin, passwordChanged: Boolean(parsed.data.password) },
  })

  revalidatePath('/admin/admin-users')
}

export async function suspendAdminUserAction(formData: FormData) {
  const next = new FormData()
  next.set('id', String(formData.get('id') ?? ''))
  next.set('status', 'SUSPENDED')
  await updateAdminUserAction(next)
}

export async function activateAdminUserAction(formData: FormData) {
  const next = new FormData()
  next.set('id', String(formData.get('id') ?? ''))
  next.set('status', 'ACTIVE')
  await updateAdminUserAction(next)
}
