import { z } from 'zod'
import { DeleteMessageDestinationSchema } from './_shared'

export const DeleteMessageSchema = z.object({
  dest: DeleteMessageDestinationSchema,
  onlyMe: z.boolean().optional(),
})
export type DeleteMessageInput = z.infer<typeof DeleteMessageSchema>
