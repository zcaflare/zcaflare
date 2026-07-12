import { z } from 'zod'
import { MessageContentSchema, ThreadTypeSchema } from './_shared'

export const SendMessageSchema = z.object({
  message: z.union([MessageContentSchema, z.string()]),
  threadId: z.string(),
  type: ThreadTypeSchema.optional(),
})
export type SendMessageInput = z.infer<typeof SendMessageSchema>
