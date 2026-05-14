import { recordAdminAudit } from '@/lib/admin-audit'
import { requireAdminApiSession } from '@/lib/admin-auth'
import { fail, ok, serializeForJson, validationFail } from '@/lib/api-response'
import { createLLMAccountSchema } from '@/lib/admin-validation'
import { encryptLLMSecret, maskSecret } from '@/lib/llm-secret'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const { response } = await requireAdminApiSession('LLM_POOL_READ')
  if (response) return response

  const accounts = await prisma.lLMAccount.findMany({
    orderBy: [{ status: 'asc' }, { priority: 'asc' }],
    include: { provider: true },
  })

  return ok(serializeForJson(accounts.map((account) => ({ ...account, apiKeyEncrypted: maskSecret(account.apiKeyEncrypted) }))))
}

export async function POST(request: Request) {
  const { session, response } = await requireAdminApiSession('LLM_POOL_MANAGE')
  if (response) return response

  const parsed = createLLMAccountSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return validationFail(parsed.error)

  try {
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
    return ok(serializeForJson({ ...account, apiKeyEncrypted: maskSecret(account.apiKeyEncrypted) }), { status: 201 })
  } catch {
    return fail('LLM 계정 생성에 실패했습니다.', 400)
  }
}
