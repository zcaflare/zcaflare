import { z } from 'zod'
import { ThreadTypeSchema } from './_shared'

export const SetHiddenConversationsSchema = z.object({
  hidden: z.boolean(),
  threadId: z.union([z.string(), z.array(z.string())]),
  type: ThreadTypeSchema.optional(),
})
export type SetHiddenConversationsInput = z.infer<typeof SetHiddenConversationsSchema>
