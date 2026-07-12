import { z } from 'zod'

export const AddGroupDeputySchema = z.object({
  memberId: z.union([z.string(), z.array(z.string())]),
  groupId: z.string(),
})
export type AddGroupDeputyInput = z.infer<typeof AddGroupDeputySchema>
