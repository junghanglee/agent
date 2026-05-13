"use client"

import { useState } from "react"
import Link from "next/link"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import {
  MessageCircle,
  HelpCircle,
  Wrench,
  ThumbsUp,
  Eye,
  Clock,
  Search,
  PenLine,
  Pin,
  Flame,
  TrendingUp,
  Tag,
  Users,
  ChevronRight,
  BadgeCheck,
  Star,
  ArrowUp,
  MessageSquare,
  Bookmark,
  Share2,
  MoreHorizontal,
} from "lucide-react"

// ─── types ───────────────────────────────────────────────────────────────────
type Category = "전체" | "Q&A" | "설치 도움" | "튜닝 공유" | "후기" | "공지"

interface Post {
  id: number
  category: Category | "공지"
  title: string
  excerpt: string
  author: string
  authorBadge?: "운영자" | "전문가" | null
  avatar: string
  date: string
  views: number
  likes: number
  comments: number
  tags: string[]
  pinned?: boolean
  hot?: boolean
}

// ─── data ─────────────────────────────────────────────────────────────────────
const categories: Category[] = ["전체", "Q&A", "설치 도움", "튜닝 공유", "후기", "공지"]

const categoryMeta: Record<string, { color: string; bg: string; icon: React.ElementType }> = {
  "Q&A":      { color: "text-blue-600",   bg: "bg-blue-50",   icon: HelpCircle },
  "설치 도움":  { color: "text-emerald-600", bg: "bg-emerald-50", icon: Wrench },
  "튜닝 공유": { color: "text-brand-violet",  bg: "bg-purple-50",  icon: TrendingUp },
  "후기":      { color: "text-amber-600",  bg: "bg-amber-50",  icon: Star },
  "공지":      { color: "text-red-600",    bg: "bg-red-50",    icon: Pin },
}

