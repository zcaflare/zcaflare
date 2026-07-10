import { getRouterParam, readValidatedBody } from 'h3'
import { callZaloAction } from '#layers/zalo/server/services/bounce'
import { resolveSessionSecret } from '#layers/zalo/server/services/webhook'
import { DeleteGroupInviteBoxSchema } from '#layers/zalo/shared/schemas/actions/deleteGroupInviteBox'

export default defineAuthenticatedHandler(async (event, session) => {
  const sessionId = getRouterParam(event, 'sessionId')!
  const body = await readValidatedBody(event, DeleteGroupInviteBoxSchema.parse)
  const secret = await resolveSessionSecret(sessionId, session.sub)
  return callZaloAction(sessionId, secret, 'deleteGroupInviteBox', [body.groupId, body.blockFutureInvite])
})
