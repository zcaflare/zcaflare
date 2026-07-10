import { z } from 'zod'

export const GetPendingGroupMembersSchema = z.object({
  groupId: z.string(),
})
export type GetPendingGroupMembersInput = z.infer<typeof GetPendingGroupMembersSchema>
