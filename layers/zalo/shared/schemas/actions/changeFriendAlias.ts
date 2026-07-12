import { z } from 'zod'

export const ChangeFriendAliasSchema = z.object({
  alias: z.string(),
  friendId: z.string(),
})
export type ChangeFriendAliasInput = z.infer<typeof ChangeFriendAliasSchema>
