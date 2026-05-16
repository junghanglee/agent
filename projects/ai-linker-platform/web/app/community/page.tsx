import Link from 'next/link'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { Button } from '@/components/ui/button'
import { createCommunityCommentAction, createCommunityPostAction } from '@/lib/public-actions'
import { getCommunityPageData } from '@/lib/public-store'
import { BadgeCheck, Bot, ChevronRight, Flame, HelpCircle, MessageCircle, MessageSquare, PenLine, Pin, Search, Star, Tag, ThumbsUp, TrendingUp, Users, Wrench } from 'lucide-react'

export const dynamic = 'force-dynamic'

type CommunityPageProps = {
  searchParams: Promise<{ q?: string; product?: string; post?: string }>
}

const categoryMeta: Record<string, { color: string; bg: string; icon: React.ElementType }> = {
  'Q&A': { color: 'text-blue-600', bg: 'bg-blue-50', icon: HelpCircle },
  설치: { color: 'text-emerald-600', bg: 'bg-emerald-50', icon: Wrench },
  튜닝: { color: 'text-brand-violet', bg: 'bg-purple-50', icon: TrendingUp },
  후기: { color: 'text-amber-600', bg: 'bg-amber-50', icon: Star },
  공지: { color: 'text-red-600', bg: 'bg-red-50', icon: Pin },
}

function formatDate(value: Date | string) {
  return new Intl.DateTimeFormat('ko-KR', { dateStyle: 'medium' }).format(new Date(value))
}

function avatar(name: string) {
  return name.slice(0, 1).toUpperCase()
}

function categoryFor(post: { title: string; agentProduct?: { category: string } | null }) {
  if (post.title.includes('공지')) return '공지'
  if (post.title.includes('설치')) return '설치'
  if (post.title.includes('후기')) return '후기'
  if (post.agentProduct?.category) return post.agentProduct.category
  return 'Q&A'
}

