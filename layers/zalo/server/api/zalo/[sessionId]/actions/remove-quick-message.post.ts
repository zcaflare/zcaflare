import { getRouterParam, readValidatedBody } from 'h3'
import { callZaloAction } from '#layers/zalo/server/services/bounce'
import { resolveSessionSecret } from '#layers/zalo/server/services/webhook'
import { RemoveQuickMessageSchema } from '#layers/zalo/shared/schemas/actions/removeQuickMessage'

export default defineAuthenticatedHandler(async (event, session) => {
  const sessionId = getRouterParam(event, 'sessionId')!
  const body = await readValidatedBody(event, RemoveQuickMessageSchema.parse)
  const secret = await resolveSessionSecret(sessionId, session.sub)
  return callZaloAction(sessionId, secret, 'removeQuickMessage', [body.itemIds])
})
