import { recordAdminAudit } from '@/lib/admin-audit'
import { requireAdminApiSession } from '@/lib/admin-auth'
import { fail, ok, serializeForJson, validationFail } from '@/lib/api-response'
import { createLLMProviderSchema } from '@/lib/admin-validation'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const { response } = await requireAdminApiSession('LLM_POOL_READ')
  if (response) return response

  const providers = await prisma.lLMProvider.findMany({
    orderBy: { createdAt: 'desc' },
    include: { accounts: true, models: true, routingPolicies: true },
  })

  return ok(serializeForJson(providers))
}

export async function POST(request: Request) {
  const { session, response } = await requireAdminApiSession('LLM_POOL_MANAGE')
  if (response) return response

  const parsed = createLLMProviderSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return validationFail(parsed.error)

  try {
    const provider = await prisma.lLMProvider.create({ data: parsed.data })
    await recordAdminAudit({
      session,
      action: 'LLM_PROVIDER_CREATE',
      entityType: 'LLMProvider',
      entityId: provider.id,
      afterData: provider,
    })
    return ok(serializeForJson(provider), { status: 201 })
  } catch {
    return fail('LLM Provider 생성에 실패했습니다.', 400)
  }
}
