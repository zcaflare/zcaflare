import { z } from 'zod'

export const DeleteAutoReplySchema = z.object({
  id: z.number(),
})
export type DeleteAutoReplyInput = z.infer<typeof DeleteAutoReplySchema>
