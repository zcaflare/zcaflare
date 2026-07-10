import { z } from 'zod'

export const InviteUserToGroupsSchema = z.object({
  userId: z.string(),
  groupId: z.union([z.string(), z.array(z.string())]),
})
export type InviteUserToGroupsInput = z.infer<typeof InviteUserToGroupsSchema>
