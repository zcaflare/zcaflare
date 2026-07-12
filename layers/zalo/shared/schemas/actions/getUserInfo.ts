import { z } from 'zod'
import { AvatarSizeSchema } from './_shared'

export const GetUserInfoSchema = z.object({
  userId: z.union([z.string(), z.array(z.string())]),
  avatarSize: AvatarSizeSchema.optional(),
})
export type GetUserInfoInput = z.infer<typeof GetUserInfoSchema>
