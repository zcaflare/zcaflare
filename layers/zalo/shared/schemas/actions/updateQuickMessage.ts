import { z } from 'zod'
import { UpdateQuickMessagePayloadSchema } from './_shared'

export const UpdateQuickMessageSchema = z.object({
  updatePayload: UpdateQuickMessagePayloadSchema,
  itemId: z.number(),
})
export type UpdateQuickMessageInput = z.infer<typeof UpdateQuickMessageSchema>
