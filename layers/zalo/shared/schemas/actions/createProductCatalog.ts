import { z } from 'zod'
import { CreateProductCatalogPayloadSchema } from './_shared'

export const CreateProductCatalogSchema = z.object({
  payload: CreateProductCatalogPayloadSchema,
})
export type CreateProductCatalogInput = z.infer<typeof CreateProductCatalogSchema>
