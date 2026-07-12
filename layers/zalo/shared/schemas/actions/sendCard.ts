import { z } from 'zod'
import { SendCardOptionsSchema, ThreadTypeSchema } from './_shared'

export const SendCardSchema = z.object({
  options: SendCardOptionsSchema,
  threadId: z.string(),
  type: ThreadTypeSchema.optional(),
})
export type SendCardInput = z.infer<typeof SendCardSchema>
