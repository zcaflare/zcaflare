import { getRouterParam, readValidatedBody } from 'h3'
import { callZaloAction } from '#layers/zalo/server/services/bounce'
import { resolveSessionSecret } from '#layers/zalo/server/services/webhook'
import { ReviewPendingMemberRequestSchema } from '#layers/zalo/shared/schemas/actions/reviewPendingMemberRequest'

export default defineAuthenticatedHandler(async (event, session) => {
  const sessionId = getRouterParam(event, 'sessionId')!
  const body = await readValidatedBody(event, ReviewPendingMemberRequestSchema.parse)
  const secret = await resolveSessionSecret(sessionId, session.sub)
  return callZaloAction(sessionId, secret, 'reviewPendingMemberRequest', [body.payload, body.groupId])
})
