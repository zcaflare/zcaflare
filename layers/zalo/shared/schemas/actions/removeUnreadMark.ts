import { z } from 'zod'
import { ThreadTypeSchema } from './_shared'

export const RemoveUnreadMarkSchema = z.object({
  threadId: z.string(),
  type: ThreadTypeSchema.optional(),
})
export type RemoveUnreadMarkInput = z.infer<typeof RemoveUnreadMarkSchema>
