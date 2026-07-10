import { z } from 'zod'
import { AttachmentSourceSchema } from './_shared'

export const ChangeAccountAvatarSchema = z.object({
  avatarSource: AttachmentSourceSchema,
})
export type ChangeAccountAvatarInput = z.infer<typeof ChangeAccountAvatarSchema>
