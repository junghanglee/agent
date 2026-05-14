'use client'

import { Edit2, Plus, Power, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import {
  createLLMAccountAction,
  createLLMProviderAction,
  disableLLMAccountAction,
  disableLLMProviderAction,
  updateLLMAccountAction,
  updateLLMProviderAction,
} from '@/lib/llm-pool-actions'

type ProviderOption = { id: string; name: string; type: string; status: string }
type ProviderValue = ProviderOption
type AccountValue = {
  id: string
  providerId: string
  name: string
  monthlyLimitUsd: string | number | { toString(): string }
  usedThisMonthUsd: string | number | { toString(): string }
  status: string
  priority: number
}

const statuses = [
  { value: 'ACTIVE', label: '활성' },
  { value: 'WARNING', label: '경고' },
  { value: 'CRITICAL', label: '위험' },
  { value: 'DISABLED', label: '비활성' },
]

export function LLMProviderCreateButton() {
  return <ProviderDialog mode="create" />
}

export function LLMProviderEditButton({ provider }: { provider: ProviderValue }) {
  return <ProviderDialog mode="edit" provider={provider} />
}

export function LLMProviderDisableButton({ id }: { id: string }) {
  return <form action={disableLLMProviderAction}><input type="hidden" name="id" value={id} /><TinyButton label="비활성" icon={<Power className="h-3 w-3" />} /></form>
}

export function LLMAccountCreateButton({ providers }: { providers: ProviderOption[] }) {
  return <AccountDialog mode="create" providers={providers} />
}

export function LLMAccountEditButton({ account, providers }: { account: AccountValue; providers: ProviderOption[] }) {
  return <AccountDialog mode="edit" account={account} providers={providers} />
}

export function LLMAccountDisableButton({ id }: { id: string }) {
  return <form action={disableLLMAccountAction}><input type="hidden" name="id" value={id} /><TinyButton label="비활성" icon={<Power className="h-3 w-3" />} /></form>
}

function ProviderDialog({ mode, provider }: { mode: 'create' | 'edit'; provider?: ProviderValue }) {
  const action = mode === 'create' ? createLLMProviderAction : updateLLMProviderAction
  return (
    <Dialog>
      <DialogTrigger asChild>
        {mode === 'create' ? <Button size="sm" variant="outline" className="gap-1.5"><Plus className="h-3.5 w-3.5" />Provider 추가</Button> : <TinyButton label="수정" icon={<Edit2 className="h-3 w-3" />} />}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{mode === 'create' ? 'LLM Provider 추가' : 'LLM Provider 수정'}</DialogTitle>
          <DialogDescription>Provider 이름, 유형, 운영 상태를 관리합니다.</DialogDescription>
        </DialogHeader>
        <form action={action} className="space-y-4">
          {provider?.id && <input type="hidden" name="id" value={provider.id} />}
          <Field name="name" label="Provider 이름" defaultValue={provider?.name} placeholder="OpenAI" required />
          <Field name="type" label="Provider 유형" defaultValue={provider?.type} placeholder="openai-compatible" required />
          <Select name="status" label="상태" defaultValue={provider?.status ?? 'ACTIVE'} options={statuses} />
          <DialogFooter><Button type="submit">저장</Button></DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function AccountDialog({ mode, account, providers }: { mode: 'create' | 'edit'; account?: AccountValue; providers: ProviderOption[] }) {
  const action = mode === 'create' ? createLLMAccountAction : updateLLMAccountAction
  return (
    <Dialog>
      <DialogTrigger asChild>
        {mode === 'create' ? <Button size="sm" className="gap-1.5"><Plus className="h-3.5 w-3.5" />계정 추가</Button> : <TinyButton label="수정" icon={<Edit2 className="h-3 w-3" />} />}
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{mode === 'create' ? 'LLM 계정 추가' : 'LLM 계정 수정'}</DialogTitle>
          <DialogDescription>API Key는 저장 시 암호화되며 화면/API 응답에 평문으로 노출하지 않습니다.</DialogDescription>
        </DialogHeader>
        <form action={action} className="space-y-4">
          {account?.id && <input type="hidden" name="id" value={account.id} />}
          <Select name="providerId" label="Provider" defaultValue={account?.providerId ?? providers[0]?.id} options={providers.map((provider) => ({ value: provider.id, label: provider.name }))} />
          <div className="grid grid-cols-2 gap-3">
            <Field name="name" label="계정명" defaultValue={account?.name} placeholder="openai-prod-01" required />
            <Field name="priority" label="우선순위" type="number" defaultValue={account?.priority ?? 100} required />
          </div>
          <Field name="apiKey" label={mode === 'create' ? 'API Key' : '새 API Key(변경 시만)'} type="password" placeholder="sk-..." required={mode === 'create'} />
          <div className="grid grid-cols-2 gap-3">
            <Field name="monthlyLimitUsd" label="월 한도(USD)" type="number" step="0.01" defaultValue={String(account?.monthlyLimitUsd ?? 0)} required />
            <Field name="usedThisMonthUsd" label="이번달 사용(USD)" type="number" step="0.01" defaultValue={String(account?.usedThisMonthUsd ?? 0)} required={mode === 'edit'} />
          </div>
          <Select name="status" label="상태" defaultValue={account?.status ?? 'ACTIVE'} options={statuses} />
          <div className="rounded-md bg-muted px-3 py-2 text-xs text-muted-foreground flex gap-2">
            <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            생성/수정/비활성화 기록은 AuditLog에 남습니다. API Key 값은 마스킹되어 기록됩니다.
          </div>
          <DialogFooter><Button type="submit">저장</Button></DialogFooter>
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

function TinyButton({ label, icon }: { label: string; icon: React.ReactNode }) {
  return <button className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 text-[11px] text-muted-foreground hover:text-foreground">{icon}{label}</button>
}
