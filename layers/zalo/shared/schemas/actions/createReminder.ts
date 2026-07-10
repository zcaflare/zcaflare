import { z } from 'zod'
import { CreateReminderOptionsSchema, ThreadTypeSchema } from './_shared'

export const CreateReminderSchema = z.object({
  options: CreateReminderOptionsSchema,
  threadId: z.string(),
  type: ThreadTypeSchema.optional(),
})
export type CreateReminderInput = z.infer<typeof CreateReminderSchema>
