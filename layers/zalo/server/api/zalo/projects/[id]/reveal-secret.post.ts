import { createError, getValidatedRouterParams, setResponseHeader } from 'h3'
import { revealWebhookSecretForUser } from '#layers/zalo/server/services/webhook'
import { ZaloProjectParamsSchema } from '#layers/zalo/shared/schemas/zalo'

export default defineAuthenticatedHandler(async (event, session) => {
  setResponseHeader(event, 'Cache-Control', 'private, no-store')
  const { id } = await getValidatedRouterParams(event, ZaloProjectParamsSchema.parse)
  if (!session.activeOrg)
    throw createError({ statusCode: 404, statusMessage: 'Project not found' })
  const secret = await revealWebhookSecretForUser(id, session.activeOrg, session.sub)
  if (!secret)
    throw createError({ statusCode: 404, statusMessage: 'Project not found' })
  return { secret }
})
