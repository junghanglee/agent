import { createHmac, timingSafeEqual } from 'crypto'
import { fail, ok, serializeForJson, validationFail } from '@/lib/api-response'
import { paymentProviderEventSchema } from '@/lib/admin-validation'
import { processPaymentProviderEvent } from '@/lib/payment-processing'

function verifySignature(provider: string, rawBody: string, signature: string | null) {
  const secret = process.env[`PAYMENT_WEBHOOK_SECRET_${provider.toUpperCase().replace(/[^A-Z0-9]/g, '_')}`] ?? process.env.PAYMENT_WEBHOOK_SECRET
  if (!secret) return process.env.NODE_ENV !== 'production'
  if (!signature) return false

  const digest = createHmac('sha256', secret).update(rawBody).digest('hex')
  const expected = signature.startsWith('sha256=') ? signature.slice(7) : signature
  const digestBuffer = Buffer.from(digest, 'hex')
  const expectedBuffer = Buffer.from(expected, 'hex')
  return digestBuffer.length === expectedBuffer.length && timingSafeEqual(digestBuffer, expectedBuffer)
}

function normalizePayload(provider: string, body: Record<string, unknown>) {
  return {
    provider,
    paymentKey: body.paymentKey ?? body.payment_key ?? body.transactionId ?? body.transaction_id ?? body.id,
    purchaseId: body.purchaseId ?? body.purchase_id ?? body.orderId ?? body.order_id,
    status: body.status,
    amount: body.amount ?? body.totalAmount ?? body.total_amount,
    currency: body.currency ?? 'KRW',
    paidAt: body.paidAt ?? body.paid_at ?? body.approvedAt ?? body.approved_at,
    cancelledAt: body.cancelledAt ?? body.cancelled_at ?? body.canceledAt ?? body.canceled_at,
    tokenCreditUsd: body.tokenCreditUsd ?? body.token_credit_usd,
    rawData: body,
  }
}

type Params = { params: Promise<{ provider: string }> }

export async function POST(request: Request, { params }: Params) {
  const { provider } = await params
  const rawBody = await request.text()
  const signature = request.headers.get('x-ai-linker-signature') ?? request.headers.get('x-webhook-signature')

  if (!verifySignature(provider, rawBody, signature)) return fail('웹훅 서명이 올바르지 않습니다.', 401)

  const body = JSON.parse(rawBody || '{}') as Record<string, unknown>
  const parsed = paymentProviderEventSchema.safeParse(normalizePayload(provider, body))
  if (!parsed.success) return validationFail(parsed.error)

  const result = await processPaymentProviderEvent(parsed.data)
  return ok(serializeForJson(result))
}
