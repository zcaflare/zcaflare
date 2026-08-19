import type { ZaloWebhook } from '@nuxthub/db/schema'
import { db } from '@nuxthub/db'
import { projectMemberTable, projectTable, zaloWebhookTable } from '@nuxthub/db/schema'
import { and, desc, eq, inArray } from 'drizzle-orm'
import { createError } from 'h3'
import { decryptSecret, encryptSecret } from '~~/server/utils/crypto'

/** A human label for the project a webhook lands in, taken from its host. */
export function deriveProjectName(callbackUrl: string): string {
  try {
    return `Zalo · ${new URL(callbackUrl).host}`
  }
  catch {
    return 'Zalo Webhook'
  }
}

export interface CreateZaloWebhookInput {
  projectId: string
  sessionId: string
  callbackUrl: string
  secret: string
}

export async function createZaloWebhook(input: CreateZaloWebhookInput): Promise<ZaloWebhook> {
  const { ciphertext, iv } = await encryptSecret(input.secret)

  await db.insert(zaloWebhookTable).values({
    project_id: input.projectId,
    session_id: input.sessionId,
    callback_url: input.callbackUrl,
    secret_ciphertext: ciphertext,
    secret_iv: iv,
  }).onConflictDoNothing({ target: zaloWebhookTable.session_id })

  const row = await db.query.zaloWebhookTable.findFirst({
    where: eq(zaloWebhookTable.session_id, input.sessionId),
  })
  return row!
}

export async function findWebhookBySession(sessionId: string) {
  return db.query.zaloWebhookTable.findFirst({
    where: eq(zaloWebhookTable.session_id, sessionId),
  })
}

/**
 * Forget the webhook records of sessions the bounce server has deleted. Their
 * secrets authenticate nothing and their callback URLs will never be delivered
 * to again, so a surviving row would only advertise a webhook that is silently
 * dead.
 */
export async function deleteWebhooksBySessions(sessionIds: string[]): Promise<void> {
  if (sessionIds.length === 0)
    return
  await db.delete(zaloWebhookTable).where(inArray(zaloWebhookTable.session_id, sessionIds))
}

export async function isProjectMember(projectId: string, userId: string): Promise<boolean> {
  const membership = await db.query.projectMemberTable.findFirst({
    where: and(
      eq(projectMemberTable.project_id, projectId),
      eq(projectMemberTable.user_id, userId),
    ),
  })
  return Boolean(membership)
}

/**
 * Resolve the bounce-server webhook secret for a core session, gated by project
 * membership. Every per-method action endpoint calls this to authenticate the
 * caller and obtain the secret needed to reach the core one-for-all endpoint.
 *
 * Throws 404 when no webhook owns the session and 403 when the user is not a
 * member of the owning project.
 */
export async function resolveSessionSecret(sessionId: string, userId: string): Promise<string> {
  const wh = await db.query.zaloWebhookTable.findFirst({
    where: eq(zaloWebhookTable.session_id, sessionId),
  })
  if (!wh)
    throw createError({ statusCode: 404, statusMessage: 'Zalo session not found' })

  const membership = await db.query.projectMemberTable.findFirst({
    where: and(
      eq(projectMemberTable.project_id, wh.project_id),
      eq(projectMemberTable.user_id, userId),
    ),
  })
  if (!membership)
    throw createError({ statusCode: 403, statusMessage: 'Forbidden' })

  return decryptSecret({ ciphertext: wh.secret_ciphertext, iv: wh.secret_iv })
}

export async function revealWebhookForUser(projectId: string, userId: string) {
  const membership = await db.query.projectMemberTable.findFirst({
    where: and(
      eq(projectMemberTable.project_id, projectId),
      eq(projectMemberTable.user_id, userId),
    ),
  })
  if (!membership)
    return null

  const wh = await db.query.zaloWebhookTable.findFirst({
    where: eq(zaloWebhookTable.project_id, projectId),
  })
  if (!wh)
    return null

  const webhookSecret = await decryptSecret({ ciphertext: wh.secret_ciphertext, iv: wh.secret_iv })
  return {
    projectId: wh.project_id,
    callbackUrl: wh.callback_url,
    sessionId: wh.session_id,
    webhookSecret,
    createdAt: wh.created_at,
  }
}

const zaloProjectSelection = {
  id: projectTable.id,
  name: projectTable.name,
  description: projectTable.description,
  status: projectTable.status,
  callbackUrl: zaloWebhookTable.callback_url,
  sessionId: zaloWebhookTable.session_id,
  connectedAt: zaloWebhookTable.created_at,
  updatedAt: zaloWebhookTable.updated_at,
}

export function listZaloProjectsForUser(orgId: string, userId: string) {
  return db.select(zaloProjectSelection)
    .from(zaloWebhookTable)
    .innerJoin(projectTable, eq(projectTable.id, zaloWebhookTable.project_id))
    .innerJoin(projectMemberTable, and(
      eq(projectMemberTable.project_id, projectTable.id),
      eq(projectMemberTable.user_id, userId),
    ))
    .where(and(
      eq(projectTable.organization_id, orgId),
      eq(projectTable.status, 'active'),
    ))
    .orderBy(desc(zaloWebhookTable.created_at))
}

export async function findZaloProjectForUser(projectId: string, orgId: string, userId: string) {
  const [record] = await db.select(zaloProjectSelection)
    .from(zaloWebhookTable)
    .innerJoin(projectTable, eq(projectTable.id, zaloWebhookTable.project_id))
    .innerJoin(projectMemberTable, and(
      eq(projectMemberTable.project_id, projectTable.id),
      eq(projectMemberTable.user_id, userId),
    ))
    .where(and(
      eq(projectTable.id, projectId),
      eq(projectTable.organization_id, orgId),
    ))
    .limit(1)
  return record ?? null
}

export async function revealWebhookSecretForUser(projectId: string, orgId: string, userId: string) {
  const [record] = await db.select({
    ciphertext: zaloWebhookTable.secret_ciphertext,
    iv: zaloWebhookTable.secret_iv,
  })
    .from(zaloWebhookTable)
    .innerJoin(projectTable, eq(projectTable.id, zaloWebhookTable.project_id))
    .innerJoin(projectMemberTable, and(
      eq(projectMemberTable.project_id, projectTable.id),
      eq(projectMemberTable.user_id, userId),
    ))
    .where(and(
      eq(projectTable.id, projectId),
      eq(projectTable.organization_id, orgId),
    ))
    .limit(1)
  return record ? decryptSecret(record) : null
}
