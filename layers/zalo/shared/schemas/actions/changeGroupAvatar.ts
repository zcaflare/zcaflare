import { z } from 'zod'
import { AttachmentSourceSchema } from './_shared'

export const ChangeGroupAvatarSchema = z.object({
  avatarSource: AttachmentSourceSchema,
  groupId: z.string(),
})
export type ChangeGroupAvatarInput = z.infer<typeof ChangeGroupAvatarSchema>
