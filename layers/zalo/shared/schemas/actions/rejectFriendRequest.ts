import { z } from 'zod'

export const RejectFriendRequestSchema = z.object({
  friendId: z.string(),
})
export type RejectFriendRequestInput = z.infer<typeof RejectFriendRequestSchema>
