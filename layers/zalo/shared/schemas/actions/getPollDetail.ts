import { z } from 'zod'

export const GetPollDetailSchema = z.object({
  pollId: z.number(),
})
export type GetPollDetailInput = z.infer<typeof GetPollDetailSchema>
