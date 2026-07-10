import { z } from 'zod'

export const ReuseAvatarSchema = z.object({
  photoId: z.string(),
})
export type ReuseAvatarInput = z.infer<typeof ReuseAvatarSchema>
