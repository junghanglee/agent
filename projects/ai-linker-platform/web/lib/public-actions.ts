'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'

const DEMO_CUSTOMER_EMAIL = 'customer@example.com'

const createSupportTicketSchema = z.object({
  category: z.string().trim().min(1).max(80),
  agentProductId: z.string().trim().optional(),
  subject: z.string().trim().min(2).max(160),
  message: z.string().trim().min(5).max(3000),
})

const createCommunityPostSchema = z.object({
  agentProductId: z.string().trim().optional(),
  title: z.string().trim().min(2).max(160),
  body: z.string().trim().min(5).max(5000),
})

const createCommunityCommentSchema = z.object({
  postId: z.string().trim().min(1),
  body: z.string().trim().min(2).max(1000),
})

async function getDemoCustomer() {
  return prisma.user.findUniqueOrThrow({ where: { email: DEMO_CUSTOMER_EMAIL } })
}

function optionalId(value?: string) {
  return value && value !== 'none' ? value : undefined
}

export async function createSupportTicketAction(formData: FormData) {
  const parsed = createSupportTicketSchema.safeParse({
    category: formData.get('category'),
    agentProductId: formData.get('agentProductId'),
    subject: formData.get('subject'),
    message: formData.get('message'),
  })

  if (!parsed.success) throw new Error('문의 입력값이 올바르지 않습니다.')

  const user = await getDemoCustomer()
  const ticket = await prisma.supportTicket.create({
    data: {
      userId: user.id,
      category: parsed.data.category,
      subject: parsed.data.subject,
      messages: {
        create: {
          senderType: 'USER',
          senderId: user.id,
          message: parsed.data.message,
        },
      },
    },
  })

  revalidatePath('/support')
  revalidatePath('/mypage')
  redirect(`/support?section=tickets&created=${ticket.id}`)
}

export async function createCommunityPostAction(formData: FormData) {
  const parsed = createCommunityPostSchema.safeParse({
    agentProductId: formData.get('agentProductId'),
    title: formData.get('title'),
    body: formData.get('body'),
  })

  if (!parsed.success) throw new Error('게시글 입력값이 올바르지 않습니다.')

  const user = await getDemoCustomer()
  const post = await prisma.communityPost.create({
    data: {
      userId: user.id,
      agentProductId: optionalId(parsed.data.agentProductId),
      title: parsed.data.title,
      body: parsed.data.body,
      status: 'PUBLISHED',
    },
  })

  revalidatePath('/community')
  redirect(`/community?post=${post.id}`)
}

export async function createCommunityCommentAction(formData: FormData) {
  const parsed = createCommunityCommentSchema.safeParse({
    postId: formData.get('postId'),
    body: formData.get('body'),
  })

  if (!parsed.success) throw new Error('댓글 입력값이 올바르지 않습니다.')

  const user = await getDemoCustomer()
  await prisma.communityComment.create({
    data: {
      postId: parsed.data.postId,
      userId: user.id,
      body: parsed.data.body,
      status: 'PUBLISHED',
    },
  })

  revalidatePath('/community')
  redirect(`/community?post=${parsed.data.postId}`)
}
