import { z } from 'zod'

export const GetStickerCategoryDetailSchema = z.object({
  cateId: z.number(),
})
export type GetStickerCategoryDetailInput = z.infer<typeof GetStickerCategoryDetailSchema>
