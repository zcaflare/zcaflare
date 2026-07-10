import { z } from 'zod'

export const GetReminderResponsesSchema = z.object({
  reminderId: z.string(),
})
export type GetReminderResponsesInput = z.infer<typeof GetReminderResponsesSchema>
