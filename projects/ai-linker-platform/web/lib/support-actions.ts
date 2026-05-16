'use server'

import { revalidatePath } from 'next/cache'
import { recordAdminAudit } from '@/lib/admin-audit'
import { requireAdminPagePermission } from '@/lib/admin-auth'
import { replySupportTicketSchema, updateSupportTicketStatusSchema } from '@/lib/admin-validation'
import { prisma } from '@/lib/prisma'

export async function updateSupportTicketStatusAction(formData: FormData) {
  const session = await requireAdminPagePermission('SUPPORT_MANAGE')
  const parsed = updateSupportTicketStatusSchema.safeParse({
    ticketId: formData.get('ticketId'),
    status: formData.get('status'),
  })

  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? '상담 상태 입력값이 올바르지 않습니다.')

  const before = await prisma.supportTicket.findUnique({ where: { id: parsed.data.ticketId } })
  if (!before) throw new Error('상담 티켓을 찾을 수 없습니다.')

  const ticket = await prisma.supportTicket.update({
    where: { id: parsed.data.ticketId },
    data: {
      status: parsed.data.status,
      assignedAdminId: before.assignedAdminId ?? session.id,
      closedAt: parsed.data.status === 'CLOSED' ? new Date() : null,
    },
  })

  await recordAdminAudit({
    session,
    action: 'SUPPORT_TICKET_STATUS_UPDATE',
    entityType: 'SupportTicket',
    entityId: ticket.id,
    beforeData: before,
    afterData: ticket,
  })

  revalidatePath('/admin/support')
}

export async function replySupportTicketAction(formData: FormData) {
  const session = await requireAdminPagePermission('SUPPORT_MANAGE')
  const parsed = replySupportTicketSchema.safeParse({
    ticketId: formData.get('ticketId'),
    message: formData.get('message'),
  })

  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? '상담 답변 입력값이 올바르지 않습니다.')

  const ticket = await prisma.supportTicket.findUnique({ where: { id: parsed.data.ticketId } })
  if (!ticket) throw new Error('상담 티켓을 찾을 수 없습니다.')

  const result = await prisma.$transaction(async (tx) => {
    const message = await tx.chatMessage.create({
      data: {
        ticketId: ticket.id,
        senderType: 'ADMIN',
        senderId: session.id,
        message: parsed.data.message,
      },
    })

    const updatedTicket = await tx.supportTicket.update({
      where: { id: ticket.id },
      data: {
        status: ticket.status === 'CLOSED' ? 'CLOSED' : 'WAITING_CUSTOMER',
        assignedAdminId: ticket.assignedAdminId ?? session.id,
      },
    })

    return { message, ticket: updatedTicket }
  })

  await recordAdminAudit({
    session,
    action: 'SUPPORT_TICKET_REPLY',
    entityType: 'SupportTicket',
    entityId: ticket.id,
    beforeData: ticket,
    afterData: { messageId: result.message.id, ticket: result.ticket },
  })

  revalidatePath('/admin/support')
}
