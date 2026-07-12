import { z } from 'zod'

export const SendFriendRequestSchema = z.object({
  msg: z.string(),
  userId: z.string(),
})
export type SendFriendRequestInput = z.infer<typeof SendFriendRequestSchema>