export default async function CommunityPage({ searchParams }: CommunityPageProps) {
  const params = await searchParams
  const { posts, products, postCount, userCount, commentCount } = await getCommunityPageData()
  const query = params.q?.trim() ?? ''
  const productId = params.product ?? ''
  const selectedPostId = params.post ?? posts[0]?.id

  const filteredPosts = posts.filter((post) => {
    const matchesQuery = !query || post.title.includes(query) || post.body.includes(query) || post.user.name.includes(query) || post.agentProduct?.name.includes(query)
    const matchesProduct = !productId || post.agentProductId === productId
    return matchesQuery && matchesProduct
  })
  const selectedPost = posts.find((post) => post.id === selectedPostId) ?? filteredPosts[0]
  const topContributors = Array.from(new Map(posts.map((post) => [post.user.email, post.user])).values()).slice(0, 5)
  const hotTags = Array.from(new Set(posts.flatMap((post) => [post.agentProduct?.name, categoryFor(post), ...post.title.split(' ').filter((word) => word.length > 3).slice(0, 2)]).filter(Boolean) as string[])).slice(0, 10)

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="border-b border-border bg-brand-navy pt-20">
        <div className="mx-auto max-w-7xl px-4 py-10 md:px-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium text-white/80">
                <Users className="h-3 w-3" />{userCount.toLocaleString()}명 커뮤니티
              </div>
              <h1 className="text-3xl font-bold text-white md:text-4xl">커뮤니티</h1>
              <p className="mt-2 text-white/60">질문하고, 해결하고, 노하우를 나눠요. 이제 실제 DB 게시글과 연결됩니다.</p>
            </div>
            <a href="#write-post"><Button className="w-fit gap-2 bg-brand-cyan font-bold text-brand-navy hover:bg-brand-cyan/90"><PenLine className="h-4 w-4" />글쓰기</Button></a>
          </div>
          <div className="mt-8 grid grid-cols-2 gap-3 pb-8 md:grid-cols-4">
            {[{ label: '전체 회원', value: userCount.toLocaleString(), icon: Users }, { label: '총 게시글', value: postCount.toLocaleString(), icon: MessageCircle }, { label: '총 댓글', value: commentCount.toLocaleString(), icon: MessageSquare }, { label: '공개 글', value: posts.length.toLocaleString(), icon: BadgeCheck }].map((s) => (
              <div key={s.label} className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3"><div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-cyan/20"><s.icon className="h-4 w-4 text-brand-cyan" /></div><div><p className="text-lg font-bold text-white">{s.value}</p><p className="text-xs text-white/50">{s.label}</p></div></div>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 md:px-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
          <div className="flex-1 min-w-0 space-y-5">
            <form className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative flex-1 max-w-sm"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><input name="q" placeholder="제목, 내용, 작성자 검색..." defaultValue={query} className="w-full rounded-xl border border-border bg-card py-2.5 pl-9 pr-4 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-brand-cyan/60 focus:ring-2 focus:ring-brand-cyan/20" /></div>
              <select name="product" defaultValue={productId} className="rounded-xl border border-border bg-card px-3 py-2.5 text-sm text-foreground"><option value="">전체 Agent</option>{products.map((product) => <option key={product.id} value={product.id}>{product.name}</option>)}</select>
              <Button type="submit" variant="outline">검색</Button>
            </form>

            <div className="flex flex-col gap-3">
              {filteredPosts.map((post) => {
                const category = categoryFor(post)
                const meta = categoryMeta[category] ?? categoryMeta['Q&A']
                const Icon = meta.icon
                return (
                  <Link key={post.id} href={`/community?post=${post.id}${query ? `&q=${encodeURIComponent(query)}` : ''}${productId ? `&product=${productId}` : ''}`} className={`block rounded-2xl border bg-card p-5 transition-all hover:border-brand-navy/30 hover:shadow-sm ${selectedPost?.id === post.id ? 'border-brand-cyan ring-1 ring-brand-cyan/40' : 'border-border'}`}>
                    <div className="flex gap-4"><div className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-navy text-sm font-bold text-white sm:flex">{avatar(post.user.name)}</div><div className="min-w-0 flex-1"><div className="mb-2 flex flex-wrap items-center gap-2"><span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${meta.color} ${meta.bg}`}><Icon className="h-3 w-3" />{category}</span>{post.agentProduct && <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground">{post.agentProduct.name}</span>}</div><h3 className="font-bold text-foreground transition-colors hover:text-brand-navy">{post.title}</h3><p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{post.body}</p><div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted-foreground"><span>{post.user.name}</span><span>{formatDate(post.createdAt)}</span><span className="inline-flex items-center gap-1"><MessageCircle className="h-3.5 w-3.5" />{post.comments.length}</span><span className="inline-flex items-center gap-1"><ThumbsUp className="h-3.5 w-3.5" />0</span></div></div></div>
                  </Link>
                )
              })}
              {filteredPosts.length === 0 && <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border p-16 text-center"><MessageCircle className="h-10 w-10 text-muted-foreground/40" /><p className="text-muted-foreground">게시글이 없습니다.</p></div>}
            </div>

            <div id="write-post" className="rounded-2xl border border-border bg-card p-5">
              <h2 className="mb-4 text-lg font-bold text-foreground">새 글 작성</h2>
              <form action={createCommunityPostAction} className="space-y-3">
                <select name="agentProductId" className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm"><option value="none">일반 커뮤니티</option>{products.map((product) => <option key={product.id} value={product.id}>{product.name}</option>)}</select>
                <input name="title" required minLength={2} maxLength={160} placeholder="제목" className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm" />
                <textarea name="body" required minLength={5} rows={5} placeholder="질문이나 노하우를 적어 주세요." className="w-full resize-none rounded-xl border border-border bg-background px-3 py-2.5 text-sm" />
                <Button type="submit" className="gap-2 bg-brand-navy text-white hover:bg-brand-navy/90"><PenLine className="h-4 w-4" />게시글 등록</Button>
              </form>
            </div>
          </div>

          <aside className="flex w-full flex-col gap-5 lg:w-80 lg:shrink-0">
            {selectedPost && <div className="rounded-2xl border border-border bg-card p-5"><h3 className="mb-2 text-sm font-bold text-foreground">선택한 글</h3><p className="font-semibold text-foreground">{selectedPost.title}</p><p className="mt-2 text-sm text-muted-foreground whitespace-pre-line">{selectedPost.body}</p><div className="mt-4 space-y-3 border-t border-border pt-4"><p className="text-sm font-semibold text-foreground">댓글 {selectedPost.comments.length}개</p>{selectedPost.comments.map((comment) => <div key={comment.id} className="rounded-xl bg-muted p-3"><p className="text-xs font-semibold text-foreground">{comment.user.name}</p><p className="mt-1 text-xs text-muted-foreground">{comment.body}</p></div>)}<form action={createCommunityCommentAction} className="space-y-2"><input type="hidden" name="postId" value={selectedPost.id} /><textarea name="body" required rows={3} placeholder="댓글을 입력하세요" className="w-full resize-none rounded-xl border border-border bg-background px-3 py-2 text-xs" /><Button type="submit" size="sm" className="w-full bg-brand-navy text-white hover:bg-brand-navy/90">댓글 등록</Button></form></div></div>}
            <div className="rounded-2xl bg-brand-navy p-5 text-white"><h3 className="font-bold">질문이나 노하우가 있으신가요?</h3><p className="mt-1 text-sm text-white/60">커뮤니티에 공유하고 AI Linker 전문가가 되어보세요.</p><a href="#write-post"><Button className="mt-4 w-full gap-2 bg-brand-cyan font-bold text-brand-navy hover:bg-brand-cyan/90"><PenLine className="h-4 w-4" />글쓰기</Button></a></div>
            <div className="rounded-2xl border border-border bg-card p-5"><div className="mb-4 flex items-center gap-2"><Flame className="h-4 w-4 text-amber-500" /><h3 className="text-sm font-semibold text-foreground">최근 기여자</h3></div><div className="flex flex-col gap-3">{topContributors.map((user, i) => <div key={user.email} className="flex items-center gap-3"><span className="w-4 text-center text-xs font-bold text-muted-foreground">{i + 1}</span><div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-navy text-xs font-bold text-white">{avatar(user.name)}</div><div className="min-w-0"><span className="truncate text-sm font-medium text-foreground">{user.name}</span><p className="text-xs text-muted-foreground">{user.role === 'ADMIN' ? '운영자' : '멤버'}</p></div></div>)}</div></div>
            <div className="rounded-2xl border border-border bg-card p-5"><div className="mb-4 flex items-center gap-2"><Tag className="h-4 w-4 text-brand-violet" /><h3 className="text-sm font-semibold text-foreground">인기 태그</h3></div><div className="flex flex-wrap gap-2">{hotTags.map((tag) => <Link key={tag} href={`/community?q=${encodeURIComponent(tag)}`} className="rounded-full border border-border bg-muted px-3 py-1 text-xs text-muted-foreground hover:border-brand-cyan/40 hover:bg-brand-cyan-soft hover:text-brand-navy">#{tag}</Link>)}</div></div>
            <div className="rounded-2xl border border-brand-cyan/30 bg-brand-cyan-soft p-5"><Bot className="mb-2 h-5 w-5 text-brand-navy" /><p className="font-bold text-brand-navy text-sm">Agent 지원</p><p className="mt-2 text-xs text-brand-navy/70">설치 문제가 있으면 지원센터로 문의해 주세요.</p><Link href="/support" className="mt-3 flex items-center justify-between rounded-xl border border-brand-navy/20 px-3 py-2 text-sm font-medium text-brand-navy">지원센터 <ChevronRight className="h-3.5 w-3.5" /></Link></div>
          </aside>
        </div>
      </div>

      <Footer />
    </div>
  )
}
