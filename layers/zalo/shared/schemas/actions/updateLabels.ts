import { z } from 'zod'
import { UpdateLabelsPayloadSchema } from './_shared'

export const UpdateLabelsSchema = z.object({
  payload: UpdateLabelsPayloadSchema,
})
export type UpdateLabelsInput = z.infer<typeof UpdateLabelsSchema>
