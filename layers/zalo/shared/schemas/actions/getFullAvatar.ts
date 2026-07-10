import { z } from 'zod'

export const GetFullAvatarSchema = z.object({
  friendId: z.string(),
})
export type GetFullAvatarInput = z.infer<typeof GetFullAvatarSchema>
