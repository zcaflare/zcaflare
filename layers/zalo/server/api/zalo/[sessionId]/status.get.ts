import { kv } from '@nuxthub/kv'
import { createError, getRouterParam } from 'h3'
import { createProject, deleteProject } from '#layers/project/server/services/project'
import { getZaloStatus, phaseFromBounceStatus } from '#layers/zalo/server/services/bounce'
import { createZaloWebhook, findWebhookBySession } from '#layers/zalo/server/services/webhook'

interface PendingLogin {
  secret: string
  callbackUrl: string
  sub: string
  orgId: string
}

function deriveName(callbackUrl: string): string {
  try {
    return `Zalo · ${new URL(callbackUrl).host}`
  }
  catch {
    return 'Zalo Webhook'
  }
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

  let phase
  try {
    const status = await getZaloStatus(sessionId, pending.secret)
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

  const project = await createProject({
    orgId: pending.orgId,
    userId: pending.sub,
    name: deriveName(pending.callbackUrl),
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
