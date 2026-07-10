import { z } from 'zod'
import { AddQuickMessagePayloadSchema } from './_shared'

export const AddQuickMessageSchema = z.object({
  addPayload: AddQuickMessagePayloadSchema,
})
export type AddQuickMessageInput = z.infer<typeof AddQuickMessageSchema>
