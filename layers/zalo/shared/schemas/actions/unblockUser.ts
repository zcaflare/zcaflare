import { z } from 'zod'

export const UnblockUserSchema = z.object({
  userId: z.string(),
})
export type UnblockUserInput = z.infer<typeof UnblockUserSchema>
