import { z } from 'zod'
import { UpdateCatalogPayloadSchema } from './_shared'

export const UpdateCatalogSchema = z.object({
  payload: UpdateCatalogPayloadSchema,
})
export type UpdateCatalogInput = z.infer<typeof UpdateCatalogSchema>
