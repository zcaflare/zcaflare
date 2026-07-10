import { z } from 'zod'

export const GetAliasListSchema = z.object({
  count: z.number().optional(),
  page: z.number().optional(),
})
export type GetAliasListInput = z.infer<typeof GetAliasListSchema>
