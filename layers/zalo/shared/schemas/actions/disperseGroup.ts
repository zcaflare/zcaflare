import { z } from 'zod'

export const DisperseGroupSchema = z.object({
  groupId: z.string(),
})
export type DisperseGroupInput = z.infer<typeof DisperseGroupSchema>
