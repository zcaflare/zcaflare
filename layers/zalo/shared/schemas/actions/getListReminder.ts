import { z } from 'zod'
import { ListReminderOptionsSchema, ThreadTypeSchema } from './_shared'

export const GetListReminderSchema = z.object({
  options: ListReminderOptionsSchema,
  threadId: z.string(),
  type: ThreadTypeSchema.optional(),
})
export type GetListReminderInput = z.infer<typeof GetListReminderSchema>
