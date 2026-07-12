import { z } from 'zod'

export const DeleteCatalogSchema = z.object({
  catalogId: z.string(),
})
export type DeleteCatalogInput = z.infer<typeof DeleteCatalogSchema>
