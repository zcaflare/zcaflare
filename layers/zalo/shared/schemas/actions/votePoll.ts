import { z } from 'zod'

export const VotePollSchema = z.object({
  pollId: z.number(),
  optionId: z.union([z.number(), z.array(z.number())]),
})
export type VotePollInput = z.infer<typeof VotePollSchema>
