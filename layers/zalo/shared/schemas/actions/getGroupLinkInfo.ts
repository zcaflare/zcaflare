import { z } from 'zod'
import { GetGroupLinkInfoPayloadSchema } from './_shared'

export const GetGroupLinkInfoSchema = z.object({
  payload: GetGroupLinkInfoPayloadSchema,
})
export type GetGroupLinkInfoInput = z.infer<typeof GetGroupLinkInfoSchema>
