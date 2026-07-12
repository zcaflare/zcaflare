import { z } from 'zod'

export const UpdateProfileBioSchema = z.object({
  status: z.string(),
})
export type UpdateProfileBioInput = z.infer<typeof UpdateProfileBioSchema>
