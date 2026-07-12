import { z } from 'zod'
import { UpdateArchivedChatListTargetSchema } from './_shared'

export const UpdateArchivedChatListSchema = z.object({
  isArchived: z.boolean(),
  conversations: z.union([UpdateArchivedChatListTargetSchema, z.array(UpdateArchivedChatListTargetSchema)]),
})
export type UpdateArchivedChatListInput = z.infer<typeof UpdateArchivedChatListSchema>
