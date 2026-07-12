import { z } from 'zod'
import { SendSeenEventMessageParamsSchema, ThreadTypeSchema } from './_shared'

export const SendSeenEventSchema = z.object({
  messages: z.union([SendSeenEventMessageParamsSchema, z.array(SendSeenEventMessageParamsSchema)]),
  type: ThreadTypeSchema.optional(),
})
export type SendSeenEventInput = z.infer<typeof SendSeenEventSchema>
