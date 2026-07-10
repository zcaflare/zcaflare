import { z } from 'zod'
import { SendLinkOptionsSchema, ThreadTypeSchema } from './_shared'

export const SendLinkSchema = z.object({
  options: SendLinkOptionsSchema,
  threadId: z.string(),
  type: ThreadTypeSchema.optional(),
})
export type SendLinkInput = z.infer<typeof SendLinkSchema>
