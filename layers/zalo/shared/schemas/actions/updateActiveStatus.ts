import { z } from 'zod'

export const UpdateActiveStatusSchema = z.object({
  active: z.boolean(),
})
export type UpdateActiveStatusInput = z.infer<typeof UpdateActiveStatusSchema>
