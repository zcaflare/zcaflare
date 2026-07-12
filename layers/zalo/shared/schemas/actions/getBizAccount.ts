import { z } from 'zod'

export const GetBizAccountSchema = z.object({
  friendId: z.string(),
})
export type GetBizAccountInput = z.infer<typeof GetBizAccountSchema>
