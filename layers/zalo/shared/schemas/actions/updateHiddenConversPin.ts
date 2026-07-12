import { z } from 'zod'

export const UpdateHiddenConversPinSchema = z.object({
  pin: z.string(),
})
export type UpdateHiddenConversPinInput = z.infer<typeof UpdateHiddenConversPinSchema>
