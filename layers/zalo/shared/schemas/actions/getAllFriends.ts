import { z } from 'zod'
import { AvatarSizeSchema } from './_shared'

export const GetAllFriendsSchema = z.object({
  count: z.number().optional(),
  page: z.number().optional(),
  avatarSize: AvatarSizeSchema.optional(),
})
export type GetAllFriendsInput = z.infer<typeof GetAllFriendsSchema>
