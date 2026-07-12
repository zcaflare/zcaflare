import { z } from 'zod'

export const LeaveGroupSchema = z.object({
  groupId: z.string(),
  silent: z.boolean().optional(),
})
export type LeaveGroupInput = z.infer<typeof LeaveGroupSchema>
