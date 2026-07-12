import { z } from 'zod'
import { GetCatalogListPayloadSchema } from './_shared'

export const GetCatalogListSchema = z.object({
  payload: GetCatalogListPayloadSchema.optional(),
})
export type GetCatalogListInput = z.infer<typeof GetCatalogListSchema>
