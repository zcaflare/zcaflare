import { z } from 'zod'

export const GetFriendRequestStatusSchema = z.object({
  friendId: z.string(),
})
export type GetFriendRequestStatusInput = z.infer<typeof GetFriendRequestStatusSchema>
