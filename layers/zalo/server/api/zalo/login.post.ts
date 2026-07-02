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

const PENDING_TTL_S = 1800

export default defineAuthenticatedHandler(async (event, session) => {
  const orgId = session.activeOrg
  if (!orgId)
    throw createError({ statusCode: 400, statusMessage: 'No active organization' })

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

  return { sessionId: login.sessionId, qrDataUrl, status: login.status }
})
