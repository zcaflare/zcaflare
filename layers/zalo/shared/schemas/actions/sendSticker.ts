import { z } from 'zod'
import { SendStickerPayloadSchema, ThreadTypeSchema } from './_shared'

export const SendStickerSchema = z.object({
  sticker: SendStickerPayloadSchema,
  threadId: z.string(),
  type: ThreadTypeSchema.optional(),
})
export type SendStickerInput = z.infer<typeof SendStickerSchema>
