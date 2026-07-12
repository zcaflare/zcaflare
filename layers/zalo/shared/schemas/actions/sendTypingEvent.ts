import { z } from 'zod'
import { DestTypeSchema, ThreadTypeSchema } from './_shared'

export const SendTypingEventSchema = z.object({
  threadId: z.string(),
  type: ThreadTypeSchema.optional(),
  destType: DestTypeSchema.optional(),
})
export type SendTypingEventInput = z.infer<typeof SendTypingEventSchema>
