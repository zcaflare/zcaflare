import { z } from 'zod'

export const JoinGroupInviteBoxSchema = z.object({
  groupId: z.string(),
})
export type JoinGroupInviteBoxInput = z.infer<typeof JoinGroupInviteBoxSchema>
