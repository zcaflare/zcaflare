import type { ZaloWebhook } from '@nuxthub/db/schema'
import { db } from '@nuxthub/db'
import { projectMemberTable, zaloWebhookTable } from '@nuxthub/db/schema'
import { and, eq } from 'drizzle-orm'
import { decryptSecret, encryptSecret } from '~~/server/utils/crypto'

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
