import { createError, readValidatedBody } from 'h3'
import { createProject } from '#layers/project/server/services/project'
import { CreateProjectSchema } from '#layers/project/shared/schemas/project'

export default defineAuthorizedHandler(
  ['project:write', 'project:manage'],
  async (event, { session }) => {
    const orgId = session.activeOrg
    if (!orgId)
      throw createError({ statusCode: 400, statusMessage: 'No active organization' })

    const body = await readValidatedBody(event, CreateProjectSchema.parse)

    return createProject({ orgId, userId: session.sub, ...body })
  },
)
