import { z } from 'zod'

export const GetGroupChatHistorySchema = z.object({
  groupId: z.string(),
  count: z.number().optional(),
})
export type GetGroupChatHistoryInput = z.infer<typeof GetGroupChatHistorySchema>
