'use client'

import { useState } from 'react'
import { StatusBadge } from '@/components/admin/status-badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, Search, Edit2, Puzzle } from 'lucide-react'

const skills = [
  { id: 'SKL-001', name: 'Web Search', category: '검색', version: 'v1.2.0', agents: 3, status: 'published' as const, updatedAt: '2025-01-10' },
  { id: 'SKL-002', name: 'PDF Reader', category: '문서', version: 'v2.0.1', agents: 5, status: 'published' as const, updatedAt: '2025-01-08' },
  { id: 'SKL-003', name: 'Code Executor', category: '개발', version: 'v1.0.0', agents: 2, status: 'published' as const, updatedAt: '2025-01-05' },
  { id: 'SKL-004', name: 'Email Sender', category: '이메일', version: 'v1.1.0', agents: 4, status: 'published' as const, updatedAt: '2025-01-03' },
  { id: 'SKL-005', name: 'Image Analyzer', category: '비전', version: 'v0.9.0', agents: 0, status: 'draft' as const, updatedAt: '2025-01-12' },
  { id: 'SKL-006', name: 'Calendar Sync', category: '일정', version: 'v1.0.0', agents: 1, status: 'published' as const, updatedAt: '2024-12-20' },
]

export default function SkillsPage() {
  const [search, setSearch] = useState('')

  const filtered = skills.filter(
    (s) => s.name.toLowerCase().includes(search.toLowerCase()) || s.category.includes(search)
  )

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Skill / 컴포넌트</h1>
          <p className="text-sm text-muted-foreground mt-0.5">AI Agent에 부착 가능한 Skill 관리</p>
        </div>
        <Button size="sm" className="gap-1.5">
          <Plus className="w-3.5 h-3.5" />
          Skill 추가
        </Button>
      </div>

      <div className="relative max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
        <Input placeholder="Skill 검색..." className="pl-9 h-8 text-sm" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((skill) => (
          <div key={skill.id} className="bg-card rounded-lg border border-border p-4 hover:shadow-sm transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Puzzle className="w-4.5 h-4.5 text-primary" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground">{skill.name}</h3>
                  <p className="text-[11px] text-muted-foreground font-mono">{skill.version}</p>
                </div>
              </div>
              <StatusBadge status={skill.status} />
            </div>
            <div className="mt-3 flex items-center justify-between text-xs">
              <div className="flex gap-3">
                <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">{skill.category}</span>
                <span className="text-muted-foreground">Agent {skill.agents}개 사용</span>
              </div>
              <button className="p-1.5 rounded hover:bg-muted transition-colors text-muted-foreground">
                <Edit2 className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="mt-2 text-[11px] text-muted-foreground">업데이트: {skill.updatedAt}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
