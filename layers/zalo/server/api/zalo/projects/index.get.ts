import { listZaloProjectsForUser } from '#layers/zalo/server/services/webhook'

export default defineAuthenticatedHandler((_event, session) =>
  session.activeOrg
    ? listZaloProjectsForUser(session.activeOrg, session.sub)
    : [],
)
