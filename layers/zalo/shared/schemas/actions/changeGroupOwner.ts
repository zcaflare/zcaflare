import { z } from 'zod'

export const ChangeGroupOwnerSchema = z.object({
  memberId: z.string(),
  groupId: z.string(),
})
export type ChangeGroupOwnerInput = z.infer<typeof ChangeGroupOwnerSchema>
