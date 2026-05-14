import { recordAdminAudit } from '@/lib/admin-audit'
import { requireAdminApiSession } from '@/lib/admin-auth'
import { fail, ok, serializeForJson, validationFail } from '@/lib/api-response'
import { updateLLMAccountSchema } from '@/lib/admin-validation'
import { encryptLLMSecret, maskSecret } from '@/lib/llm-secret'
import { prisma } from '@/lib/prisma'

type Params = { params: Promise<{ id: string }> }

function safeAccount<T extends { apiKeyEncrypted: string }>(account: T) {
  return { ...account, apiKeyEncrypted: maskSecret(account.apiKeyEncrypted) }
}

export async function PATCH(request: Request, { params }: Params) {
  const { session, response } = await requireAdminApiSession('LLM_POOL_MANAGE')
  if (response) return response

  const { id } = await params
  const parsed = updateLLMAccountSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return validationFail(parsed.error)

  try {
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
      beforeData: before ? safeAccount(before) : null,
      afterData: { ...safeAccount(account), apiKeyChanged: Boolean(parsed.data.apiKey) },
    })
    return ok(serializeForJson(safeAccount(account)))
  } catch {
    return fail('LLM 계정 수정에 실패했습니다.', 400)
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  const { session, response } = await requireAdminApiSession('LLM_POOL_MANAGE')
  if (response) return response

  const { id } = await params

  try {
    const before = await prisma.lLMAccount.findUnique({ where: { id }, include: { provider: true } })
    const account = await prisma.lLMAccount.update({ where: { id }, data: { status: 'DISABLED' }, include: { provider: true } })
    await recordAdminAudit({
      session,
      action: 'LLM_ACCOUNT_DISABLE',
      entityType: 'LLMAccount',
      entityId: account.id,
      beforeData: before ? safeAccount(before) : null,
      afterData: safeAccount(account),
    })
    return ok(serializeForJson(safeAccount(account)))
  } catch {
    return fail('LLM 계정 비활성화에 실패했습니다.', 400)
  }
}
