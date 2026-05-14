'use server'

import { redirect } from 'next/navigation'
import { clearAdminSession, createAdminSession, validateAdminLogin } from '@/lib/admin-auth'

export async function adminLoginAction(formData: FormData) {
  const email = String(formData.get('email') ?? '')
  const password = String(formData.get('password') ?? '')

  if (!email || !password) {
    redirect('/admin/login?error=missing')
  }

  let admin
  try {
    admin = await validateAdminLogin(email, password)
  } catch (error) {
    console.error('Admin login configuration error:', error)
    redirect('/admin/login?error=config')
  }

  if (!admin) {
    redirect('/admin/login?error=invalid')
  }

  await createAdminSession(admin.id)
  redirect('/admin')
}

export async function adminLogoutAction() {
  await clearAdminSession()
  redirect('/admin/login')
}
