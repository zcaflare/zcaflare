import { z } from 'zod'

export const GetGroupLinkDetailSchema = z.object({
  groupId: z.string(),
})
export type GetGroupLinkDetailInput = z.infer<typeof GetGroupLinkDetailSchema>
