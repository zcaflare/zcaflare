import { z } from 'zod'

export const BlockUserSchema = z.object({
  userId: z.string(),
})
export type BlockUserInput = z.infer<typeof BlockUserSchema>
