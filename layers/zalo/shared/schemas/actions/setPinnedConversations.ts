import { z } from 'zod'
import { ThreadTypeSchema } from './_shared'

export const SetPinnedConversationsSchema = z.object({
  pinned: z.boolean(),
  threadId: z.union([z.string(), z.array(z.string())]),
  type: ThreadTypeSchema.optional(),
})
export type SetPinnedConversationsInput = z.infer<typeof SetPinnedConversationsSchema>
