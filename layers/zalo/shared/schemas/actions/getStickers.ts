import { z } from 'zod'

export const GetStickersSchema = z.object({
  keyword: z.string(),
})
export type GetStickersInput = z.infer<typeof GetStickersSchema>
