import { z } from 'zod'

export const GetAvatarListSchema = z.object({
  count: z.number().optional(),
  page: z.number().optional(),
})
export type GetAvatarListInput = z.infer<typeof GetAvatarListSchema>
