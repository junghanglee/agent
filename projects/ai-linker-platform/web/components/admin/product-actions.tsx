'use client'

import { useState } from 'react'
import { Plus, Edit2, Archive } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { createProductAction, updateProductAction, archiveProductAction } from '@/lib/admin-actions'

type ProductFormValue = {
  id?: string
  slug?: string
  name?: string
  shortDescription?: string
  description?: string
  category?: string
  purposeTags?: string[]
  skillLevel?: string
  supportedPlatforms?: string[]
  price?: string | number
  status?: string
  thumbnailUrl?: string | null
}

const platforms = ['WINDOWS', 'MACOS', 'IOS', 'ANDROID', 'WEB']
const statuses = ['DRAFT', 'ACTIVE', 'ARCHIVED']

export function ProductCreateButton() {
  return <ProductDialog mode="create" />
}

export function ProductEditButton({ product }: { product: ProductFormValue }) {
  return <ProductDialog mode="edit" product={product} />
}

export function ProductArchiveButton({ id }: { id: string }) {
  return (
    <form action={archiveProductAction}>
      <input type="hidden" name="id" value={id} />
      <button className="p-1.5 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-rose-600" title="상품 보관 처리">
        <Archive className="w-3.5 h-3.5" />
      </button>
    </form>
  )
}

function ProductDialog({ mode, product }: { mode: 'create' | 'edit'; product?: ProductFormValue }) {
  const [open, setOpen] = useState(false)
  const action = mode === 'create' ? createProductAction : updateProductAction
  const checkedPlatforms = product?.supportedPlatforms ?? ['WINDOWS']

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {mode === 'create' ? (
          <Button size="sm" className="gap-1.5"><Plus className="w-3.5 h-3.5" />상품 추가</Button>
        ) : (
          <button className="p-1.5 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground" title="상품 수정"><Edit2 className="w-3.5 h-3.5" /></button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{mode === 'create' ? '상품 추가' : '상품 수정'}</DialogTitle>
          <DialogDescription>AI Agent 상품 정보를 입력하면 관리자 DB에 바로 반영됩니다.</DialogDescription>
        </DialogHeader>
        <form action={action} className="space-y-4">
          {product?.id && <input type="hidden" name="id" value={product.id} />}
          <div className="grid grid-cols-2 gap-3">
            <Field name="name" label="상품명" defaultValue={product?.name} required />
            <Field name="slug" label="Slug" defaultValue={product?.slug} required />
            <Field name="category" label="카테고리" defaultValue={product?.category} required />
            <Field name="skillLevel" label="난이도" defaultValue={product?.skillLevel ?? 'Beginner'} required />
            <Field name="price" label="가격(KRW)" type="number" defaultValue={product?.price ?? 0} required />
            <div><label className="text-xs font-medium block mb-1.5">상태</label><select name="status" defaultValue={product?.status ?? 'DRAFT'} className="w-full h-9 bg-background border border-border rounded-md px-3 text-sm">{statuses.map((status) => <option key={status} value={status}>{status}</option>)}</select></div>
          </div>
          <Field name="shortDescription" label="짧은 설명" defaultValue={product?.shortDescription} required />
          <div><label className="text-xs font-medium block mb-1.5">상세 설명</label><Textarea name="description" defaultValue={product?.description} required /></div>
          <Field name="purposeTags" label="태그, 쉼표로 구분" defaultValue={product?.purposeTags?.join(', ')} />
          <Field name="thumbnailUrl" label="썸네일 URL" defaultValue={product?.thumbnailUrl ?? ''} />
          <div><label className="text-xs font-medium block mb-2">지원 플랫폼</label><div className="flex flex-wrap gap-3">{platforms.map((platform) => <label key={platform} className="flex items-center gap-2 text-sm"><input type="checkbox" name="supportedPlatforms" value={platform} defaultChecked={checkedPlatforms.includes(platform)} />{platform}</label>)}</div></div>
          <DialogFooter><Button type="button" variant="outline" onClick={() => setOpen(false)}>취소</Button><Button type="submit">저장</Button></DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function Field({ label, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return <div><label className="text-xs font-medium block mb-1.5">{label}</label><Input className="h-9 text-sm" {...props} /></div>
}
