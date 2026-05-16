import { CheckCircle, Flag, MessageCircle, Search, ThumbsUp } from 'lucide-react'
import { CommunityCommentStatusButton, CommunityPostStatusButton } from '@/components/admin/moderation-actions'
import { StatusBadge } from '@/components/admin/status-badge'
import { Input } from '@/components/ui/input'
import { requireAdminPagePermission } from '@/lib/admin-auth'
import { formatDate } from '@/lib/admin-format'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

type CommunityPageProps = {
  searchParams: Promise<{ q?: string; status?: string }>
}

const statusMap = {
  DRAFT: { badge: 'draft' as const, label: '초안' },
  PUBLISHED: { badge: 'published' as const, label: '공개' },
  HIDDEN: { badge: 'inactive' as const, label: '숨김' },
  DELETED: { badge: 'suspended' as const, label: '삭제' },
}

export default async function CommunityPage({ searchParams }: CommunityPageProps) {
  await requireAdminPagePermission('COMMUNITY_MANAGE')

  const { q = '', status = '' } = await searchParams
  const query = q.trim()

  const postWhere = {
    ...(status ? { status: status as never } : {}),
    ...(query
      ? {
          OR: [
            { title: { contains: query } },
            { body: { contains: query } },
            { user: { name: { contains: query } } },
            { user: { email: { contains: query } } },
            { agentProduct: { name: { contains: query } } },
          ],
        }
      : {}),
  }

  const [posts, comments, postCounts, commentCounts] = await Promise.all([
    prisma.communityPost.findMany({
      where: postWhere,
      take: 100,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { name: true, email: true } },
        agentProduct: { select: { name: true } },
        _count: { select: { comments: true } },
      },
    }),
    prisma.communityComment.findMany({
      where: query
        ? {
            OR: [
              { body: { contains: query } },
              { user: { name: { contains: query } } },
              { user: { email: { contains: query } } },
              { post: { title: { contains: query } } },
            ],
          }
        : {},
      take: 30,
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { name: true, email: true } }, post: { select: { title: true } } },
    }),
    prisma.communityPost.groupBy({ by: ['status'], _count: true }),
    prisma.communityComment.groupBy({ by: ['status'], _count: true }),
  ])

  const postCountByStatus = Object.fromEntries(postCounts.map((item) => [item.status, item._count]))
  const commentCountByStatus = Object.fromEntries(commentCounts.map((item) => [item.status, item._count]))
  const needsReview = (postCountByStatus.DRAFT ?? 0) + (postCountByStatus.HIDDEN ?? 0) + (commentCountByStatus.HIDDEN ?? 0)

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-foreground">커뮤니티 관리</h1>
          <p className="text-sm text-muted-foreground mt-0.5">실제 게시글 및 댓글 모더레이션</p>
        </div>
        <div className="flex flex-wrap gap-2 text-xs">
          <span className="bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-1 rounded-full font-medium">공개 {postCountByStatus.PUBLISHED ?? 0}건</span>
          <span className="bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-1 rounded-full font-medium">검토 {needsReview}건</span>
          <span className="bg-gray-50 text-gray-700 border border-gray-200 px-2.5 py-1 rounded-full font-medium">댓글 {comments.length}건 표시</span>
        </div>
      </div>

      <form className="flex items-center gap-2">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input name="q" placeholder="제목, 작성자 검색..." className="pl-9 h-8 text-sm" defaultValue={query} />
        </div>
        <select name="status" defaultValue={status} className="h-8 bg-background border border-border rounded-md px-3 text-xs focus:outline-none focus:ring-1 focus:ring-primary">
          <option value="">전체 상태</option>
          <option value="PUBLISHED">공개</option>
          <option value="DRAFT">초안</option>
          <option value="HIDDEN">숨김</option>
          <option value="DELETED">삭제</option>
        </select>
        <button className="h-8 rounded-md border border-border bg-card px-3 text-xs font-medium hover:bg-muted" type="submit">검색</button>
      </form>

      <div className="bg-card rounded-lg border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">제목</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">작성자</th>
                <th className="text-center px-4 py-3 font-medium text-muted-foreground">상품</th>
                <th className="text-center px-4 py-3 font-medium text-muted-foreground">좋아요</th>
                <th className="text-center px-4 py-3 font-medium text-muted-foreground">댓글</th>
                <th className="text-center px-4 py-3 font-medium text-muted-foreground">상태</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">작성일</th>
                <th className="text-center px-4 py-3 font-medium text-muted-foreground">액션</th>
              </tr>
            </thead>
            <tbody>
              {posts.map((post) => {
                const flagged = post.status === 'HIDDEN' || post.status === 'DRAFT'
                return (
                  <tr key={post.id} className={`border-b border-border/50 hover:bg-muted/30 transition-colors ${flagged ? 'bg-amber-50/30' : ''}`}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        {flagged && <Flag className="w-3 h-3 text-amber-500 shrink-0" />}
                        <span className="font-medium truncate max-w-[260px]">{post.title}</span>
                      </div>
                      <p className="text-[11px] text-muted-foreground truncate max-w-[320px] mt-1">{post.body}</p>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      <p>{post.user.name}</p>
                      <p className="font-mono text-[10px]">{post.user.email}</p>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="bg-muted text-muted-foreground px-2 py-0.5 rounded text-[11px]">{post.agentProduct?.name ?? '일반'}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-1 text-muted-foreground"><ThumbsUp className="w-3 h-3" />0</div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-1 text-muted-foreground"><MessageCircle className="w-3 h-3" />{post._count.comments}</div>
                    </td>
                    <td className="px-4 py-3 text-center"><StatusBadge status={statusMap[post.status].badge} customLabel={statusMap[post.status].label} /></td>
                    <td className="px-4 py-3 text-muted-foreground">{formatDate(post.createdAt)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1">
                        {post.status !== 'PUBLISHED' && <CommunityPostStatusButton postId={post.id} status="PUBLISHED" label="공개" />}
                        {post.status !== 'HIDDEN' && <CommunityPostStatusButton postId={post.id} status="HIDDEN" label="숨김" />}
                        {post.status !== 'DELETED' && <CommunityPostStatusButton postId={post.id} status="DELETED" label="삭제" />}
                      </div>
                    </td>
                  </tr>
                )
              })}
              {posts.length === 0 && (
                <tr><td colSpan={8} className="px-4 py-10 text-center text-sm text-muted-foreground">조건에 맞는 게시글이 없습니다.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-card rounded-lg border border-border overflow-hidden">
        <div className="flex items-center gap-2 border-b border-border px-4 py-3">
          <CheckCircle className="w-4 h-4 text-primary" />
          <h2 className="text-sm font-semibold">최근 댓글 관리</h2>
        </div>
        <div className="divide-y divide-border/60">
          {comments.map((comment) => (
            <div key={comment.id} className="flex items-start justify-between gap-4 px-4 py-3 text-xs">
              <div className="min-w-0">
                <p className="font-medium text-foreground truncate">{comment.post.title}</p>
                <p className="text-muted-foreground mt-1">{comment.body}</p>
                <p className="text-[11px] text-muted-foreground mt-1">{comment.user.name} · {comment.user.email} · {formatDate(comment.createdAt)}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <StatusBadge status={statusMap[comment.status].badge} customLabel={statusMap[comment.status].label} />
                {comment.status !== 'PUBLISHED' && <CommunityCommentStatusButton commentId={comment.id} status="PUBLISHED" label="댓글 공개" />}
                {comment.status !== 'HIDDEN' && <CommunityCommentStatusButton commentId={comment.id} status="HIDDEN" label="댓글 숨김" />}
                {comment.status !== 'DELETED' && <CommunityCommentStatusButton commentId={comment.id} status="DELETED" label="댓글 삭제" />}
              </div>
            </div>
          ))}
          {comments.length === 0 && <div className="px-4 py-8 text-center text-sm text-muted-foreground">표시할 댓글이 없습니다.</div>}
        </div>
      </div>
    </div>
  )
}
