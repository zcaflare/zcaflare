import { z } from 'zod'
import { EditReminderOptionsSchema, ThreadTypeSchema } from './_shared'

export const EditReminderSchema = z.object({
  options: EditReminderOptionsSchema,
  threadId: z.string(),
  type: ThreadTypeSchema.optional(),
})
export type EditReminderInput = z.infer<typeof EditReminderSchema>
