import { z } from 'zod'

export const UpgradeGroupToCommunitySchema = z.object({
  groupId: z.string(),
})
export type UpgradeGroupToCommunityInput = z.infer<typeof UpgradeGroupToCommunitySchema>
