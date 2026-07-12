import { z } from 'zod'

export const SearchStickerSchema = z.object({
  keyword: z.string(),
  limit: z.number().optional(),
})
export type SearchStickerInput = z.infer<typeof SearchStickerSchema>
