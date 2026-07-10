import { z } from 'zod'
import { UpdateGroupSettingsOptionsSchema } from './_shared'

export const UpdateGroupSettingsSchema = z.object({
  options: UpdateGroupSettingsOptionsSchema,
  groupId: z.string(),
})
export type UpdateGroupSettingsInput = z.infer<typeof UpdateGroupSettingsSchema>
