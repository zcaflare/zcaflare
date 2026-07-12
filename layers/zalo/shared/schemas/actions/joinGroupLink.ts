import { z } from 'zod'

export const JoinGroupLinkSchema = z.object({
  link: z.string(),
})
export type JoinGroupLinkInput = z.infer<typeof JoinGroupLinkSchema>
