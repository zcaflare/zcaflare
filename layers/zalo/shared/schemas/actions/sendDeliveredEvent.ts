import { z } from 'zod'
import { SendDeliveredEventMessageParamsSchema, ThreadTypeSchema } from './_shared'

export const SendDeliveredEventSchema = z.object({
  isSeen: z.boolean(),
  messages: z.union([SendDeliveredEventMessageParamsSchema, z.array(SendDeliveredEventMessageParamsSchema)]),
  type: ThreadTypeSchema.optional(),
})
export type SendDeliveredEventInput = z.infer<typeof SendDeliveredEventSchema>
