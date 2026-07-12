import { z } from 'zod'
import { AddPollOptionsPayloadSchema } from './_shared'

export const AddPollOptionsSchema = z.object({
  payload: AddPollOptionsPayloadSchema,
})
export type AddPollOptionsInput = z.infer<typeof AddPollOptionsSchema>
