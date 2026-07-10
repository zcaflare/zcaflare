import { z } from 'zod'

export const GetRelatedFriendGroupSchema = z.object({
  friendId: z.union([z.string(), z.array(z.string())]),
})
export type GetRelatedFriendGroupInput = z.infer<typeof GetRelatedFriendGroupSchema>
