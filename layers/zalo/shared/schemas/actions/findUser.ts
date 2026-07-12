import { z } from 'zod'
import { AvatarSizeSchema } from './_shared'

export const FindUserSchema = z.object({
  phoneNumber: z.string(),
  avatarSize: AvatarSizeSchema.optional(),
})
export type FindUserInput = z.infer<typeof FindUserSchema>
