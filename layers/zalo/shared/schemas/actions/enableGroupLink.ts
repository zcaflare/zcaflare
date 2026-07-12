import { z } from 'zod'

export const EnableGroupLinkSchema = z.object({
  groupId: z.string(),
})
export type EnableGroupLinkInput = z.infer<typeof EnableGroupLinkSchema>
