import { z } from 'zod'
import { CreateGroupOptionsSchema } from './_shared'

export const CreateGroupSchema = z.object({
  options: CreateGroupOptionsSchema,
})
export type CreateGroupInput = z.infer<typeof CreateGroupSchema>
