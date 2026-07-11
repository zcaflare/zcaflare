import { getRouterParam, readValidatedBody } from 'h3'
import { callZaloAction } from '#layers/zalo/server/services/bounce'
import { resolveSessionSecret } from '#layers/zalo/server/services/webhook'
import { SendFriendRequestSchema } from '#layers/zalo/shared/schemas/actions/sendFriendRequest'

export default defineAuthenticatedHandler(async (event, session) => {
  const sessionId = getRouterParam(event, 'sessionId')!
  const body = await readValidatedBody(event, SendFriendRequestSchema.parse)
  const secret = await resolveSessionSecret(sessionId, session.sub)
  return callZaloAction(sessionId, secret, 'sendFriendRequest', [body.msg, body.userId])
})
