import { z } from 'zod'
import { ForwardMessagePayloadSchema, ThreadTypeSchema } from './_shared'

export const ForwardMessageSchema = z.object({
  payload: ForwardMessagePayloadSchema,
  threadIds: z.array(z.string()),
  type: ThreadTypeSchema.optional(),
})
export type ForwardMessageInput = z.infer<typeof ForwardMessageSchema>
