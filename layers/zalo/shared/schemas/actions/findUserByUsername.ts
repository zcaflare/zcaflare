import { z } from 'zod'
import { AvatarSizeSchema } from './_shared'

export const FindUserByUsernameSchema = z.object({
  username: z.string(),
  avatarSize: AvatarSizeSchema.optional(),
})
export type FindUserByUsernameInput = z.infer<typeof FindUserByUsernameSchema>
