import { z } from 'zod'

export const RemoveGroupDeputySchema = z.object({
  memberId: z.union([z.string(), z.array(z.string())]),
  groupId: z.string(),
})
export type RemoveGroupDeputyInput = z.infer<typeof RemoveGroupDeputySchema>
