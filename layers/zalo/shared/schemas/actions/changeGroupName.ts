import { z } from 'zod'

export const ChangeGroupNameSchema = z.object({
  name: z.string(),
  groupId: z.string(),
})
export type ChangeGroupNameInput = z.infer<typeof ChangeGroupNameSchema>
