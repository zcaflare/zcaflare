import { z } from 'zod'
import { DeleteProductCatalogPayloadSchema } from './_shared'

export const DeleteProductCatalogSchema = z.object({
  payload: DeleteProductCatalogPayloadSchema,
})
export type DeleteProductCatalogInput = z.infer<typeof DeleteProductCatalogSchema>
