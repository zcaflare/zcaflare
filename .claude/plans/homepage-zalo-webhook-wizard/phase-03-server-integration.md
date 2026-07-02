# Phase 03 — Bounce integration + server routes

Server-side proxy to the bounce server + the two wizard endpoints + the
owner-only secret reveal. All handlers use `defineAuthenticatedHandler`
(auto-imported from `@thecodeorigin/auth`) and enforce explicit ownership.

## Step 1 — Bounce service

### `layers/zalo/server/services/bounce.ts`
```ts
import { Buffer } from 'node:buffer'
import { useRuntimeConfig } from '#imports'
import { $fetch } from 'ofetch'

export interface BounceLoginResponse {
  sessionId: string
  webhookSecret: string
  status: string
  qrImage: string
}

export interface BounceStatusResponse {
  status: string
}

export type WizardPhase = 'pending' | 'authenticated' | 'expired'

const LOGIN_TIMEOUT_MS = 25_000
const STATUS_TIMEOUT_MS = 15_000
const QR_TIMEOUT_MS = 10_000

// Unconfirmed against a live success — see plan open question #2. Adjust once
// real values are observed.
const TERMINAL_EXPIRED = new Set(['expired', 'qr_expired', 'timeout', 'failed', 'error'])

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

/** Normalize the bounce QR (public R2 URL or already-inline data: URL) into a
 *  data: URL so the browser never fetches a cross-origin image (no CSP edit). */
export async function normalizeQrToDataUrl(qrImage: string): Promise<string> {
  if (qrImage.startsWith('data:'))
    return qrImage
  const res = await $fetch.raw<ArrayBuffer>(qrImage, {
    responseType: 'arrayBuffer',
    signal: AbortSignal.timeout(QR_TIMEOUT_MS),
  })
  const contentType = res.headers.get('content-type') || 'image/png'
  const b64 = Buffer.from(res._data as ArrayBuffer).toString('base64')
  return `data:${contentType};base64,${b64}`
}
```

## Step 2 — Webhook service (encrypt + ownership)

### `layers/zalo/server/services/webhook.ts`
```ts
import type { ZaloWebhook } from '@nuxthub/db/schema'
import { db } from '@nuxthub/db'
import { projectMemberTable, zaloWebhookTable } from '@nuxthub/db/schema'
import { and, eq } from 'drizzle-orm'
import { decryptSecret, encryptSecret } from '~~/server/utils/crypto'

export interface CreateZaloWebhookInput {
  projectId: string
  sessionId: string
  callbackUrl: string
  secret: string
}

/** Insert idempotently keyed by session_id; returns the canonical row (the
 *  winner of any race). Caller compares row.project_id to its own to detect a
 *  lost race. */
export async function createZaloWebhook(input: CreateZaloWebhookInput): Promise<ZaloWebhook> {
  const { ciphertext, iv } = await encryptSecret(input.secret)

  await db.insert(zaloWebhookTable).values({
    project_id: input.projectId,
    session_id: input.sessionId,
    callback_url: input.callbackUrl,
    secret_ciphertext: ciphertext,
    secret_iv: iv,
  }).onConflictDoNothing({ target: zaloWebhookTable.session_id })

  const row = await db.query.zaloWebhookTable.findFirst({
    where: eq(zaloWebhookTable.session_id, input.sessionId),
  })
  return row!
}

export async function findWebhookBySession(sessionId: string) {
  return db.query.zaloWebhookTable.findFirst({
    where: eq(zaloWebhookTable.session_id, sessionId),
  })
}

/** Reveal the decrypted secret to a project member only. Returns null if the
 *  caller is not a member or no webhook exists. */
export async function revealWebhookForUser(projectId: string, userId: string) {
  const membership = await db.query.projectMemberTable.findFirst({
    where: and(
      eq(projectMemberTable.project_id, projectId),
      eq(projectMemberTable.user_id, userId),
    ),
  })
  if (!membership)
    return null

  const wh = await db.query.zaloWebhookTable.findFirst({
    where: eq(zaloWebhookTable.project_id, projectId),
  })
  if (!wh)
    return null

  const webhookSecret = await decryptSecret({ ciphertext: wh.secret_ciphertext, iv: wh.secret_iv })
  return {
    projectId: wh.project_id,
    callbackUrl: wh.callback_url,
    sessionId: wh.session_id,
    webhookSecret,
    createdAt: wh.created_at,
  }
}
```

## Step 3 — Login route

