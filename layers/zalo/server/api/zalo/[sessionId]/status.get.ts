import { kv } from '@nuxthub/kv'
import { createError, getRouterParam } from 'h3'
import { createProject, deleteProject } from '#layers/project/server/services/project'
import { getZaloStatus, phaseFromBounceStatus } from '#layers/zalo/server/services/bounce'
import { createZaloWebhook, deriveProjectName, findWebhookBySession } from '#layers/zalo/server/services/webhook'

interface PendingLogin {
  secret: string
  callbackUrl: string
  sub: string
  orgId: string
}

export default defineAuthenticatedHandler(async (event, session) => {
  const sessionId = getRouterParam(event, 'sessionId')!

  const pending = await kv.get<PendingLogin>(`zalo:pending:${sessionId}`)
  if (!pending)
    return { phase: 'expired' as const }
  if (pending.sub !== session.sub)
    throw createError({ statusCode: 403, statusMessage: 'Forbidden' })

  const existing = await findWebhookBySession(sessionId)
  if (existing) {
    await kv.del(`zalo:pending:${sessionId}`)
    return { phase: 'authenticated' as const, projectId: existing.project_id }
  }

  let status
  let phase
  try {
    status = await getZaloStatus(sessionId, pending.secret)
    phase = phaseFromBounceStatus(status.session.status)
  }
  catch {
    return { phase: 'pending' as const }
  }

  if (phase === 'expired') {
    await kv.del(`zalo:pending:${sessionId}`)
    return { phase: 'expired' as const }
  }
  if (phase === 'pending')
    return { phase: 'pending' as const }

  // Scanned, but this Zalo account already has a session on another callback
  // URL. No project or webhook is created yet: which URL survives is the user's
  // call, and creating one here would be creating the answer.
  if (phase === 'conflict') {
    return {
      phase: 'conflict' as const,
      conflicts: (status.conflicts ?? []).map(conflict => ({
        sessionId: conflict.sessionId,
        callbackUrl: conflict.callbackUrl,
        displayName: conflict.displayName,
      })),
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

  if (winner.project_id !== project.id)
    await deleteProject(project.id)

  await kv.del(`zalo:pending:${sessionId}`)
  return { phase: 'authenticated' as const, projectId: winner.project_id }
})
