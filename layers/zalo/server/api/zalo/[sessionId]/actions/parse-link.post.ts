import { getRouterParam, readValidatedBody } from 'h3'
import { callZaloAction } from '#layers/zalo/server/services/bounce'
import { resolveSessionSecret } from '#layers/zalo/server/services/webhook'
import { ParseLinkSchema } from '#layers/zalo/shared/schemas/actions/parseLink'

export default defineAuthenticatedHandler(async (event, session) => {
  const sessionId = getRouterParam(event, 'sessionId')!
  const body = await readValidatedBody(event, ParseLinkSchema.parse)
  const secret = await resolveSessionSecret(sessionId, session.sub)
  return callZaloAction(sessionId, secret, 'parseLink', [body.link])
})
