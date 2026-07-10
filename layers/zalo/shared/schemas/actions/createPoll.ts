import { z } from 'zod'
import { CreatePollOptionsSchema } from './_shared'

export const CreatePollSchema = z.object({
  options: CreatePollOptionsSchema,
  groupId: z.string(),
})
export type CreatePollInput = z.infer<typeof CreatePollSchema>
