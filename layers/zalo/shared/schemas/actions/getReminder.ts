import { z } from 'zod'

export const GetReminderSchema = z.object({
  reminderId: z.string(),
})
export type GetReminderInput = z.infer<typeof GetReminderSchema>
