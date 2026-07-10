import { z } from 'zod'

export const GetQRSchema = z.object({
  userId: z.union([z.string(), z.array(z.string())]),
})
export type GetQRInput = z.infer<typeof GetQRSchema>
