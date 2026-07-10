import { z } from 'zod'

export const RemoveFriendAliasSchema = z.object({
  friendId: z.string(),
})
export type RemoveFriendAliasInput = z.infer<typeof RemoveFriendAliasSchema>
