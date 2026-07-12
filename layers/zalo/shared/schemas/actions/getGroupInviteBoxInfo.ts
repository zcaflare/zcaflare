import { z } from 'zod'
import { GetGroupInviteBoxInfoPayloadSchema } from './_shared'

export const GetGroupInviteBoxInfoSchema = z.object({
  payload: GetGroupInviteBoxInfoPayloadSchema,
})
export type GetGroupInviteBoxInfoInput = z.infer<typeof GetGroupInviteBoxInfoSchema>
