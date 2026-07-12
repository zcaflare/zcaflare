import { z } from 'zod'

export const DisableGroupLinkSchema = z.object({
  groupId: z.string(),
})
export type DisableGroupLinkInput = z.infer<typeof DisableGroupLinkSchema>
