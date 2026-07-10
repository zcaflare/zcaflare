import { z } from 'zod'

export const GetGroupInfoSchema = z.object({
  groupId: z.union([z.string(), z.array(z.string())]),
})
export type GetGroupInfoInput = z.infer<typeof GetGroupInfoSchema>
