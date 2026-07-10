import { z } from 'zod'
import { UpdateProfilePayloadSchema } from './_shared'

export const UpdateProfileSchema = z.object({
  payload: UpdateProfilePayloadSchema,
})
export type UpdateProfileInput = z.infer<typeof UpdateProfileSchema>
