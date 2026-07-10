import { z } from 'zod'
import { UpdateLangAvailableLanguagesSchema } from './_shared'

export const UpdateLangSchema = z.object({
  language: UpdateLangAvailableLanguagesSchema.optional(),
})
export type UpdateLangInput = z.infer<typeof UpdateLangSchema>
