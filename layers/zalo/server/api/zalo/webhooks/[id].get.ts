import { createError, getRouterParam } from 'h3'
import { revealWebhookForUser } from '#layers/zalo/server/services/webhook'

export default defineAuthenticatedHandler(async (event, session) => {
  const projectId = getRouterParam(event, 'id')!
  const result = await revealWebhookForUser(projectId, session.sub)
  if (!result)
    throw createError({ statusCode: 403, statusMessage: 'Forbidden' })
  return result
})
