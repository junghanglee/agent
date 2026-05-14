'use client'

import { useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { ADMIN_ROLE_PERMISSIONS, type AdminRole } from '@/lib/admin-permissions'
import { getAdminRoutePermission } from '@/lib/admin-routes'

export function AdminPageGuard({ role }: { role: AdminRole }) {
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    const permission = getAdminRoutePermission(pathname)
    if (!ADMIN_ROLE_PERMISSIONS[role].includes(permission)) router.replace('/admin')
  }, [pathname, role, router])

  return null
}
