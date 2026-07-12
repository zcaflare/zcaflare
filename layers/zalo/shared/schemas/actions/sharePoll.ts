import { z } from 'zod'

export const SharePollSchema = z.object({
  pollId: z.number(),
})
export type SharePollInput = z.infer<typeof SharePollSchema>
