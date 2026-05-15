import { headers } from 'next/headers'
import { AdminPageGuard } from '@/components/admin/admin-page-guard'
import { AdminSidebar } from '@/components/admin/sidebar'
import { AdminTopbar } from '@/components/admin/topbar'
import { requireAdminSession } from '@/lib/admin-auth'

export const dynamic = 'force-dynamic'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const headerStore = await headers()
  const pathname = headerStore.get('x-pathname')

  if (pathname === '/admin/login') {
    return children
  }

  const admin = await requireAdminSession()

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <AdminSidebar role={admin.role} />
      <div className="flex flex-col flex-1 overflow-hidden">
        <AdminTopbar admin={admin} />
        <main className="flex-1 overflow-y-auto p-6">
          <AdminPageGuard role={admin.role} />
          {children}
        </main>
      </div>
    </div>
  )
}
