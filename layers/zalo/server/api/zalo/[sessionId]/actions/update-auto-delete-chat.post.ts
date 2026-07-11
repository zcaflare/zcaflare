import { getRouterParam, readValidatedBody } from 'h3'
import { callZaloAction } from '#layers/zalo/server/services/bounce'
import { resolveSessionSecret } from '#layers/zalo/server/services/webhook'
import { UpdateAutoDeleteChatSchema } from '#layers/zalo/shared/schemas/actions/updateAutoDeleteChat'

export default defineAuthenticatedHandler(async (event, session) => {
  const sessionId = getRouterParam(event, 'sessionId')!
  const body = await readValidatedBody(event, UpdateAutoDeleteChatSchema.parse)
  const secret = await resolveSessionSecret(sessionId, session.sub)
  return callZaloAction(sessionId, secret, 'updateAutoDeleteChat', [body.ttl, body.threadId, body.type])
})
