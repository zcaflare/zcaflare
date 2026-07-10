import { z } from 'zod'
import { CreateAutoReplyPayloadSchema } from './_shared'

export const CreateAutoReplySchema = z.object({
  payload: CreateAutoReplyPayloadSchema,
})
export type CreateAutoReplyInput = z.infer<typeof CreateAutoReplySchema>