const posts: Post[] = [
  {
    id: 1,
    category: "공지",
    title: "[공지] AI Linker v2.0 출시 및 Skill 마켓 오픈 안내",
    excerpt: "안녕하세요, AI Linker 운영팀입니다. 2025년 6월 드디어 Skill 마켓이 오픈되었습니다. 기존 Agent에 원하는 Skill을 붙여 나만의 AI를 커스터마이징해 보세요.",
    author: "AI Linker 운영팀",
    authorBadge: "운영자",
    avatar: "AL",
    date: "2025.06.01",
    views: 12_480,
    likes: 342,
    comments: 58,
    tags: ["공지", "업데이트", "Skill마켓"],
    pinned: true,
  },
  {
    id: 2,
    category: "Q&A",
    title: "Hermes AI를 Windows 11에 설치했는데 실행이 안 돼요",
    excerpt: "설치코드를 복사해서 터미널에 붙여넣었는데 'python command not found' 오류가 납니다. Python이 설치되어 있는데도 왜 이럴까요?",
    author: "김민준",
    authorBadge: null,
    avatar: "김",
    date: "2025.06.12",
    views: 2_341,
    likes: 18,
    comments: 24,
    tags: ["Hermes AI", "Windows", "설치오류"],
    hot: true,
  },
  {
    id: 3,
    category: "설치 도움",
    title: "macOS M3에서 OpenClaw 완벽 설치하는 방법 (스크린샷 포함)",
    excerpt: "Apple Silicon Mac 사용자분들을 위한 OpenClaw 설치 완전 가이드입니다. Rosetta 없이 네이티브로 실행하는 방법을 단계별로 정리했어요.",
    author: "박지수",
    authorBadge: "전문가",
    avatar: "박",
    date: "2025.06.10",
    views: 5_102,
    likes: 231,
    comments: 47,
    tags: ["OpenClaw", "macOS", "M3", "설치가이드"],
    hot: true,
  },
  {
    id: 4,
    category: "튜닝 공유",
    title: "Hermes AI에 웹검색 Skill + 문서 자동화 Skill 조합하면 생산성 5배",
    excerpt: "두 개의 Skill을 조합했더니 회의록 정리부터 주간 리포트 자동 생성까지 가능해졌습니다. 프롬프트 세팅과 Skill 연동 방법을 공유합니다.",
    author: "이현서",
    authorBadge: "전문가",
    avatar: "이",
    date: "2025.06.09",
    views: 8_740,
    likes: 412,
    comments: 93,
    tags: ["Hermes AI", "웹검색Skill", "문서자동화", "생산성"],
    hot: true,
  },
  {
    id: 5,
    category: "후기",
    title: "CS Helper 도입 후 고객 응답 시간 70% 단축 후기",
    excerpt: "쇼핑몰 운영하면서 CS 업무가 너무 힘들었는데, CS Helper를 도입한 지 3주 만에 응답 시간이 70% 줄었습니다. 실제 데이터와 함께 솔직한 후기를 공유해요.",
    author: "최영태",
    authorBadge: null,
    avatar: "최",
    date: "2025.06.08",
    views: 6_320,
    likes: 298,
    comments: 64,
    tags: ["CS Helper", "쇼핑몰", "도입후기"],
  },
  {
    id: 6,
    category: "Q&A",
    title: "토큰 충전 후 Agent 사용 시 소진이 너무 빠른 것 같아요",
    excerpt: "크레딧 50,000원어치 충전했는데 3일 만에 절반이 소진됐습니다. 정상적인 사용량인지 모르겠고, 토큰 절약 방법이 있다면 알려주세요.",
    author: "한지원",
    authorBadge: null,
    avatar: "한",
    date: "2025.06.07",
    views: 1_895,
    likes: 22,
    comments: 31,
    tags: ["토큰", "비용절약", "Q&A"],
  },
  {
    id: 7,
    category: "설치 도움",
    title: "Ubuntu 22.04 서버에 Business Messenger 설치 완전 정복",
    excerpt: "클라우드 서버(Ubuntu 22.04)에 Business Messenger를 도커 없이 직접 설치하는 방법입니다. 방화벽 설정과 SSL 인증서 적용까지 포함했습니다.",
    author: "정동현",
    authorBadge: "전문가",
    avatar: "정",
    date: "2025.06.06",
    views: 3_211,
    likes: 145,
    comments: 39,
    tags: ["Business Messenger", "Ubuntu", "서버설치"],
  },
  {
    id: 8,
    category: "튜닝 공유",
    title: "Research Agent 시스템 프롬프트 최적화로 답변 품질 2배 올리기",
    excerpt: "기본 프롬프트 대신 역할 정의 + 제약 조건 + 출력 포맷을 명확히 지정했더니 답변 품질이 확연히 달라졌습니다. 템플릿 공유합니다.",
    author: "송예린",
    authorBadge: null,
    avatar: "송",
    date: "2025.06.05",
    views: 4_567,
    likes: 189,
    comments: 52,
    tags: ["Research Agent", "프롬프트", "최적화"],
  },
  {
    id: 9,
    category: "후기",
    title: "비개발자인데 Hermes AI 설치 성공했습니다! 후기 공유해요",
    excerpt: "코딩을 전혀 모르는 주부인데 커뮤니티 도움으로 설치에 성공했어요. 설치 과정에서 막혔던 부분과 해결 방법을 기록해두었습니다.",
    author: "윤미나",
    authorBadge: null,
    avatar: "윤",
    date: "2025.06.04",
    views: 9_830,
    likes: 534,
    comments: 121,
    tags: ["Hermes AI", "비개발자", "설치성공"],
    hot: true,
  },
  {
    id: 10,
    category: "Q&A",
    title: "여러 Agent를 동시에 실행해도 되나요? 충돌 우려가 있어서요",
    excerpt: "Hermes AI와 Research Agent를 같은 PC에서 동시에 사용하고 싶은데 포트 충돌이나 리소스 문제가 생길 수 있는지 궁금합니다.",
    author: "강성민",
    authorBadge: null,
    avatar: "강",
    date: "2025.06.03",
    views: 1_220,
    likes: 14,
    comments: 18,
    tags: ["멀티Agent", "포트설정", "Q&A"],
  },
]

const hotTags = [
  "Hermes AI", "설치가이드", "토큰절약", "프롬프트", "macOS",
  "Windows", "생산성", "CS Helper", "후기", "OpenClaw",
]

const topContributors = [
  { name: "박지수", badge: "전문가", avatar: "박", posts: 84, likes: 1_230 },
  { name: "이현서", badge: "전문가", avatar: "이", posts: 62, likes: 980 },
  { name: "정동현", badge: "전문가", avatar: "정", posts: 57, likes: 745 },
  { name: "김민준", badge: null,     avatar: "김", posts: 45, likes: 602 },
  { name: "송예린", badge: null,     avatar: "송", posts: 38, likes: 489 },
]

