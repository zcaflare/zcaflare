import { z } from 'zod'
import { UpdateAutoReplyPayloadSchema } from './_shared'

export const UpdateAutoReplySchema = z.object({
  payload: UpdateAutoReplyPayloadSchema,
})
export type UpdateAutoReplyInput = z.infer<typeof UpdateAutoReplySchema>
