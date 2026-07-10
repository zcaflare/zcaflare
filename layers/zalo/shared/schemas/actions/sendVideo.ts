import { z } from 'zod'
import { SendVideoOptionsSchema, ThreadTypeSchema } from './_shared'

export const SendVideoSchema = z.object({
  options: SendVideoOptionsSchema,
  threadId: z.string(),
  type: ThreadTypeSchema.optional(),
})
export type SendVideoInput = z.infer<typeof SendVideoSchema>
