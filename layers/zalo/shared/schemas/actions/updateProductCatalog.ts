import { z } from 'zod'
import { UpdateProductCatalogPayloadSchema } from './_shared'

export const UpdateProductCatalogSchema = z.object({
  payload: UpdateProductCatalogPayloadSchema,
})
export type UpdateProductCatalogInput = z.infer<typeof UpdateProductCatalogSchema>