### `layers/zalo/server/api/zalo/login.post.ts`
```ts
import { kv } from '@nuxthub/kv'
import { createError, readValidatedBody } from 'h3'
import { loginZalo, normalizeQrToDataUrl } from '#layers/zalo/server/services/bounce'
import { ZaloLoginSchema } from '#layers/zalo/shared/schemas/zalo'

interface PendingLogin {
  secret: string
  callbackUrl: string
  sub: string
  orgId: string
}

const PENDING_TTL_S = 1800 // 30 min
const RL_TTL_S = 10

export default defineAuthenticatedHandler(async (event, session) => {
  const orgId = session.activeOrg
  if (!orgId)
    throw createError({ statusCode: 400, statusMessage: 'No active organization' })

  // Per-user throttle: each login spins up a paid upstream Zalo session.
  const rlKey = `zalo:login-rl:${session.sub}`
  if (await kv.has(rlKey))
    throw createError({ statusCode: 429, statusMessage: 'Please wait a few seconds before starting another Zalo login.' })
  await kv.set(rlKey, '1', { ttl: RL_TTL_S })

  const { callbackUrl } = await readValidatedBody(event, ZaloLoginSchema.parse)

  let login
  try {
    login = await loginZalo(callbackUrl)
  }
  catch {
    throw createError({ statusCode: 502, statusMessage: 'The Zalo login service is busy or unavailable. Please try again in a moment.' })
  }

  const qrDataUrl = await normalizeQrToDataUrl(login.qrImage).catch(() => login.qrImage)

  await kv.set(`zalo:pending:${login.sessionId}`, {
    secret: login.webhookSecret,
    callbackUrl,
    sub: session.sub,
    orgId,
  } satisfies PendingLogin, { ttl: PENDING_TTL_S })

  // Secret is NOT returned here (see plan: secret only via webhooks/[id]).
  return { sessionId: login.sessionId, qrDataUrl, status: login.status }
})
```

## Step 4 — Status poll route (creates project + webhook on success)

### `layers/zalo/server/api/zalo/[sessionId]/status.get.ts`
```ts
import { kv } from '@nuxthub/kv'
import { createError, getRouterParam } from 'h3'
import { createProject, deleteProject } from '#layers/project/server/services/project'
import { getZaloStatus, phaseFromBounceStatus } from '#layers/zalo/server/services/bounce'
import { createZaloWebhook, findWebhookBySession } from '#layers/zalo/server/services/webhook'

interface PendingLogin {
  secret: string
  callbackUrl: string
  sub: string
  orgId: string
}

function deriveName(callbackUrl: string): string {
  try {
    return `Zalo · ${new URL(callbackUrl).host}`
  }
  catch {
    return 'Zalo Webhook'
  }
}

export default defineAuthenticatedHandler(async (event, session) => {
  const sessionId = getRouterParam(event, 'sessionId')!

  const pending = await kv.get<PendingLogin>(`zalo:pending:${sessionId}`)
  if (!pending)
    return { phase: 'expired' as const }
  if (pending.sub !== session.sub)
    throw createError({ statusCode: 403, statusMessage: 'Forbidden' })

  // Already created (e.g. a duplicate poll after success, before KV delete).
  const existing = await findWebhookBySession(sessionId)
  if (existing) {
    await kv.del(`zalo:pending:${sessionId}`)
    return { phase: 'authenticated' as const, projectId: existing.project_id }
  }

  let phase
  try {
    const status = await getZaloStatus(sessionId, pending.secret)
    phase = phaseFromBounceStatus(status.status)
  }
  catch {
    // transient upstream error — let the client keep polling
    return { phase: 'pending' as const }
  }

  if (phase === 'expired') {
    await kv.del(`zalo:pending:${sessionId}`)
    return { phase: 'expired' as const }
  }
  if (phase === 'pending')
    return { phase: 'pending' as const }

  // authenticated → create the project (Zalo webhook) + the binding row.
  const project = await createProject({
    orgId: pending.orgId,
    userId: pending.sub,
    name: deriveName(pending.callbackUrl),
  })

  const winner = await createZaloWebhook({
    projectId: project.id,
    sessionId,
    callbackUrl: pending.callbackUrl,
    secret: pending.secret,
  })

  // Lost a creation race → our project is an orphan; remove it.
  if (winner.project_id !== project.id)
    await deleteProject(project.id)

  await kv.del(`zalo:pending:${sessionId}`)
  return { phase: 'authenticated' as const, projectId: winner.project_id }
})
```

## Step 5 — Owner-only secret reveal route

### `layers/zalo/server/api/zalo/webhooks/[id].get.ts`
```ts
import { createError, getRouterParam } from 'h3'
import { revealWebhookForUser } from '#layers/zalo/server/services/webhook'

export default defineAuthenticatedHandler(async (event, session) => {
  const projectId = getRouterParam(event, 'id')!
  const result = await revealWebhookForUser(projectId, session.sub)
  if (!result)
    throw createError({ statusCode: 403, statusMessage: 'Forbidden' })
  return result
})
```

## Notes for cook

- `db.query.zaloWebhookTable` / `db.query.projectMemberTable` work without
  explicit `relations()` (no `with:` is used) — NuxtHub initializes the
  Drizzle client with the aggregated schema.
- Verify against a **live successful** Zalo login that
  `phaseFromBounceStatus` maps the real status string to `authenticated`
  (plan open question #2). If the success status differs, update the function
  and the `TERMINAL_EXPIRED` set.

## Done when

- All three routes compile and `pnpm typecheck` passes.
- Manual probe (server running, signed in): a non-https callback URL → 400; a
  valid one → `{ sessionId, qrDataUrl }`; polling returns `pending` until
  scanned, then `authenticated` with a `projectId`; `webhooks/:id` returns the
  decrypted secret to the owner and 403 to a non-member.
