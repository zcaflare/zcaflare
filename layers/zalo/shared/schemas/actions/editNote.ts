import { z } from 'zod'
import { EditNoteOptionsSchema } from './_shared'

export const EditNoteSchema = z.object({
  options: EditNoteOptionsSchema,
  groupId: z.string(),
})
export type EditNoteInput = z.infer<typeof EditNoteSchema>
