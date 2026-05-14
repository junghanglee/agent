'use client'

import { useState } from 'react'
import { Edit2, Plus, Power, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { createAdminUserAction, updateAdminUserAction, activateAdminUserAction, suspendAdminUserAction } from '@/lib/admin-user-actions'

type AdminUserValue = {
  id: string
  email: string
  name: string
  role: string
  status: string
}

const roles = [
  { value: 'ADMIN', label: '서브관리자' },
  { value: 'SUPER_ADMIN', label: '슈퍼관리자' },
]

const statuses = [
  { value: 'ACTIVE', label: '활성' },
  { value: 'PENDING', label: '대기' },
  { value: 'SUSPENDED', label: '정지' },
]

export function AdminUserCreateButton() {
  return <AdminUserDialog mode="create" />
}

export function AdminUserEditButton({ admin }: { admin: AdminUserValue }) {
  return <AdminUserDialog mode="edit" admin={admin} />
}

export function AdminUserStatusButton({ id, status }: { id: string; status: string }) {
  const action = status === 'ACTIVE' ? suspendAdminUserAction : activateAdminUserAction
  const label = status === 'ACTIVE' ? '정지' : '활성화'

  return (
    <form action={action}>
      <input type="hidden" name="id" value={id} />
      <button className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 text-[11px] text-muted-foreground hover:text-foreground">
        <Power className="h-3 w-3" /> {label}
      </button>
    </form>
  )
}

function AdminUserDialog({ mode, admin }: { mode: 'create' | 'edit'; admin?: AdminUserValue }) {
  const [open, setOpen] = useState(false)
  const action = mode === 'create' ? createAdminUserAction : updateAdminUserAction

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {mode === 'create' ? (
          <Button size="sm" className="gap-1.5"><Plus className="h-3.5 w-3.5" />서브관리자 추가</Button>
        ) : (
          <button className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 text-[11px] text-muted-foreground hover:text-foreground">
            <Edit2 className="h-3 w-3" /> 수정
          </button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{mode === 'create' ? '서브관리자 추가' : '관리자 계정 수정'}</DialogTitle>
          <DialogDescription>슈퍼관리자만 관리자 계정을 생성하거나 권한/상태를 변경할 수 있습니다.</DialogDescription>
        </DialogHeader>
        <form action={action} className="space-y-4">
          {admin?.id && <input type="hidden" name="id" value={admin.id} />}
          <div className="grid grid-cols-2 gap-3">
            <Field name="name" label="이름" defaultValue={admin?.name} required />
            <Field name="email" label="이메일" type="email" defaultValue={admin?.email} required />
          </div>
          <Field
            name="password"
            label={mode === 'create' ? '초기 비밀번호' : '새 비밀번호(변경 시만)'}
            type="password"
            required={mode === 'create'}
            placeholder="8자 이상"
          />
          <div className="grid grid-cols-2 gap-3">
            <Select name="role" label="권한" defaultValue={admin?.role ?? 'ADMIN'} options={roles} />
            <Select name="status" label="상태" defaultValue={admin?.status ?? 'ACTIVE'} options={statuses} />
          </div>
          <div className="rounded-md bg-muted px-3 py-2 text-xs text-muted-foreground flex gap-2">
            <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            생성/수정 내용은 AuditLog에 기록되어 슈퍼관리자가 활동 내역에서 확인할 수 있습니다.
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>취소</Button>
            <Button type="submit">저장</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function Field({ label, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return <div><label className="text-xs font-medium block mb-1.5">{label}</label><Input className="h-9 text-sm" {...props} /></div>
}

function Select({ label, options, ...props }: React.SelectHTMLAttributes<HTMLSelectElement> & { label: string; options: Array<{ value: string; label: string }> }) {
  return (
    <div>
      <label className="text-xs font-medium block mb-1.5">{label}</label>
      <select className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm" {...props}>
        {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>
    </div>
  )
}
