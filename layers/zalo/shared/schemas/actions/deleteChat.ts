import { z } from 'zod'
import { DeleteChatLastMessageSchema, ThreadTypeSchema } from './_shared'

export const DeleteChatSchema = z.object({
  lastMessage: DeleteChatLastMessageSchema,
  threadId: z.string(),
  type: ThreadTypeSchema.optional(),
})
export type DeleteChatInput = z.infer<typeof DeleteChatSchema>
