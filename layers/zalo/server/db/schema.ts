import type { InferSelect } from '~~/server/db/types'
import { integer, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core'

export const zaloWebhookTable = sqliteTable('zalo_webhooks', {
  project_id: text('project_id').primaryKey().notNull(),
  session_id: text('session_id').notNull(),
  callback_url: text('callback_url').notNull(),
  secret_ciphertext: text('secret_ciphertext').notNull(),
  secret_iv: text('secret_iv').notNull(),
  created_at: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updated_at: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).$onUpdate(() => new Date()),
}, table => [
  uniqueIndex('zalo_webhooks_session_unique').on(table.session_id),
])
export type ZaloWebhook = InferSelect<typeof zaloWebhookTable>
