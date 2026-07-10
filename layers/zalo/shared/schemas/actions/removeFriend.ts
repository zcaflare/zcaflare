import { z } from 'zod'

export const RemoveFriendSchema = z.object({
  friendId: z.string(),
})
export type RemoveFriendInput = z.infer<typeof RemoveFriendSchema>
