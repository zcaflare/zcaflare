import { z } from 'zod'
import { ThreadTypeSchema, UndoPayloadSchema } from './_shared'

export const UndoSchema = z.object({
  payload: UndoPayloadSchema,
  threadId: z.string(),
  type: ThreadTypeSchema.optional(),
})
export type UndoInput = z.infer<typeof UndoSchema>
