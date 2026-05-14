import { recordAdminAudit } from '@/lib/admin-audit'
import { requireAdminApiSession } from '@/lib/admin-auth'
import { fail, ok, serializeForJson, validationFail } from '@/lib/api-response'
import { updateLLMProviderSchema } from '@/lib/admin-validation'
import { prisma } from '@/lib/prisma'

type Params = { params: Promise<{ id: string }> }

export async function PATCH(request: Request, { params }: Params) {
  const { session, response } = await requireAdminApiSession('LLM_POOL_MANAGE')
  if (response) return response

  const { id } = await params
  const parsed = updateLLMProviderSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return validationFail(parsed.error)

  try {
    const before = await prisma.lLMProvider.findUnique({ where: { id } })
    const provider = await prisma.lLMProvider.update({ where: { id }, data: parsed.data })
    await recordAdminAudit({
      session,
      action: 'LLM_PROVIDER_UPDATE',
      entityType: 'LLMProvider',
      entityId: provider.id,
      beforeData: before,
      afterData: provider,
    })
    return ok(serializeForJson(provider))
  } catch {
    return fail('LLM Provider 수정에 실패했습니다.', 400)
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  const { session, response } = await requireAdminApiSession('LLM_POOL_MANAGE')
  if (response) return response

  const { id } = await params

  try {
    const before = await prisma.lLMProvider.findUnique({ where: { id } })
    const provider = await prisma.lLMProvider.update({ where: { id }, data: { status: 'DISABLED' } })
    await recordAdminAudit({
      session,
      action: 'LLM_PROVIDER_DISABLE',
      entityType: 'LLMProvider',
      entityId: provider.id,
      beforeData: before,
      afterData: provider,
    })
    return ok(serializeForJson(provider))
  } catch {
    return fail('LLM Provider 비활성화에 실패했습니다.', 400)
  }
}
