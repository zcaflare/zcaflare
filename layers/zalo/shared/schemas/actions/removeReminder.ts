import { z } from 'zod'
import { ThreadTypeSchema } from './_shared'

export const RemoveReminderSchema = z.object({
  reminderId: z.string(),
  threadId: z.string(),
  type: ThreadTypeSchema.optional(),
})
export type RemoveReminderInput = z.infer<typeof RemoveReminderSchema>
