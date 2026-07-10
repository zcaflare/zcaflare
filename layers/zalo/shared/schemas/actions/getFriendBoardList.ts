import { z } from 'zod'

export const GetFriendBoardListSchema = z.object({
  conversationId: z.string(),
})
export type GetFriendBoardListInput = z.infer<typeof GetFriendBoardListSchema>
