'use server'

import { revalidatePath } from 'next/cache'
import { requireAdminPagePermission } from '@/lib/admin-auth'
import { recordAdminAudit } from '@/lib/admin-audit'
import { createLLMAccountSchema, createLLMProviderSchema, updateLLMAccountSchema, updateLLMProviderSchema } from '@/lib/admin-validation'
import { encryptLLMSecret, maskSecret } from '@/lib/llm-secret'
import { prisma } from '@/lib/prisma'

export async function createLLMProviderAction(formData: FormData) {
  const session = await requireAdminPagePermission('LLM_POOL_MANAGE')
  const parsed = createLLMProviderSchema.safeParse({ name: formData.get('name'), type: formData.get('type'), status: formData.get('status') || 'ACTIVE' })
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? 'Provider 입력값이 올바르지 않습니다.')

  const provider = await prisma.lLMProvider.create({ data: parsed.data })
  await recordAdminAudit({ session, action: 'LLM_PROVIDER_CREATE', entityType: 'LLMProvider', entityId: provider.id, afterData: provider })
  revalidatePath('/admin/llm-pool')
}

export async function updateLLMProviderAction(formData: FormData) {
  const session = await requireAdminPagePermission('LLM_POOL_MANAGE')
  const id = String(formData.get('id') ?? '')
  if (!id) throw new Error('Provider ID가 필요합니다.')
  const parsed = updateLLMProviderSchema.safeParse({ name: formData.get('name'), type: formData.get('type'), status: formData.get('status') })
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? 'Provider 입력값이 올바르지 않습니다.')

  const before = await prisma.lLMProvider.findUnique({ where: { id } })
  const provider = await prisma.lLMProvider.update({ where: { id }, data: parsed.data })
  await recordAdminAudit({ session, action: 'LLM_PROVIDER_UPDATE', entityType: 'LLMProvider', entityId: provider.id, beforeData: before, afterData: provider })
  revalidatePath('/admin/llm-pool')
}

export async function disableLLMProviderAction(formData: FormData) {
  const session = await requireAdminPagePermission('LLM_POOL_MANAGE')
  const id = String(formData.get('id') ?? '')
  if (!id) throw new Error('Provider ID가 필요합니다.')

  const before = await prisma.lLMProvider.findUnique({ where: { id } })
  const provider = await prisma.lLMProvider.update({ where: { id }, data: { status: 'DISABLED' } })
  await recordAdminAudit({ session, action: 'LLM_PROVIDER_DISABLE', entityType: 'LLMProvider', entityId: provider.id, beforeData: before, afterData: provider })
  revalidatePath('/admin/llm-pool')
}

export async function createLLMAccountAction(formData: FormData) {
  const session = await requireAdminPagePermission('LLM_POOL_MANAGE')
  const parsed = createLLMAccountSchema.safeParse({
    providerId: formData.get('providerId'),
    name: formData.get('name'),
    apiKey: formData.get('apiKey'),
    monthlyLimitUsd: formData.get('monthlyLimitUsd') || 0,
    status: formData.get('status') || 'ACTIVE',
    priority: formData.get('priority') || 100,
  })
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? 'LLM 계정 입력값이 올바르지 않습니다.')

  const account = await prisma.lLMAccount.create({
    data: {
      providerId: parsed.data.providerId,
      name: parsed.data.name,
      apiKeyEncrypted: encryptLLMSecret(parsed.data.apiKey),
      monthlyLimitUsd: parsed.data.monthlyLimitUsd,
      status: parsed.data.status,
      priority: parsed.data.priority,
    },
    include: { provider: true },
  })
  await recordAdminAudit({
    session,
    action: 'LLM_ACCOUNT_CREATE',
    entityType: 'LLMAccount',
    entityId: account.id,
    afterData: { ...account, apiKeyEncrypted: maskSecret(account.apiKeyEncrypted) },
  })
  revalidatePath('/admin/llm-pool')
}

export async function updateLLMAccountAction(formData: FormData) {
  const session = await requireAdminPagePermission('LLM_POOL_MANAGE')
  const id = String(formData.get('id') ?? '')
  if (!id) throw new Error('LLM 계정 ID가 필요합니다.')
  const rawApiKey = String(formData.get('apiKey') ?? '')
  const parsed = updateLLMAccountSchema.safeParse({
    providerId: formData.get('providerId'),
    name: formData.get('name'),
    ...(rawApiKey ? { apiKey: rawApiKey } : {}),
    monthlyLimitUsd: formData.get('monthlyLimitUsd'),
    usedThisMonthUsd: formData.get('usedThisMonthUsd'),
    status: formData.get('status'),
    priority: formData.get('priority'),
  })
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? 'LLM 계정 입력값이 올바르지 않습니다.')

  const before = await prisma.lLMAccount.findUnique({ where: { id }, include: { provider: true } })
  const account = await prisma.lLMAccount.update({
    where: { id },
    data: {
      ...(parsed.data.providerId ? { providerId: parsed.data.providerId } : {}),
      ...(parsed.data.name ? { name: parsed.data.name } : {}),
      ...(parsed.data.apiKey ? { apiKeyEncrypted: encryptLLMSecret(parsed.data.apiKey) } : {}),
      ...(typeof parsed.data.monthlyLimitUsd === 'number' ? { monthlyLimitUsd: parsed.data.monthlyLimitUsd } : {}),
      ...(typeof parsed.data.usedThisMonthUsd === 'number' ? { usedThisMonthUsd: parsed.data.usedThisMonthUsd } : {}),
      ...(parsed.data.status ? { status: parsed.data.status } : {}),
      ...(typeof parsed.data.priority === 'number' ? { priority: parsed.data.priority } : {}),
    },
    include: { provider: true },
  })
  await recordAdminAudit({
    session,
    action: 'LLM_ACCOUNT_UPDATE',
    entityType: 'LLMAccount',
    entityId: account.id,
    beforeData: before ? { ...before, apiKeyEncrypted: maskSecret(before.apiKeyEncrypted) } : null,
    afterData: { ...account, apiKeyEncrypted: maskSecret(account.apiKeyEncrypted), apiKeyChanged: Boolean(parsed.data.apiKey) },
  })
  revalidatePath('/admin/llm-pool')
}

export async function disableLLMAccountAction(formData: FormData) {
  const session = await requireAdminPagePermission('LLM_POOL_MANAGE')
  const id = String(formData.get('id') ?? '')
  if (!id) throw new Error('LLM 계정 ID가 필요합니다.')

  const before = await prisma.lLMAccount.findUnique({ where: { id }, include: { provider: true } })
  const account = await prisma.lLMAccount.update({ where: { id }, data: { status: 'DISABLED' }, include: { provider: true } })
  await recordAdminAudit({
    session,
    action: 'LLM_ACCOUNT_DISABLE',
    entityType: 'LLMAccount',
    entityId: account.id,
    beforeData: before ? { ...before, apiKeyEncrypted: maskSecret(before.apiKeyEncrypted) } : null,
    afterData: { ...account, apiKeyEncrypted: maskSecret(account.apiKeyEncrypted) },
  })
  revalidatePath('/admin/llm-pool')
}
