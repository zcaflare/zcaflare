import { z } from 'zod'
import { GetGroupInviteBoxListPayloadSchema } from './_shared'

export const GetGroupInviteBoxListSchema = z.object({
  payload: GetGroupInviteBoxListPayloadSchema.optional(),
})
export type GetGroupInviteBoxListInput = z.infer<typeof GetGroupInviteBoxListSchema>
