import { z } from 'zod'
import { ListBoardOptionsSchema } from './_shared'

export const GetListBoardSchema = z.object({
  options: ListBoardOptionsSchema,
  groupId: z.string(),
})
export type GetListBoardInput = z.infer<typeof GetListBoardSchema>