const stats = [
  { label: "전체 회원",  value: "32,410", icon: Users },
  { label: "총 게시글", value: "8,924",  icon: MessageCircle },
  { label: "오늘 답변", value: "147",    icon: MessageSquare },
  { label: "해결 완료", value: "98%",    icon: BadgeCheck },
]

// ─── page component ───────────────────────────────────────────────────────────
export default function CommunityPage() {
  const [activeCategory, setActiveCategory] = useState<Category>("전체")
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState<"latest" | "popular" | "comments">("latest")

  const pinnedPosts = posts.filter((p) => p.pinned)
  const normalPosts = posts.filter((p) => !p.pinned)

  const filtered = normalPosts.filter((p) => {
    const matchCat = activeCategory === "전체" || p.category === activeCategory
    const matchSearch =
      !searchQuery ||
      p.title.includes(searchQuery) ||
      p.tags.some((t) => t.includes(searchQuery))
    return matchCat && matchSearch
  })

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === "popular") return b.likes - a.likes
    if (sortBy === "comments") return b.comments - a.comments
    return b.id - a.id
  })

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* ── Page hero ── */}
      <div className="border-b border-border bg-brand-navy pt-20">
        <div className="mx-auto max-w-7xl px-4 py-10 md:px-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium text-white/80">
                <Users className="h-3 w-3" />
                32,000+ 멤버가 함께하는 커뮤니티
              </div>
              <h1 className="text-3xl font-bold text-white md:text-4xl">
                커뮤니티
              </h1>
              <p className="mt-2 text-white/60">
                질문하고, 해결하고, 노하우를 나눠요. 혼자 고민하지 마세요.
              </p>
            </div>
            <Button className="w-fit gap-2 bg-brand-cyan font-bold text-brand-navy hover:bg-brand-cyan/90">
              <PenLine className="h-4 w-4" />
              글쓰기
            </Button>
          </div>

          {/* Stats bar */}
          <div className="mt-8 grid grid-cols-2 gap-3 pb-8 md:grid-cols-4">
            {stats.map((s) => (
              <div
                key={s.label}
                className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-cyan/20">
                  <s.icon className="h-4 w-4 text-brand-cyan" />
                </div>
                <div>
                  <p className="text-lg font-bold text-white">{s.value}</p>
                  <p className="text-xs text-white/50">{s.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Main content ── */}
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start">

          {/* ──── Left: post list ──── */}
          <div className="flex-1 min-w-0">

            {/* Search + filter bar */}
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              {/* Search */}
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="제목, 태그 검색..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-xl border border-border bg-card py-2.5 pl-9 pr-4 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-brand-cyan/60 focus:ring-2 focus:ring-brand-cyan/20"
                />
              </div>

              {/* Sort */}
              <div className="flex items-center gap-1.5 rounded-xl border border-border bg-card p-1">
                {(["latest", "popular", "comments"] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => setSortBy(s)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                      sortBy === s
                        ? "bg-brand-navy text-white shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {s === "latest" ? "최신순" : s === "popular" ? "인기순" : "댓글순"}
                  </button>
                ))}
              </div>
            </div>

            {/* Category tabs */}
            <div className="mb-5 flex gap-2 overflow-x-auto pb-1">
              {categories.map((cat) => {
                const meta = cat !== "전체" ? categoryMeta[cat] : null
                const Icon = meta?.icon
                return (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-all ${
                      activeCategory === cat
                        ? "bg-brand-navy text-white shadow-sm"
                        : "border border-border bg-card text-muted-foreground hover:border-brand-navy/30 hover:text-foreground"
                    }`}
                  >
                    {Icon && <Icon className="h-3.5 w-3.5" />}
                    {cat}
                  </button>
                )
              })}
            </div>

            {/* Pinned posts */}
            {(activeCategory === "전체" || activeCategory === "공지") &&
              pinnedPosts.map((post) => (
                <PinnedPostCard key={post.id} post={post} />
              ))}

            {/* Post list */}
            <div className="flex flex-col gap-3">
              {sorted.length === 0 ? (
                <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border p-16 text-center">
                  <MessageCircle className="h-10 w-10 text-muted-foreground/40" />
                  <p className="text-muted-foreground">게시글이 없습니다.</p>
                </div>
              ) : (
                sorted.map((post) => <PostCard key={post.id} post={post} />)
              )}
            </div>

            {/* Pagination */}
            <div className="mt-8 flex items-center justify-center gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  className={`flex h-8 w-8 items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                    n === 1
                      ? "bg-brand-navy text-white"
                      : "border border-border bg-card text-muted-foreground hover:border-brand-navy/30 hover:text-foreground"
                  }`}
                >
                  {n}
                </button>
              ))}
              <button className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground hover:text-foreground">
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* ──── Right: sidebar ──── */}
          <aside className="flex w-full flex-col gap-5 lg:w-72 lg:shrink-0">

            {/* Write CTA */}
            <div className="rounded-2xl bg-brand-navy p-5 text-white">
              <h3 className="font-bold">질문이나 노하우가 있으신가요?</h3>
              <p className="mt-1 text-sm text-white/60">
                커뮤니티에 공유하고 AI Linker 전문가가 되어보세요.
              </p>
              <Button className="mt-4 w-full gap-2 bg-brand-cyan font-bold text-brand-navy hover:bg-brand-cyan/90">
                <PenLine className="h-4 w-4" />
                글쓰기
              </Button>
            </div>

            {/* Top contributors */}
            <div className="rounded-2xl border border-border bg-card p-5">
              <div className="mb-4 flex items-center gap-2">
                <Flame className="h-4 w-4 text-amber-500" />
                <h3 className="text-sm font-semibold text-foreground">이달의 기여자</h3>
              </div>
              <div className="flex flex-col gap-3">
                {topContributors.map((c, i) => (
                  <div key={c.name} className="flex items-center gap-3">
                    <span className={`w-4 text-center text-xs font-bold ${
                      i === 0 ? "text-amber-500" : i === 1 ? "text-zinc-400" : i === 2 ? "text-amber-700" : "text-muted-foreground"
                    }`}>
                      {i + 1}
                    </span>
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-navy text-xs font-bold text-white">
                      {c.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1">
                        <span className="truncate text-sm font-medium text-foreground">{c.name}</span>
                        {c.badge && (
                          <BadgeCheck className="h-3.5 w-3.5 shrink-0 text-brand-cyan" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">게시글 {c.posts} · 좋아요 {c.likes.toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Hot tags */}
            <div className="rounded-2xl border border-border bg-card p-5">
              <div className="mb-4 flex items-center gap-2">
                <Tag className="h-4 w-4 text-brand-violet" />
                <h3 className="text-sm font-semibold text-foreground">인기 태그</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {hotTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setSearchQuery(tag)}
                    className="rounded-full border border-border bg-muted px-3 py-1 text-xs text-muted-foreground transition-colors hover:border-brand-cyan/40 hover:bg-brand-cyan-soft hover:text-brand-navy"
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Support channels */}
            <div className="rounded-2xl border border-border bg-card p-5">
              <h3 className="mb-4 text-sm font-semibold text-foreground">빠른 지원 채널</h3>
              <div className="flex flex-col gap-2">
                <Link
                  href="/support"
                  className="flex items-center justify-between rounded-xl border border-border px-3 py-2.5 text-sm transition-colors hover:border-brand-navy/30 hover:bg-muted"
                >
                  <span className="font-medium text-foreground">1:1 채팅 지원</span>
                  <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">24/7</span>
                </Link>
                <Link
                  href="/guide"
                  className="flex items-center justify-between rounded-xl border border-border px-3 py-2.5 text-sm transition-colors hover:border-brand-navy/30 hover:bg-muted"
                >
                  <span className="font-medium text-foreground">설치 가이드</span>
                  <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                </Link>
                <Link
                  href="/agents"
                  className="flex items-center justify-between rounded-xl border border-border px-3 py-2.5 text-sm transition-colors hover:border-brand-navy/30 hover:bg-muted"
                >
                  <span className="font-medium text-foreground">Agent 마켓</span>
                  <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                </Link>
              </div>
            </div>

          </aside>
        </div>
      </div>

      <Footer />
    </div>
  )
}

// ─── sub-components ───────────────────────────────────────────────────────────

function PinnedPostCard({ post }: { post: Post }) {
  const meta = categoryMeta[post.category]
  const Icon = meta?.icon ?? Pin

  return (
    <div className="mb-3 flex gap-4 rounded-2xl border border-brand-cyan/30 bg-brand-cyan-soft px-5 py-4">
      <Pin className="mt-0.5 h-4 w-4 shrink-0 text-brand-navy/60" />
      <div className="flex-1 min-w-0">
        <div className="mb-1 flex flex-wrap items-center gap-2">
          <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${meta?.color ?? ""} ${meta?.bg ?? ""}`}>
            <Icon className="h-3 w-3" />
            {post.category}
          </span>
          {post.hot && (
            <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-600">
              <Flame className="h-3 w-3" /> HOT
            </span>
          )}
        </div>
        <Link href={`/community/${post.id}`}>
          <h3 className="truncate font-semibold text-foreground hover:text-brand-navy hover:underline">
            {post.title}
          </h3>
        </Link>
        <div className="mt-1.5 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          <span className="font-medium text-foreground">{post.author}</span>
          <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{post.views.toLocaleString()}</span>
          <span className="flex items-center gap-1"><ThumbsUp className="h-3 w-3" />{post.likes}</span>
          <span className="flex items-center gap-1"><MessageCircle className="h-3 w-3" />{post.comments}</span>
          <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{post.date}</span>
        </div>
      </div>
    </div>
  )
}

function PostCard({ post }: { post: Post }) {
  const meta = categoryMeta[post.category]
  const Icon = meta?.icon ?? MessageCircle

  return (
    <article className="group rounded-2xl border border-border bg-card p-5 transition-shadow hover:shadow-md">
      <div className="flex gap-4">
        {/* Left: vote */}
        <div className="flex shrink-0 flex-col items-center gap-1">
          <button className="flex flex-col items-center rounded-lg border border-border bg-muted p-2 transition-colors hover:border-brand-cyan/40 hover:bg-brand-cyan-soft">
            <ArrowUp className="h-4 w-4 text-muted-foreground group-hover:text-brand-navy" />
            <span className="text-xs font-bold text-muted-foreground">{post.likes}</span>
          </button>
        </div>

        {/* Right: content */}
        <div className="flex-1 min-w-0">
          {/* Category + badges */}
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${meta?.color ?? ""} ${meta?.bg ?? ""}`}>
              <Icon className="h-3 w-3" />
              {post.category}
            </span>
            {post.hot && (
              <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-600">
                <Flame className="h-3 w-3" /> HOT
              </span>
            )}
          </div>

          {/* Title */}
          <Link href={`/community/${post.id}`}>
            <h3 className="truncate text-[15px] font-semibold text-foreground hover:text-brand-navy hover:underline">
              {post.title}
            </h3>
          </Link>

          {/* Excerpt */}
          <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
            {post.excerpt}
          </p>

          {/* Tags */}
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-border bg-muted px-2.5 py-0.5 text-xs text-muted-foreground"
              >
                #{tag}
              </span>
            ))}
          </div>

          {/* Meta row */}
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              {/* Avatar */}
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-navy text-xs font-bold text-white">
                {post.avatar}
              </div>
              <span className="text-xs font-medium text-foreground">{post.author}</span>
              {post.authorBadge === "운영자" && (
                <span className="rounded-full bg-brand-navy px-2 py-0.5 text-[10px] font-semibold text-brand-cyan">
                  운영자
                </span>
              )}
              {post.authorBadge === "전문가" && (
                <BadgeCheck className="h-3.5 w-3.5 text-brand-cyan" />
              )}
            </div>

            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{post.views.toLocaleString()}</span>
              <span className="flex items-center gap-1"><MessageCircle className="h-3 w-3" />{post.comments}</span>
              <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{post.date}</span>
              {/* Action icons */}
              <div className="hidden items-center gap-2 sm:flex">
                <button className="rounded p-0.5 text-muted-foreground transition-colors hover:text-foreground" aria-label="북마크">
                  <Bookmark className="h-3.5 w-3.5" />
                </button>
                <button className="rounded p-0.5 text-muted-foreground transition-colors hover:text-foreground" aria-label="공유">
                  <Share2 className="h-3.5 w-3.5" />
                </button>
                <button className="rounded p-0.5 text-muted-foreground transition-colors hover:text-foreground" aria-label="더보기">
                  <MoreHorizontal className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </article>
  )
}
