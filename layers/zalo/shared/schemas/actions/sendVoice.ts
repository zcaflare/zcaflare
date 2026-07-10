import { z } from 'zod'
import { SendVoiceOptionsSchema, ThreadTypeSchema } from './_shared'

export const SendVoiceSchema = z.object({
  options: SendVoiceOptionsSchema,
  threadId: z.string(),
  type: ThreadTypeSchema.optional(),
})
export type SendVoiceInput = z.infer<typeof SendVoiceSchema>
