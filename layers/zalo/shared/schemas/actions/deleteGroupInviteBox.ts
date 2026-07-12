import { z } from 'zod'

export const DeleteGroupInviteBoxSchema = z.object({
  groupId: z.union([z.string(), z.array(z.string())]),
  blockFutureInvite: z.boolean().optional(),
})
export type DeleteGroupInviteBoxInput = z.infer<typeof DeleteGroupInviteBoxSchema>
