import { z } from 'zod'

export const LockPollSchema = z.object({
  pollId: z.number(),
})
export type LockPollInput = z.infer<typeof LockPollSchema>
