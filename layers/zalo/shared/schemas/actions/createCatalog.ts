import { z } from 'zod'

export const CreateCatalogSchema = z.object({
  catalogName: z.string(),
})
export type CreateCatalogInput = z.infer<typeof CreateCatalogSchema>
