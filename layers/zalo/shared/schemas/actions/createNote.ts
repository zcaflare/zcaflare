import { z } from 'zod'
import { CreateNoteOptionsSchema } from './_shared'

export const CreateNoteSchema = z.object({
  options: CreateNoteOptionsSchema,
  groupId: z.string(),
})
export type CreateNoteInput = z.infer<typeof CreateNoteSchema>
