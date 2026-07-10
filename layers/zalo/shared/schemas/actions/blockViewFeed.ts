import { z } from 'zod'

export const BlockViewFeedSchema = z.object({
  isBlockFeed: z.boolean(),
  userId: z.string(),
})
export type BlockViewFeedInput = z.infer<typeof BlockViewFeedSchema>
