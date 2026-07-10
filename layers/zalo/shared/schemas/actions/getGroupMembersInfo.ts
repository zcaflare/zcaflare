import { z } from 'zod'

export const GetGroupMembersInfoSchema = z.object({
  memberId: z.union([z.string(), z.array(z.string())]),
})
export type GetGroupMembersInfoInput = z.infer<typeof GetGroupMembersInfoSchema>
