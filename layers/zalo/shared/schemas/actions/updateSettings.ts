import { z } from 'zod'
import { UpdateSettingsTypeSchema } from './_shared'

export const UpdateSettingsSchema = z.object({
  type: UpdateSettingsTypeSchema,
  value: z.number(),
})
export type UpdateSettingsInput = z.infer<typeof UpdateSettingsSchema>
