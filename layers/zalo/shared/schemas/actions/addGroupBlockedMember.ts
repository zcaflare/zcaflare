import { z } from 'zod'

export const AddGroupBlockedMemberSchema = z.object({
  memberId: z.union([z.string(), z.array(z.string())]),
  groupId: z.string(),
})
export type AddGroupBlockedMemberInput = z.infer<typeof AddGroupBlockedMemberSchema>
