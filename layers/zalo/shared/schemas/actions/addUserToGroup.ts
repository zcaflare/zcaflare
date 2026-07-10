import { z } from 'zod'

export const AddUserToGroupSchema = z.object({
  memberId: z.union([z.string(), z.array(z.string())]),
  groupId: z.string(),
})
export type AddUserToGroupInput = z.infer<typeof AddUserToGroupSchema>
