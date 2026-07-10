import { z } from 'zod'

export const RemoveUserFromGroupSchema = z.object({
  memberId: z.union([z.string(), z.array(z.string())]),
  groupId: z.string(),
})
export type RemoveUserFromGroupInput = z.infer<typeof RemoveUserFromGroupSchema>
