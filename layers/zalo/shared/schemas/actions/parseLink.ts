import { z } from 'zod'

export const ParseLinkSchema = z.object({
  link: z.string(),
})
export type ParseLinkInput = z.infer<typeof ParseLinkSchema>
