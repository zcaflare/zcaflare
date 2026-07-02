import { Buffer } from 'node:buffer'
import { $fetch } from 'ofetch'
import { useRuntimeConfig } from '#imports'

export interface BounceLoginResponse {
  sessionId: string
  webhookSecret: string
  status: string
  qrImage: string
}

export interface BounceStatusResponse {
  ok: boolean
  session: {
    status: string
    error: string | null
  }
}

export type WizardPhase = 'pending' | 'authenticated' | 'expired'

const LOGIN_TIMEOUT_MS = 25_000
const STATUS_TIMEOUT_MS = 15_000
const QR_TIMEOUT_MS = 10_000

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
