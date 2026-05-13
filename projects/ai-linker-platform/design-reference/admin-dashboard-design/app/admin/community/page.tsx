'use client'

import { StatusBadge } from '@/components/admin/status-badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, Flag, CheckCircle, Trash2, ThumbsUp, MessageCircle } from 'lucide-react'
import { useState } from 'react'

const posts = [
  { id: 'POST-201', author: '김민준', title: 'AI Writer Pro로 블로그 수익 3배 증가 후기', category: '후기', likes: 48, comments: 12, status: 'published' as const, date: '2025-01-12', reported: false },
  { id: 'POST-200', author: '이서연', title: 'Sales Copilot 활용법 공유합니다', category: '팁', likes: 35, comments: 8, status: 'published' as const, date: '2025-01-11', reported: false },
  { id: 'POST-199', author: '익명', title: '스팸 광고 글입니다', category: '기타', likes: 0, comments: 0, status: 'pending' as const, date: '2025-01-11', reported: true },
  { id: 'POST-198', author: '박도현', title: '초보자도 따라할 수 있는 Data Analyst 가이드', category: '가이드', likes: 62, comments: 24, status: 'published' as const, date: '2025-01-10', reported: false },
  { id: 'POST-197', author: '최수아', title: 'AI Agent 비교 분석', category: '분석', likes: 91, comments: 31, status: 'published' as const, date: '2025-01-09', reported: false },
  { id: 'POST-196', author: '익명2', title: '부적절한 콘텐츠', category: '기타', likes: 1, comments: 0, status: 'pending' as const, date: '2025-01-08', reported: true },
]

export default function CommunityPage() {
  const [search, setSearch] = useState('')

  const filtered = posts.filter(
    (p) => p.title.includes(search) || p.author.includes(search) || p.category.includes(search)
  )

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">커뮤니티 관리</h1>
          <p className="text-sm text-muted-foreground mt-0.5">게시글 및 댓글 모더레이션</p>
        </div>
        <div className="flex gap-2 text-xs">
          <span className="bg-rose-50 text-rose-700 border border-rose-200 px-2.5 py-1 rounded-full font-medium">신고 {posts.filter(p => p.reported).length}건</span>
          <span className="bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-1 rounded-full font-medium">승인 대기 {posts.filter(p => p.status === 'pending').length}건</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input placeholder="제목, 작성자 검색..." className="pl-9 h-8 text-sm" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <select className="h-8 bg-background border border-border rounded-md px-3 text-xs focus:outline-none focus:ring-1 focus:ring-primary">
          <option>전체</option>
          <option>공개</option>
          <option>대기중</option>
          <option>신고됨</option>
        </select>
      </div>

      <div className="bg-card rounded-lg border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">제목</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">작성자</th>
                <th className="text-center px-4 py-3 font-medium text-muted-foreground">카테고리</th>
                <th className="text-center px-4 py-3 font-medium text-muted-foreground">좋아요</th>
                <th className="text-center px-4 py-3 font-medium text-muted-foreground">댓글</th>
                <th className="text-center px-4 py-3 font-medium text-muted-foreground">상태</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">작성일</th>
                <th className="text-center px-4 py-3 font-medium text-muted-foreground">액션</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((post) => (
                <tr key={post.id} className={`border-b border-border/50 hover:bg-muted/30 transition-colors ${post.reported ? 'bg-rose-50/40' : ''}`}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      {post.reported && <Flag className="w-3 h-3 text-rose-500 shrink-0" />}
                      <span className="font-medium truncate max-w-[220px]">{post.title}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{post.author}</td>
                  <td className="px-4 py-3 text-center">
                    <span className="bg-muted text-muted-foreground px-2 py-0.5 rounded text-[11px]">{post.category}</span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-1 text-muted-foreground">
                      <ThumbsUp className="w-3 h-3" />
                      {post.likes}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-1 text-muted-foreground">
                      <MessageCircle className="w-3 h-3" />
                      {post.comments}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center"><StatusBadge status={post.status} /></td>
                  <td className="px-4 py-3 text-muted-foreground">{post.date}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-1">
                      {post.status === 'pending' && (
                        <button className="p-1.5 rounded hover:bg-emerald-50 transition-colors text-emerald-600" title="승인">
                          <CheckCircle className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button className="p-1.5 rounded hover:bg-rose-50 transition-colors text-rose-500" title="삭제">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
