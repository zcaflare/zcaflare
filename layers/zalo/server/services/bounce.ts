import { Buffer } from 'node:buffer'
import { $fetch } from 'ofetch'
import { useRuntimeConfig } from '#imports'

export interface BounceLoginResponse {
  sessionId: string
  webhookSecret: string
  status: string
  qrImage: string
}

/** A session for the same Zalo account that this login would collide with. */
export interface BounceConflict {
  sessionId: string
  callbackUrl: string
  displayName: string | null
  updatedAt: string
}

export interface BounceStatusResponse {
  ok: boolean
  session: {
    status: string
    error: string | null
  }
  /** Present only while the session is parked in `conflict`. */
  conflicts?: BounceConflict[]
}

export interface BounceConflictResolution {
  ok: boolean
  keptSessionId: string
  callbackUrl: string
  removedSessionIds: string[]
  /** True when the pre-existing session was kept and this login was discarded. */
  keptExisting: boolean
}

export type WizardPhase = 'pending' | 'conflict' | 'authenticated' | 'expired'

const LOGIN_TIMEOUT_MS = 25_000
const STATUS_TIMEOUT_MS = 15_000
const QR_TIMEOUT_MS = 10_000
const ACTION_TIMEOUT_MS = 30_000

// Matches the bounce server's actual status literals 1:1 (see
// zcaflare/core server/utils/zalo.ts): pending -> scanned -> authenticated,
// or expired / declined / error on failure.
const TERMINAL_EXPIRED = new Set(['expired', 'declined', 'error'])

function baseUrl(): string {
  return useRuntimeConfig().bounceServerUrl.replace(/\/+$/, '')
}

export function phaseFromBounceStatus(status: string): WizardPhase {
  if (status === 'authenticated')
    return 'authenticated'
  // Scanned successfully, but this Zalo account already has a session on another
  // callback URL. It is not pending — nothing more will happen without a choice.
  if (status === 'conflict')
    return 'conflict'
  if (TERMINAL_EXPIRED.has(status))
    return 'expired'
  return 'pending'
}

export async function loginZalo(callbackUrl: string): Promise<BounceLoginResponse> {
  return $fetch<BounceLoginResponse>(`${baseUrl()}/api/zalo/auth/login`, {
    method: 'POST',
    body: { callbackUrl },
    signal: AbortSignal.timeout(LOGIN_TIMEOUT_MS),
  })
}

export async function getZaloStatus(sessionId: string, secret: string): Promise<BounceStatusResponse> {
  return $fetch<BounceStatusResponse>(`${baseUrl()}/api/zalo/${sessionId}/status`, {
    headers: { 'x-webhook-secret': secret },
    signal: AbortSignal.timeout(STATUS_TIMEOUT_MS),
  })
}

export interface BounceActionResponse<T> {
  ok: boolean
  action: string
  result: T
}

/**
 * Invoke a single `zca-js` method on a live core session via the one-for-all
 * endpoint (`POST /api/zalo/{sessionId}/action`). `payload` is the method's
 * positional arguments; the resolved value is the method's return value.
 */
export async function callZaloAction<T = unknown>(
  sessionId: string,
  secret: string,
  action: string,
  payload: unknown[],
): Promise<T> {
  const res = await $fetch<BounceActionResponse<T>>(`${baseUrl()}/api/zalo/${sessionId}/action`, {
    method: 'POST',
    headers: { 'x-webhook-secret': secret },
    body: { action, payload },
    signal: AbortSignal.timeout(ACTION_TIMEOUT_MS),
  })
  return res.result
}

/**
 * Settle a login parked in `conflict` on the bounce server.
 *
 * `replace: true` hands the Zalo account to this login's callback URL and
 * deletes the session it collided with. `replace: false` leaves that session in
 * place — same URL, same signing secret, its receiver none the wiser — and
 * discards this login, whose sessionId and secret become void.
 */
export async function resolveZaloConflict(
  sessionId: string,
  secret: string,
  replace: boolean,
): Promise<BounceConflictResolution> {
  return $fetch<BounceConflictResolution>(`${baseUrl()}/api/zalo/${sessionId}/conflict`, {
    method: 'POST',
    headers: { 'x-webhook-secret': secret },
    body: { replace },
    signal: AbortSignal.timeout(ACTION_TIMEOUT_MS),
  })
}

export async function normalizeQrToDataUrl(qrImage: string): Promise<string> {
  if (qrImage.startsWith('data:'))
    return qrImage
  const res = await $fetch.raw<ArrayBuffer, 'arrayBuffer'>(qrImage, {
    responseType: 'arrayBuffer',
    signal: AbortSignal.timeout(QR_TIMEOUT_MS),
  })
  const contentType = res.headers.get('content-type') || 'image/png'
  const b64 = Buffer.from(res._data as ArrayBuffer).toString('base64')
  return `data:${contentType};base64,${b64}`
}
