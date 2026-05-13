import { NextResponse } from 'next/server'
import { ZodError } from 'zod'

export function ok<T>(data: T, init?: ResponseInit) {
  return NextResponse.json({ ok: true, data }, init)
}

export function fail(message: string, status = 400, details?: unknown) {
  return NextResponse.json({ ok: false, error: message, details }, { status })
}

export function validationFail(error: ZodError) {
  return fail('입력값이 올바르지 않습니다.', 422, error.flatten())
}

export function serializeForJson<T>(value: T): T {
  return JSON.parse(JSON.stringify(value, (_key, item) => {
    if (typeof item === 'bigint') return item.toString()
    if (item && typeof item === 'object' && typeof item.toString === 'function' && item.constructor?.name === 'Decimal') return item.toString()
    return item
  }))
}
