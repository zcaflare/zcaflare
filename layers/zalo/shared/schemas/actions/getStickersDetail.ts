import { z } from 'zod'

export const GetStickersDetailSchema = z.object({
  stickerIds: z.union([z.number(), z.array(z.number())]),
})
export type GetStickersDetailInput = z.infer<typeof GetStickersDetailSchema>
