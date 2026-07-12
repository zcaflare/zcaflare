import { z } from 'zod'

export const DeleteAvatarSchema = z.object({
  photoId: z.union([z.string(), z.array(z.string())]),
})
export type DeleteAvatarInput = z.infer<typeof DeleteAvatarSchema>
