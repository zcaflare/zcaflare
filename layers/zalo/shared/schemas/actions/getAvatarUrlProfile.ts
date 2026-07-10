import { z } from 'zod'
import { AvatarSizeSchema } from './_shared'

export const GetAvatarUrlProfileSchema = z.object({
  friendIds: z.union([z.string(), z.array(z.string())]),
  avatarSize: AvatarSizeSchema.optional(),
})
export type GetAvatarUrlProfileInput = z.infer<typeof GetAvatarUrlProfileSchema>
