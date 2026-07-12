import { z } from 'zod'
import { GetProductCatalogListPayloadSchema } from './_shared'

export const GetProductCatalogListSchema = z.object({
  payload: GetProductCatalogListPayloadSchema,
})
export type GetProductCatalogListInput = z.infer<typeof GetProductCatalogListSchema>
