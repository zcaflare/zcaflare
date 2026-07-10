import { z } from 'zod'

export const UndoFriendRequestSchema = z.object({
  friendId: z.string(),
})
export type UndoFriendRequestInput = z.infer<typeof UndoFriendRequestSchema>
