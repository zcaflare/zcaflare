import { z } from 'zod'

export const RemoveGroupBlockedMemberSchema = z.object({
  memberId: z.union([z.string(), z.array(z.string())]),
  groupId: z.string(),
})
export type RemoveGroupBlockedMemberInput = z.infer<typeof RemoveGroupBlockedMemberSchema>
