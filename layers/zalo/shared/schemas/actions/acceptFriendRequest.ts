import { z } from 'zod'

export const AcceptFriendRequestSchema = z.object({
  friendId: z.string(),
})
export type AcceptFriendRequestInput = z.infer<typeof AcceptFriendRequestSchema>
