'use client'

import { useState } from 'react'
import { StatusBadge } from '@/components/admin/status-badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Plus, Search, Edit2, Eye, Monitor, Apple } from 'lucide-react'

const products = [
  {
    id: 'PRD-001',
    name: 'AI Writer Pro',
    slug: 'ai-writer-pro',
    category: '글쓰기',
    tags: ['콘텐츠', 'SEO'],
    os: ['Windows', 'macOS'],
    price: '₩89,000',
    status: 'published' as const,
    sales: 342,
    rating: 4.8,
  },
  {
    id: 'PRD-002',
    name: 'Sales Copilot',
    slug: 'sales-copilot',
    category: '영업',
    tags: ['CRM', 'B2B'],
    os: ['Windows'],
    price: '₩129,000',
    status: 'published' as const,
    sales: 218,
    rating: 4.6,
  },
  {
    id: 'PRD-003',
    name: 'Data Analyst',
    slug: 'data-analyst',
    category: '데이터',
    tags: ['분석', 'Excel'],
    os: ['Windows', 'macOS'],
    price: '₩99,000',
    status: 'published' as const,
    sales: 189,
    rating: 4.7,
  },
  {
    id: 'PRD-004',
    name: 'Code Helper',
    slug: 'code-helper',
    category: '개발',
    tags: ['코딩', 'Debug'],
    os: ['Windows', 'macOS'],
    price: '₩79,000',
    status: 'published' as const,
    sales: 156,
    rating: 4.5,
  },
  {
    id: 'PRD-005',
    name: 'CS Bot Enterprise',
    slug: 'cs-bot-enterprise',
    category: '고객지원',
    tags: ['채팅', 'FAQ'],
    os: ['Windows'],
    price: '₩199,000',
    status: 'draft' as const,
    sales: 0,
    rating: 0,
  },
]

export default function ProductsPage() {
  const [search, setSearch] = useState('')
  const [selectedProduct, setSelectedProduct] = useState<typeof products[0] | null>(null)
  const [showModal, setShowModal] = useState(false)

  const filtered = products.filter(
    (p) => p.name.includes(search) || p.slug.includes(search) || p.category.includes(search)
  )

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">상품관리</h1>
          <p className="text-sm text-muted-foreground mt-0.5">AI Agent 상품 {products.length}개</p>
        </div>
        <Button size="sm" className="gap-1.5" onClick={() => { setSelectedProduct(null); setShowModal(true) }}>
          <Plus className="w-3.5 h-3.5" />
          상품 추가
        </Button>
      </div>

      <div className="relative max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
        <Input placeholder="상품명, 슬러그 검색..." className="pl-9 h-8 text-sm" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {/* Product Table */}
      <div className="bg-card rounded-lg border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">상품</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">카테고리</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">태그</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">지원 OS</th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground">가격</th>
                <th className="text-center px-4 py-3 font-medium text-muted-foreground">판매수</th>
                <th className="text-center px-4 py-3 font-medium text-muted-foreground">평점</th>
                <th className="text-center px-4 py-3 font-medium text-muted-foreground">공개</th>
                <th className="text-center px-4 py-3 font-medium text-muted-foreground">관리</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((product) => (
                <tr key={product.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-medium text-foreground">{product.name}</p>
                    <p className="text-muted-foreground font-mono mt-0.5">{product.slug}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full text-[11px] font-medium">{product.category}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {product.tags.map((tag) => (
                        <span key={tag} className="bg-muted text-muted-foreground px-1.5 py-0.5 rounded text-[10px]">{tag}</span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      {product.os.includes('Windows') && <Monitor className="w-3.5 h-3.5 text-blue-500" title="Windows" />}
                      {product.os.includes('macOS') && <Apple className="w-3.5 h-3.5 text-gray-500" title="macOS" />}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right font-medium">{product.price}</td>
                  <td className="px-4 py-3 text-center font-medium">{product.sales.toLocaleString()}</td>
                  <td className="px-4 py-3 text-center">{product.rating > 0 ? `★ ${product.rating}` : '—'}</td>
                  <td className="px-4 py-3 text-center">
                    <StatusBadge status={product.status} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => { setSelectedProduct(product); setShowModal(true) }}
                        className="p-1.5 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button className="p-1.5 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Product Modal */}
      {showModal && (
        <ProductModal
          product={selectedProduct}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  )
}

function ProductModal({ product, onClose }: { product: typeof products[0] | null; onClose: () => void }) {
  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-card rounded-xl border border-border w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border sticky top-0 bg-card">
            <h2 className="text-sm font-bold">{product ? '상품 수정' : '상품 추가'}</h2>
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground">✕</button>
          </div>

          <Tabs defaultValue="basic" className="p-5">
            <TabsList className="mb-4">
              <TabsTrigger value="basic" className="text-xs">기본정보</TabsTrigger>
              <TabsTrigger value="price" className="text-xs">가격</TabsTrigger>
              <TabsTrigger value="skills" className="text-xs">Skill</TabsTrigger>
              <TabsTrigger value="reviews" className="text-xs">리뷰/Q&A</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: '상품명', placeholder: 'AI Writer Pro' },
                  { label: 'Slug', placeholder: 'ai-writer-pro' },
                ].map(({ label, placeholder }) => (
                  <div key={label}>
                    <label className="text-xs font-medium text-foreground block mb-1.5">{label}</label>
                    <Input className="h-8 text-sm" placeholder={placeholder} defaultValue={product ? (label === '상품명' ? product.name : product.slug) : ''} />
                  </div>
                ))}
              </div>
              <div>
                <label className="text-xs font-medium text-foreground block mb-1.5">설명</label>
                <textarea className="w-full h-20 bg-background border border-border rounded-md p-2.5 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-primary" placeholder="상품 설명을 입력하세요..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-foreground block mb-1.5">카테고리</label>
                  <Input className="h-8 text-sm" placeholder="글쓰기" defaultValue={product?.category} />
                </div>
                <div>
                  <label className="text-xs font-medium text-foreground block mb-1.5">숙련도</label>
                  <select className="w-full h-8 bg-background border border-border rounded-md px-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary">
                    <option>초급</option>
                    <option>중급</option>
                    <option>고급</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-foreground block mb-1.5">지원 OS</label>
                <div className="flex gap-3">
                  {['Windows', 'macOS'].map((os) => (
                    <label key={os} className="flex items-center gap-2 text-sm cursor-pointer">
                      <input type="checkbox" className="rounded" defaultChecked={product?.os.includes(os)} />
                      {os}
                    </label>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="price" className="space-y-4">
              <div>
                <label className="text-xs font-medium text-foreground block mb-1.5">가격 (원)</label>
                <Input className="h-8 text-sm" placeholder="89000" defaultValue={product?.price.replace(/[₩,]/g, '')} />
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="free-trial" className="rounded" />
                <label htmlFor="free-trial" className="text-sm">무료 체험 허용</label>
              </div>
            </TabsContent>

            <TabsContent value="skills" className="text-sm text-muted-foreground p-4 bg-muted/30 rounded-lg">
              이 상품에 연결된 Skill/컴포넌트를 관리합니다.
            </TabsContent>

            <TabsContent value="reviews" className="text-sm text-muted-foreground p-4 bg-muted/30 rounded-lg">
              리뷰 및 Q&A 관리 기능입니다.
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-2 px-5 pb-5">
            <Button variant="outline" size="sm" onClick={onClose}>취소</Button>
            <Button size="sm">저장</Button>
          </div>
        </div>
      </div>
    </>
  )
}
