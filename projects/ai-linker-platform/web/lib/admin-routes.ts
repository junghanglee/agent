import type { AdminPermission } from '@/lib/admin-permissions'

export const adminRoutePermissions: Record<string, AdminPermission> = {
  '/admin': 'DASHBOARD_READ',
  '/admin/customers': 'CUSTOMERS_READ',
  '/admin/products': 'PRODUCTS_MANAGE',
  '/admin/releases': 'RELEASES_MANAGE',
  '/admin/licenses': 'LICENSES_MANAGE',
  '/admin/payments': 'PAYMENTS_READ',
  '/admin/tokens': 'TOKENS_READ',
  '/admin/llm-pool': 'LLM_POOL_READ',
  '/admin/monitoring': 'MONITORING_READ',
  '/admin/audit': 'AUDIT_READ',
  '/admin/skills': 'SKILLS_MANAGE',
  '/admin/support': 'SUPPORT_MANAGE',
  '/admin/community': 'COMMUNITY_MANAGE',
  '/admin/admin-users': 'ADMIN_USERS_MANAGE',
  '/admin/settings': 'SETTINGS_MANAGE',
}

export function getAdminRoutePermission(pathname: string): AdminPermission {
  const matchedPath = Object.keys(adminRoutePermissions)
    .filter((path) => pathname === path || (path !== '/admin' && pathname.startsWith(`${path}/`)))
    .sort((a, b) => b.length - a.length)[0]

  return matchedPath ? adminRoutePermissions[matchedPath] : 'DASHBOARD_READ'
}
