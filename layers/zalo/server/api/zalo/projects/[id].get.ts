import { createError, getValidatedRouterParams } from 'h3'
import { findZaloProjectForUser } from '#layers/zalo/server/services/webhook'
import { ZaloProjectParamsSchema } from '#layers/zalo/shared/schemas/zalo'

export default defineAuthenticatedHandler(async (event, session) => {
  const { id } = await getValidatedRouterParams(event, ZaloProjectParamsSchema.parse)
  if (!session.activeOrg)
    throw createError({ statusCode: 404, statusMessage: 'Project not found' })
  const project = await findZaloProjectForUser(id, session.activeOrg, session.sub)
  if (!project)
    throw createError({ statusCode: 404, statusMessage: 'Project not found' })
  return project
})
