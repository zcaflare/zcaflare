import { getRouterParam, readValidatedBody } from 'h3'
import { callZaloAction } from '#layers/zalo/server/services/bounce'
import { resolveSessionSecret } from '#layers/zalo/server/services/webhook'
import { RemoveUserFromGroupSchema } from '#layers/zalo/shared/schemas/actions/removeUserFromGroup'

export default defineAuthenticatedHandler(async (event, session) => {
  const sessionId = getRouterParam(event, 'sessionId')!
  const body = await readValidatedBody(event, RemoveUserFromGroupSchema.parse)
  const secret = await resolveSessionSecret(sessionId, session.sub)
  return callZaloAction(sessionId, secret, 'removeUserFromGroup', [body.memberId, body.groupId])
})
