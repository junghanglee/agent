'use server'

import { revalidatePath } from 'next/cache'
import { recordAdminAudit } from '@/lib/admin-audit'
import { requireAdminPagePermission } from '@/lib/admin-auth'
import { updateCommunityCommentStatusSchema, updateCommunityPostStatusSchema } from '@/lib/admin-validation'
import { prisma } from '@/lib/prisma'

export async function updateCommunityPostStatusAction(formData: FormData) {
  const session = await requireAdminPagePermission('COMMUNITY_MANAGE')
  const parsed = updateCommunityPostStatusSchema.safeParse({
    postId: formData.get('postId'),
    status: formData.get('status'),
  })

  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? '게시글 상태 입력값이 올바르지 않습니다.')

  const before = await prisma.communityPost.findUnique({ where: { id: parsed.data.postId } })
  if (!before) throw new Error('게시글을 찾을 수 없습니다.')

  const post = await prisma.communityPost.update({
    where: { id: before.id },
    data: { status: parsed.data.status },
  })

  await recordAdminAudit({
    session,
    action: 'COMMUNITY_POST_STATUS_UPDATE',
    entityType: 'CommunityPost',
    entityId: post.id,
    beforeData: before,
    afterData: post,
  })

  revalidatePath('/admin/community')
}

export async function updateCommunityCommentStatusAction(formData: FormData) {
  const session = await requireAdminPagePermission('COMMUNITY_MANAGE')
  const parsed = updateCommunityCommentStatusSchema.safeParse({
    commentId: formData.get('commentId'),
    status: formData.get('status'),
  })

  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? '댓글 상태 입력값이 올바르지 않습니다.')

  const before = await prisma.communityComment.findUnique({ where: { id: parsed.data.commentId } })
  if (!before) throw new Error('댓글을 찾을 수 없습니다.')

  const comment = await prisma.communityComment.update({
    where: { id: before.id },
    data: { status: parsed.data.status },
  })

  await recordAdminAudit({
    session,
    action: 'COMMUNITY_COMMENT_STATUS_UPDATE',
    entityType: 'CommunityComment',
    entityId: comment.id,
    beforeData: before,
    afterData: comment,
  })

  revalidatePath('/admin/community')
}
