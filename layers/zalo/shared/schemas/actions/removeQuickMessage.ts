import { z } from 'zod'

export const RemoveQuickMessageSchema = z.object({
  itemIds: z.union([z.number(), z.array(z.number())]),
})
export type RemoveQuickMessageInput = z.infer<typeof RemoveQuickMessageSchema>
