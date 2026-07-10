import { z } from 'zod'
import { AvatarSizeSchema } from './_shared'

export const GetMultiUsersByPhonesSchema = z.object({
  phoneNumbers: z.union([z.string(), z.array(z.string())]),
  avatarSize: AvatarSizeSchema.optional(),
})
export type GetMultiUsersByPhonesInput = z.infer<typeof GetMultiUsersByPhonesSchema>
