import { z } from 'zod'
import { ChatTTLSchema, ThreadTypeSchema } from './_shared'

export const UpdateAutoDeleteChatSchema = z.object({
  ttl: ChatTTLSchema,
  threadId: z.string(),
  type: ThreadTypeSchema.optional(),
})
export type UpdateAutoDeleteChatInput = z.infer<typeof UpdateAutoDeleteChatSchema>
