import { kv } from '@nuxthub/kv'
import { createError, getRouterParam, readValidatedBody } from 'h3'
import { createProject, deleteProject } from '#layers/project/server/services/project'
import { resolveZaloConflict } from '#layers/zalo/server/services/bounce'
import {
  createZaloWebhook,
  deleteWebhooksBySessions,
  deriveProjectName,
  findWebhookBySession,
  isProjectMember,
} from '#layers/zalo/server/services/webhook'
import { ZaloConflictSchema } from '#layers/zalo/shared/schemas/zalo'

interface PendingLogin {
  secret: string
  callbackUrl: string
  sub: string
  orgId: string
}

/**
 * POST /api/zalo/{sessionId}/conflict
 *
 * Settles a login whose QR scan revealed a Zalo account that already had a
 * session on a different callback URL. Only the user who started this login may
 * settle it — the pending record in KV is the proof, and it holds the one-time
 * secret the bounce server requires.
 *
 * The authority here is the phone: whoever scanned the QR controls the Zalo
 * account, so they may retire a webhook the account was feeding — even one
 * belonging to a project they cannot see. What they must not learn is anything
 * about that project, so a kept webhook they are not a member of resolves
 * successfully but names nothing.
 */
export default defineAuthenticatedHandler(async (event, session) => {
  const sessionId = getRouterParam(event, 'sessionId')!
  const { replace } = await readValidatedBody(event, ZaloConflictSchema.parse)

  const pending = await kv.get<PendingLogin>(`zalo:pending:${sessionId}`)
  if (!pending)
    throw createError({ statusCode: 404, statusMessage: 'This Zalo login is no longer pending' })
  if (pending.sub !== session.sub)
    throw createError({ statusCode: 403, statusMessage: 'Forbidden' })

  let resolution
  try {
    resolution = await resolveZaloConflict(sessionId, pending.secret, replace)
  }
  catch {
    throw createError({ statusCode: 502, statusMessage: 'The Zalo login service could not settle this conflict. Please try again.' })
  }

  // Core has deleted these sessions outright; a webhook row that outlived one
  // would keep advertising a secret and a URL that can never receive again.
  await deleteWebhooksBySessions(resolution.removedSessionIds)
  await kv.del(`zalo:pending:${sessionId}`)

  if (resolution.keptExisting) {
    // Nothing was created: the account kept the webhook it already had, still on
    // its original signing secret. This login's session and secret are void.
    const kept = await findWebhookBySession(resolution.keptSessionId)
    const visible = kept && await isProjectMember(kept.project_id, session.sub)
    return {
      phase: 'authenticated' as const,
      keptExisting: true,
      callbackUrl: resolution.callbackUrl,
      projectId: visible ? kept.project_id : null,
    }
  }

  const project = await createProject({
    orgId: pending.orgId,
    userId: pending.sub,
    name: deriveProjectName(pending.callbackUrl),
  })

  const winner = await createZaloWebhook({
    projectId: project.id,
    sessionId,
    callbackUrl: pending.callbackUrl,
    secret: pending.secret,
  })

  // createZaloWebhook is a no-op insert when the session already has a row, so
  // the project just created would otherwise be orphaned.
  if (winner.project_id !== project.id)
    await deleteProject(project.id)

  return {
    phase: 'authenticated' as const,
    keptExisting: false,
    callbackUrl: resolution.callbackUrl,
    projectId: winner.project_id,
  }
})
