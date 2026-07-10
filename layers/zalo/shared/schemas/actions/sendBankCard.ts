import { z } from 'zod'
import { SendBankCardPayloadSchema, ThreadTypeSchema } from './_shared'

export const SendBankCardSchema = z.object({
  payload: SendBankCardPayloadSchema,
  threadId: z.string(),
  type: ThreadTypeSchema.optional(),
})
export type SendBankCardInput = z.infer<typeof SendBankCardSchema>
