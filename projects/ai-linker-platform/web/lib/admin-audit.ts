import { prisma } from '@/lib/prisma'
import type { AdminSession } from '@/lib/admin-auth'

type AuditInput = {
  session: AdminSession
  action: string
  entityType: string
  entityId?: string | null
  beforeData?: unknown
  afterData?: unknown
}

function stringifyAuditData(value: unknown) {
  if (typeof value === 'undefined') return undefined
  return JSON.stringify(value, (_key, item) => {
    if (typeof item === 'bigint') return item.toString()
    if (item && typeof item === 'object' && typeof item.toString === 'function' && item.constructor?.name === 'Decimal') return item.toString()
    return item
  })
}

export async function recordAdminAudit({ session, action, entityType, entityId, beforeData, afterData }: AuditInput) {
  await prisma.auditLog.create({
    data: {
      adminUserId: session.id,
      action,
      entityType,
      entityId: entityId ?? undefined,
      beforeData: stringifyAuditData(beforeData),
      afterData: stringifyAuditData(afterData),
    },
  })
}
