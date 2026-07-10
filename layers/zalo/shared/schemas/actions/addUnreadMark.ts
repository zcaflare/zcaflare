import { z } from 'zod'
import { ThreadTypeSchema } from './_shared'

export const AddUnreadMarkSchema = z.object({
  threadId: z.string(),
  type: ThreadTypeSchema.optional(),
})
export type AddUnreadMarkInput = z.infer<typeof AddUnreadMarkSchema>
